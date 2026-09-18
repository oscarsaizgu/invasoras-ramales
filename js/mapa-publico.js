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
    foto: null, // el histórico de QGIS nunca tiene fotografía
    fuente: 'historico',
  };
}

// Histórico QGIS: se usa el GeoJSON PÚBLICO minimizado (solo ESPECIE,
// NOMBRE_COM y coordenadas — sin ID/FECHA_HORA/ALTITUD/OBSERVACIO/CODIGO ni
// ningún dato personal), nunca el original completo. Ver data/README.md.
async function cargarHistoricoQGIS() {
  try {
    const resp = await fetch('data/observaciones-qgis-publico.geojson', { cache: 'no-store' });
    if (!resp.ok) return [];
    const data = await resp.json();
    const features = Array.isArray(data.features) ? data.features : [];
    return features.map(adaptarFeatureQGIS).filter(Boolean);
  } catch (err) {
    return [];
  }
}

// La URL que guarda Apps Script (drive.google.com/uc?export=view&id=...)
// funciona al abrirla directamente, pero falla al usarla como <img src>
// embebido (naturalWidth/Height = 0 — comprobado). El endpoint de
// miniaturas de Drive sí funciona embebido, sin tocar Apps Script ni lo
// que hay guardado en Sheets: solo se reescribe la URL en el momento de
// pintar el mapa, a partir del mismo id de archivo.
function urlFotoEmbebible(url) {
  if (!url) return null;
  const m = String(url).match(/[?&]id=([^&]+)/);
  if (!m) return url; // formato inesperado: se deja tal cual en vez de romperlo
  return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000`;
}

// Los reportes ciudadanos se leen del propio backend (Apps Script → doGet),
// que ya filtra por Estado = Aprobado y ya expone SOLO campos públicos:
// { id, nombreComun, cientifico, lat, lon, foto }. Nunca nombre/email/
// observaciones — esos ni siquiera los lee leerReportesAprobados_() en
// Apps Script, así que no pueden llegar aquí aunque quisiéramos.
function adaptarReporteCiudadano(reporte) {
  if (!reporte || typeof reporte.lat !== 'number' || typeof reporte.lon !== 'number') return null;
  if (!reporte.cientifico) return null;
  return {
    especie: reporte.cientifico,
    nombreComun: reporte.nombreComun ? String(reporte.nombreComun).trim().toLowerCase() : null,
    lat: reporte.lat,
    lon: reporte.lon,
    foto: urlFotoEmbebible(reporte.foto),
    fuente: 'reportes',
  };
}

async function cargarReportesCiudadanos() {
  if (!CONFIG.reportesApiUrl) return [];
  try {
    const resp = await fetch(CONFIG.reportesApiUrl, { cache: 'no-store' });
    if (!resp.ok) return [];
    const data = await resp.json();
    const lista = Array.isArray(data) ? data : [];
    return lista.map(adaptarReporteCiudadano).filter(Boolean);
  } catch (err) {
    return [];
  }
}

// Categoría (herbácea/arbusto/árbol/acuática) para los chips de filtro, Y
// qué especies tienen ficha real en la guía botánica (para no ofrecer un
// enlace "Ver ficha" que no lleve a ningún sitio). Ambas cosas salen de la
// misma fuente (cantabria-flora.json), así que se calculan en una sola
// lectura — no se inventa ninguna clasificación nueva.
async function cargarDatosDeGuia() {
  try {
    const resp = await fetch('data/cantabria-flora.json', { cache: 'no-store' });
    if (!resp.ok) return { categorias: new Map(), especiesConFicha: new Set() };
    const data = await resp.json();
    const lista = Array.isArray(data) ? data : Object.values(data).flat();
    const categorias = new Map();
    const especiesConFicha = new Set();
    lista.forEach(entry => {
      if (!entry || !entry.cientifico) return;
      especiesConFicha.add(entry.cientifico);
      if (entry.categoria) categorias.set(entry.cientifico, entry.categoria);
    });
    return { categorias, especiesConFicha };
  } catch (err) {
    return { categorias: new Map(), especiesConFicha: new Set() };
  }
}

// ---------------------------------------------------------------------------
// Paleta natural por especie — estable entre fuentes: se construye una sola
// vez a partir de todas las especies combinadas (reportes + histórico), así
// que una especie usa siempre el mismo color venga de donde venga.
// ---------------------------------------------------------------------------

const HUES_NATURALES = [96, 150, 40, 25, 60, 200, 350, 120, 15, 70, 330, 170];

// Asigna color solo a las especies que todavía no lo tienen (el histórico
// se colorea más tarde, al cargarse de forma diferida, sin recolorear ni
// mover el color ya asignado a una especie de reportes ciudadanos).
function completarPaleta(paleta, especiesNuevas) {
  let i = paleta.size;
  especiesNuevas.forEach(especie => {
    if (paleta.has(especie)) return;
    const hue = HUES_NATURALES[i % HUES_NATURALES.length];
    const vuelta = Math.floor(i / HUES_NATURALES.length);
    const luz = 38 + (vuelta % 3) * 10; // 38%, 48%, 58% para variar repeticiones de matiz
    paleta.set(especie, `hsl(${hue}, 42%, ${luz}%)`);
    i++;
  });
}

// ---------------------------------------------------------------------------
// Mapa, agrupamiento y render
// ---------------------------------------------------------------------------

let map = null;
let coloresPorEspecie = new Map();
let categoriasPorEspecie = new Map();
let especiesConFicha = new Set();
let nombresComunesPorEspecie = new Map();
// fuente -> especie -> L.markerClusterGroup, para poder mostrar/ocultar el
// histórico entero sin tocar la capa de reportes ciudadanos.
let gruposPorFuente = { reportes: new Map(), historico: new Map() };
let activeCategoria = '';
let activeTexto = '';
let historicoVisible = false;
let historicoPromesaCarga = null; // evita descargar el GeoJSON más de una vez
let reportesCargados = []; // en caché para recalcular el nombre común combinado al cargar el histórico

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

function popupHtml(especie, nombreComun, foto) {
  const tieneFicha = especiesConFicha.has(especie);
  const enlaceFicha = `guia-botanica.html?especie=${encodeURIComponent(especie)}`;
  return `
    <div class="map-popup">
      ${foto ? `<img class="map-popup__foto" src="${foto}" alt="">` : ''}
      ${nombreComun ? `<strong class="map-popup__comun">${nombreComun}</strong>` : ''}
      <em class="map-popup__cientifico">${especie}</em>
      ${tieneFicha ? `<a class="map-popup__ficha" href="${enlaceFicha}">Ver ficha en la guía →</a>` : ''}
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
      // La foto es por observación (cada reporte ciudadano trae la suya);
      // el histórico de QGIS no tiene, o.foto es null y el popup la omite.
      marker.bindPopup(popupHtml(especie, nombreComun, o.foto));
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

// Carga diferida: el histórico (miles de puntos) NO se descarga al entrar
// en el mapa, solo la primera vez que se pulsa "Mostrar datos históricos".
// A partir de ahí queda en memoria (gruposPorFuente.historico ya
// construido) — ocultar/mostrar de nuevo solo añade/quita del mapa los
// grupos ya creados, sin volver a pedir el archivo.
async function cargarYConstruirHistoricoSiHaceFalta() {
  if (historicoPromesaCarga) return historicoPromesaCarga; // ya en curso o ya cargado

  historicoPromesaCarga = (async () => {
    const historico = await cargarHistoricoQGIS();

    const especiesHistorico = [...new Set(historico.map(o => o.especie))].sort((a, b) => a.localeCompare(b, 'es'));
    completarPaleta(coloresPorEspecie, especiesHistorico);

    // El nombre común combina reportes + histórico para las especies que
    // aparecen en ambos (mismo criterio que antes, solo que ahora en dos
    // fases porque el histórico llega más tarde).
    especiesHistorico.forEach(especie => {
      const propias = [...reportesCargados, ...historico].filter(o => o.especie === especie);
      nombresComunesPorEspecie.set(especie, nombreComunCanonico(propias));
    });

    construirGruposDeFuente(historico, 'historico');
  })();

  return historicoPromesaCarga;
}

function initToggleHistorico() {
  const boton = document.getElementById('map-toggle-historico');
  if (!boton) return;
  boton.addEventListener('click', async () => {
    historicoVisible = !historicoVisible;
    boton.textContent = historicoVisible ? '− Ocultar datos históricos' : '+ Mostrar datos históricos';
    boton.classList.toggle('is-active', historicoVisible);
    boton.setAttribute('aria-pressed', String(historicoVisible));

    if (historicoVisible) {
      boton.disabled = true;
      await cargarYConstruirHistoricoSiHaceFalta();
      boton.disabled = false;
    }
    aplicarFiltro();
  });
}

async function init() {
  initMap();
  const [reportes, datosGuia] = await Promise.all([
    cargarReportesCiudadanos(),
    cargarDatosDeGuia(),
  ]);
  categoriasPorEspecie = datosGuia.categorias;
  especiesConFicha = datosGuia.especiesConFicha;
  reportesCargados = reportes;

  const especies = [...new Set(reportes.map(o => o.especie))].sort((a, b) => a.localeCompare(b, 'es'));
  completarPaleta(coloresPorEspecie, especies);

  especies.forEach(especie => {
    const propias = reportes.filter(o => o.especie === especie);
    nombresComunesPorEspecie.set(especie, nombreComunCanonico(propias));
  });

  construirGruposDeFuente(reportes, 'reportes');

  initBuscador();
  initChips();
  initToggleHistorico();
  aplicarFiltro();
}

document.addEventListener('DOMContentLoaded', init);
