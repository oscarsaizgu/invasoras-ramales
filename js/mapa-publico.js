import { CONFIG } from './config.js';

// ---------------------------------------------------------------------------
// Fuentes de datos — "mapa vivo": reportes ciudadanos (capa principal, aún
// sin backend) + histórico de QGIS (capa secundaria, oculta por defecto).
//
// Cada observación, venga de donde venga, se normaliza a esta forma común:
// { especie, nombreComun, lat, lon, fuente }, con fuente = 'reportes' |
// 'historico'. Todo lo demás (color, agrupamiento, filtros, popup) trabaja
// solo con esa forma normalizada y no le importa el origen real. El día que
// haya un backend para reportar.html, cargarReportesCiudadanos() es la
// única función que hay que reescribir para que deje de devolver [].
// ---------------------------------------------------------------------------

function adaptarFeatureQGIS(feature) {
  if (!feature.geometry || feature.geometry.type !== 'Point') return null;
  const [lon, lat] = feature.geometry.coordinates;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  const props = feature.properties || {};
  if (!props.ESPECIE) return null;
  return {
    especie: props.ESPECIE,
    nombreComun: props.NOMBRE_COM ? props.NOMBRE_COM.trim().toLowerCase() : null,
    lat,
    lon,
    fuente: 'historico',
  };
}

async function cargarHistoricoQGIS() {
  try {
    const resp = await fetch('data/observaciones-qgis.geojson', { cache: 'no-store' });
    if (!resp.ok) return [];
    const data = await resp.json();
    const features = Array.isArray(data.features) ? data.features : [];
    return features.map(adaptarFeatureQGIS).filter(Boolean);
  } catch (err) {
    return [];
  }
}

// data/reportes-publicos.json está vacío a propósito (no hay backend
// todavía): esta función siempre devolverá [] hasta que exista uno. El
// formato de cada reporte aceptado documentado en data/README.md todavía no
// incluye el nombre científico, así que de momento solo se aceptan entradas
// que ya lo traigan explícito — no se inventa a partir del nombre común.
function adaptarReporteCiudadano(reporte) {
  if (!reporte || typeof reporte.lat !== 'number' || typeof reporte.lon !== 'number') return null;
  if (!reporte.especieCientifica) return null;
  return {
    especie: reporte.especieCientifica,
    nombreComun: reporte.especie ? String(reporte.especie).trim().toLowerCase() : null,
    lat: reporte.lat,
    lon: reporte.lon,
    fuente: 'reportes',
  };
}

async function cargarReportesCiudadanos() {
  try {
    const resp = await fetch('data/reportes-publicos.json', { cache: 'no-store' });
    if (!resp.ok) return [];
    const data = await resp.json();
    const lista = Array.isArray(data) ? data : [];
    return lista.map(adaptarReporteCiudadano).filter(Boolean);
  } catch (err) {
    return [];
  }
}

// Categoría (herbácea/arbusto/árbol/acuática) para los chips de filtro: se
// reutiliza el campo "categoria" ya existente en la guía botánica, no se
// inventa una clasificación nueva. Si una especie no está todavía
// documentada allí, simplemente no aparece al filtrar por tipo (sigue
// visible en "Todas").
async function cargarCategoriasPorEspecie() {
  try {
    const resp = await fetch('data/cantabria-flora.json', { cache: 'no-store' });
    if (!resp.ok) return new Map();
    const data = await resp.json();
    const lista = Array.isArray(data) ? data : Object.values(data).flat();
    const mapa = new Map();
    lista.forEach(entry => {
      if (entry && entry.cientifico && entry.categoria) {
        mapa.set(entry.cientifico, entry.categoria);
      }
    });
    return mapa;
  } catch (err) {
    return new Map();
  }
}

// ---------------------------------------------------------------------------
// Paleta natural por especie — estable entre fuentes: se construye una sola
// vez a partir de todas las especies combinadas (reportes + histórico), así
// que una especie usa siempre el mismo color venga de donde venga.
// ---------------------------------------------------------------------------

