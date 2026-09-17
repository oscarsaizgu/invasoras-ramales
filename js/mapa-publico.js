import { CONFIG } from './config.js';

// ---------------------------------------------------------------------------
// Fuentes de datos
//
// Hoy el mapa solo pinta el histórico de QGIS. Cada observación, venga de
// donde venga, se normaliza a esta forma común antes de llegar al resto del
// código: { especie, nombreComun, lat, lon }. El día que se conecten los
// reportes ciudadanos de reportar.html, basta con añadir un adaptador
// equivalente (p.ej. adaptarReporteCiudadano) y combinar ambos arrays en
// cargarObservaciones() — el resto del mapa (color, agrupamiento, filtro,
// popup) no necesita cambiar.
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
let gruposPorEspecie = new Map(); // especie -> L.markerClusterGroup
let observacionesPorEspecie = new Map(); // especie -> array normalizado
let activeSpecies = '';

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
  return `
    <div class="map-popup">
      ${nombreComun ? `<strong class="map-popup__comun">${nombreComun}</strong>` : ''}
      <em class="map-popup__cientifico">${especie}</em>
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
    propias.forEach(o => {
      const marker = L.marker([o.lat, o.lon], { icon: iconoPuntoHtml(color) });
      marker.bindPopup(popupHtml(especie, nombreComun));
      grupo.addLayer(marker);
    });

    gruposPorEspecie.set(especie, grupo);
  });

  return especies;
}

function actualizarContador() {
  const contador = document.getElementById('map-counter');
  if (!contador) return;
  const numEspecies = observacionesPorEspecie.size;

  if (activeSpecies) {
    const n = (observacionesPorEspecie.get(activeSpecies) || []).length;
    contador.textContent = `${n} observaciones`;
  } else {
    let total = 0;
    observacionesPorEspecie.forEach(arr => { total += arr.length; });
    contador.textContent = `${numEspecies} especies · ${total} observaciones`;
  }
}

function actualizarSwatch() {
  const swatch = document.getElementById('map-species-swatch');
  if (!swatch) return;
  if (activeSpecies) {
    swatch.style.background = coloresPorEspecie.get(activeSpecies) || 'transparent';
    swatch.hidden = false;
  } else {
    swatch.hidden = true;
  }
}

function aplicarFiltro() {
  gruposPorEspecie.forEach((grupo, especie) => {
    const debeMostrarse = !activeSpecies || especie === activeSpecies;
    const yaEnMapa = map.hasLayer(grupo);
    if (debeMostrarse && !yaEnMapa) map.addLayer(grupo);
    if (!debeMostrarse && yaEnMapa) map.removeLayer(grupo);
  });
  actualizarContador();
  actualizarSwatch();
}

function initFiltro(especies) {
  const select = document.getElementById('map-species-select');
  if (!select) return;

  especies.forEach(especie => {
    const option = document.createElement('option');
    option.value = especie;
    option.textContent = especie;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    activeSpecies = select.value;
    aplicarFiltro();
  });
}

async function init() {
  initMap();
  const observaciones = await cargarObservaciones();

  const emptyState = document.getElementById('public-map-empty');
  if (!observaciones.length) {
    emptyState.hidden = false;
    return;
  }

  const especies = construirGrupos(observaciones);
  initFiltro(especies);
  aplicarFiltro();
}

document.addEventListener('DOMContentLoaded', init);
