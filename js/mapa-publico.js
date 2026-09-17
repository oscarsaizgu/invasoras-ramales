import { CONFIG } from './config.js';

// ---------------------------------------------------------------------------
// Fuentes de datos
//
// Hoy el mapa solo pinta el histórico de QGIS. Cada observación, venga de
// donde venga, se normaliza a esta forma común antes de llegar al resto del
// código: { especie, nombreComun, lat, lon }. El día que se conecten los
// reportes ciudadanos de reportar.html, basta con añadir un adaptador
// equivalente (p.ej. adaptarReporteCiudadano) y combinar ambos arrays en
// cargarObservaciones() — el resto del mapa (color, agrupamiento, filtros,
// popup, estadísticas) no necesita cambiar. Esa es la idea de fondo:
// datos históricos + futuros reportes de la gente = mapa vivo.
// ---------------------------------------------------------------------------

function adaptarFeatureQGIS(feature) {
  if (!feature.geometry || feature.geometry.type !== 'Point') return null;
  const [lon, lat] = feature.geometry.coordinates;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  const props = feature.properties || {};
  return {
    especie: props.ESPECIE || null,
    nombreComun: props.NOMBRE_COM ? props.NOMBRE_COM.trim().toLowerCase() : null,
    lat,
    lon,
  };
}

async function cargarHistoricoQGIS() {
  try {
    const resp = await fetch('data/observaciones-qgis.geojson', { cache: 'no-store' });
    if (!resp.ok) return [];
    const data = await resp.json();
    const features = Array.isArray(data.features) ? data.features : [];
    return features.map(adaptarFeatureQGIS).filter(Boolean).filter(o => o.especie);
  } catch (err) {
    return [];
  }
}

async function cargarObservaciones() {
  // Fase futura: fusionar aquí el histórico con los reportes ciudadanos
  // ya aceptados (data/reportes-publicos.json), una vez tengan coordenadas
  // y especie confirmadas.
  return cargarHistoricoQGIS();
}

// Categoría (herbácea/arbusto/árbol/acuática) para los chips de filtro: se
// reutiliza el campo "categoria" ya existente en la guía botánica, no se
// inventa una clasificación nueva. Si una especie del histórico de QGIS no
// está todavía documentada allí, simplemente no aparece al filtrar por tipo
// (sigue visible en "Todas").
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
// Paleta natural por especie
// ---------------------------------------------------------------------------

// Tonos coherentes con la identidad de Ramales Natural: verdes, verdes
// oscuros, ocres, tierras, marrones suaves y algún rojizo/rosado para
// diferenciar. Nada de colores fluorescentes ni saturados.
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
let gruposPorEspecie = new Map(); // especie -> L.markerClusterGroup
let observacionesPorEspecie = new Map(); // especie -> array normalizado
let activeCategoria = '';
let activeTexto = '';

function initMap() {
  map = L.map('public-map').setView(CONFIG.mapaCenter, CONFIG.mapaZoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
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

function construirGrupos(observaciones) {
  const especies = [...new Set(observaciones.map(o => o.especie))].sort((a, b) => a.localeCompare(b, 'es'));
  coloresPorEspecie = construirPaleta(especies);

  especies.forEach(especie => {
    const propias = observaciones.filter(o => o.especie === especie);
    observacionesPorEspecie.set(especie, propias);

    const color = coloresPorEspecie.get(especie);
    const grupo = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: iconoClusterHtml(color),
    });

    // El nombre común se toma del valor más frecuente para la especie, no del
    // registro individual: el campo NOMBRE_COM del GeoPackage es texto libre
    // por observación y a menudo contiene anotaciones de campo ("sin flor",
    // "fin del area continua"...) en vez de un nombre común real.
    const nombreComun = nombreComunCanonico(propias);
    nombresComunesPorEspecie.set(especie, nombreComun);

    propias.forEach(o => {
      const marker = L.marker([o.lat, o.lon], { icon: iconoPuntoHtml(color) });
      marker.bindPopup(popupHtml(especie, nombreComun));
      grupo.addLayer(marker);
    });

    gruposPorEspecie.set(especie, grupo);
  });

  return especies;
}

function especieCoincide(especie) {
  const coincideCategoria = !activeCategoria || categoriasPorEspecie.get(especie) === activeCategoria;
  if (!coincideCategoria) return false;
  if (!activeTexto) return true;
  const cientifico = especie.toLowerCase();
  const comun = (nombresComunesPorEspecie.get(especie) || '').toLowerCase();
  return cientifico.includes(activeTexto) || comun.includes(activeTexto);
}

function aplicarFiltro() {
  gruposPorEspecie.forEach((grupo, especie) => {
    const debeMostrarse = especieCoincide(especie);
    const yaEnMapa = map.hasLayer(grupo);
    if (debeMostrarse && !yaEnMapa) map.addLayer(grupo);
    if (!debeMostrarse && yaEnMapa) map.removeLayer(grupo);
  });
}

function initBuscador() {
  const input = document.getElementById('map-buscador');
  if (!input) return;
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

function actualizarEstadisticas(numEspecies) {
  const el = document.getElementById('map-stat-especies');
  if (el) el.textContent = String(numEspecies);
}

async function init() {
  initMap();
  const [observaciones, categorias] = await Promise.all([
    cargarObservaciones(),
    cargarCategoriasPorEspecie(),
  ]);
  categoriasPorEspecie = categorias;

  const emptyState = document.getElementById('public-map-empty');
  if (!observaciones.length) {
    emptyState.hidden = false;
    return;
  }

  const especies = construirGrupos(observaciones);
  actualizarEstadisticas(especies.length);
  initBuscador();
  initChips();
  aplicarFiltro();
}

document.addEventListener('DOMContentLoaded', init);