const HUES_NATURALES = [96, 150, 40, 25, 60, 200, 350, 120, 15, 70, 330, 170];

function construirPaleta(especies) {
  const paleta = new Map();
  especies.forEach((especie, i) => {
    const hue = HUES_NATURALES[i % HUES_NATURALES.length];
    const vuelta = Math.floor(i / HUES_NATURALES.length);
    const luz = 38 + (vuelta % 3) * 10; // 38%, 48%, 58% para variar repeticiones de matiz
    paleta.set(especie, `hsl(${hue}, 42%, ${luz}%)`);
  });
  return paleta;
}

// ---------------------------------------------------------------------------
// Mapa, agrupamiento y render
// ---------------------------------------------------------------------------

let map = null;
let coloresPorEspecie = new Map();
let categoriasPorEspecie = new Map();
let nombresComunesPorEspecie = new Map();
// fuente -> especie -> L.markerClusterGroup, para poder mostrar/ocultar el
// histórico entero sin tocar la capa de reportes ciudadanos.
let gruposPorFuente = { reportes: new Map(), historico: new Map() };
let activeCategoria = '';
let activeTexto = '';
let historicoVisible = false;

function initMap() {
  map = L.map('public-map').setView(CONFIG.mapaCenter, CONFIG.mapaZoom);
  // Vista satélite (Esri World Imagery, gratuita y sin clave de API).
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxZoom: 19,
  }).addTo(map);
}

function nombreComunCanonico(observaciones) {
  const conteo = new Map();
  observaciones.forEach(o => {
    if (!o.nombreComun) return;
    conteo.set(o.nombreComun, (conteo.get(o.nombreComun) || 0) + 1);
  });
  let mejor = '';
  let max = 0;
  conteo.forEach((n, valor) => {
    if (n > max) { max = n; mejor = valor; }
  });
  return mejor ? mejor.charAt(0).toUpperCase() + mejor.slice(1) : '';
}

function iconoPuntoHtml(color) {
  return L.divIcon({
    className: '',
    html: `<span class="map-marker-dot" style="display:block;width:100%;height:100%;background:${color};"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function iconoClusterHtml(color) {
  return function (cluster) {
    const n = cluster.getChildCount();
    const size = n < 10 ? 30 : n < 50 ? 38 : n < 200 ? 46 : 54;
    return L.divIcon({
      className: 'map-cluster-icon',
      html: `<span style="background:${color};width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;">${n}</span>`,
      iconSize: [size, size],
    });
  };
}

function popupHtml(especie, nombreComun) {
  const enlaceFicha = `guia-botanica.html?especie=${encodeURIComponent(especie)}`;
  return `
    <div class="map-popup">
      ${nombreComun ? `<strong class="map-popup__comun">${nombreComun}</strong>` : ''}
      <em class="map-popup__cientifico">${especie}</em>
      <a class="map-popup__ficha" href="${enlaceFicha}">Ver ficha en la guía →</a>
    </div>
  `;
}

// Construye, para una fuente concreta, un grupo de clúster por especie.
// Los grupos se guardan pero NO se añaden al mapa aquí: quién está visible
// lo decide siempre aplicarFiltro().
function construirGruposDeFuente(observaciones, fuente) {
  const porEspecie = new Map();
  observaciones.forEach(o => {
    if (!porEspecie.has(o.especie)) porEspecie.set(o.especie, []);
    porEspecie.get(o.especie).push(o);
  });

  porEspecie.forEach((propias, especie) => {
    const color = coloresPorEspecie.get(especie);
    const grupo = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: iconoClusterHtml(color),
    });

    const nombreComun = nombresComunesPorEspecie.get(especie) || '';
    propias.forEach(o => {
      const marker = L.marker([o.lat, o.lon], { icon: iconoPuntoHtml(color) });
      marker.bindPopup(popupHtml(especie, nombreComun));
      grupo.addLayer(marker);
    });

    gruposPorFuente[fuente].set(especie, grupo);
  });
}

function especieCoincide(especie) {
  const coincideCategoria = !activeCategoria || categoriasPorEspecie.get(especie) === activeCategoria;
  if (!coincideCategoria) return false;
  if (!activeTexto) return true;
  const cientifico = especie.toLowerCase();
  const comun = (nombresComunesPorEspecie.get(especie) || '').toLowerCase();
  return cientifico.includes(activeTexto) || comun.includes(activeTexto);
}

function contarMarcadoresVisibles() {
  let total = 0;
  map.eachLayer(layer => {
    if (layer.getLayers && typeof layer.getLayers === 'function') {
      total += layer.getLayers().length;
    }
  });
  return total;
}

function actualizarVacio() {
  const overlay = document.getElementById('map-vacio');
  if (!overlay) return;
  overlay.hidden = contarMarcadoresVisibles() > 0;
}

function aplicarFiltro() {
  gruposPorFuente.reportes.forEach((grupo, especie) => {
    const debeMostrarse = especieCoincide(especie);
    const yaEnMapa = map.hasLayer(grupo);
    if (debeMostrarse && !yaEnMapa) map.addLayer(grupo);
    if (!debeMostrarse && yaEnMapa) map.removeLayer(grupo);
  });
  gruposPorFuente.historico.forEach((grupo, especie) => {
    const debeMostrarse = historicoVisible && especieCoincide(especie);
    const yaEnMapa = map.hasLayer(grupo);
    if (debeMostrarse && !yaEnMapa) map.addLayer(grupo);
    if (!debeMostrarse && yaEnMapa) map.removeLayer(grupo);
  });
  actualizarVacio();
}

function initBuscador() {
  const contenedor = document.querySelector('.map-controles .catalogo-buscador');
  const input = document.getElementById('map-buscador');
  if (!input || !contenedor) return;

  input.addEventListener('focus', () => contenedor.classList.add('is-activo'));
  input.addEventListener('blur', () => {
    if (!input.value) contenedor.classList.remove('is-activo');
  });
  input.addEventListener('input', () => {
    activeTexto = input.value.trim().toLowerCase();
    aplicarFiltro();
  });
}

function initChips() {
  const contenedor = document.getElementById('map-chips');
  if (!contenedor) return;
  const chips = [...contenedor.querySelectorAll('.catalogo-filtro')];
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeCategoria = chip.dataset.categoria || '';
      aplicarFiltro();
    });
  });
}

function initToggleHistorico() {
  const boton = document.getElementById('map-toggle-historico');
  if (!boton) return;
  boton.addEventListener('click', () => {
    historicoVisible = !historicoVisible;
    boton.textContent = historicoVisible ? '− Ocultar datos históricos' : '+ Mostrar datos históricos';
    boton.classList.toggle('is-active', historicoVisible);
    boton.setAttribute('aria-pressed', String(historicoVisible));
    aplicarFiltro();
  });
}

async function init() {
  initMap();
  const [reportes, historico, categorias] = await Promise.all([
    cargarReportesCiudadanos(),
    cargarHistoricoQGIS(),
    cargarCategoriasPorEspecie(),
  ]);
  categoriasPorEspecie = categorias;

  const todas = [...reportes, ...historico];
  const especies = [...new Set(todas.map(o => o.especie))].sort((a, b) => a.localeCompare(b, 'es'));
  coloresPorEspecie = construirPaleta(especies);

  especies.forEach(especie => {
    const propias = todas.filter(o => o.especie === especie);
    nombresComunesPorEspecie.set(especie, nombreComunCanonico(propias));
  });

  construirGruposDeFuente(reportes, 'reportes');
  construirGruposDeFuente(historico, 'historico');

  initBuscador();
  initChips();
  initToggleHistorico();
  aplicarFiltro();
}

document.addEventListener('DOMContentLoaded', init);
