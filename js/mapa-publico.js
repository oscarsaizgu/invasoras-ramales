import { CONFIG } from './config.js';

let map = null;
let markers = [];
let allReports = [];
let activeSpecies = null;

async function cargarReportes() {
  try {
    const resp = await fetch('data/reportes-publicos.json', { cache: 'no-store' });
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function initMap() {
  map = L.map('public-map').setView(CONFIG.mapaCenter, CONFIG.mapaZoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);
}

function pintarMarcadores(reportes) {
  markers.forEach(m => m.remove());
  markers = [];

  reportes.forEach(r => {
    if (typeof r.lat !== 'number' || typeof r.lon !== 'number') return;
    const marker = L.marker([r.lat, r.lon]).addTo(map);
    const fotosHtml = (r.fotos || []).slice(0, 1)
      .map(src => `<img src="${src}" alt="" style="width:100%;border-radius:6px;margin-top:6px;">`).join('');
    marker.bindPopup(`
      <strong>${r.especie || 'Especie sin identificar'}</strong><br>
      ${r.fecha ? new Date(r.fecha).toLocaleDateString('es-ES') : ''}<br>
      ${r.tamanyo || ''}
      ${fotosHtml}
    `);
    markers.push(marker);
  });
}

function aplicarFiltro() {
  const filtradas = activeSpecies
    ? allReports.filter(r => r.especie === activeSpecies)
    : allReports;
  pintarMarcadores(filtradas);
}

function initFiltros() {
  const chips = document.querySelectorAll('.map-filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      activeSpecies = chip.textContent.trim() === 'Todas' ? null : chip.textContent.trim();
      aplicarFiltro();
    });
  });
}

async function init() {
  initMap();
  initFiltros();
  allReports = await cargarReportes();

  const emptyState = document.getElementById('public-map-empty');
  if (!allReports.length) {
    emptyState.hidden = false;
  } else {
    pintarMarcadores(allReports);
  }
}

document.addEventListener('DOMContentLoaded', init);
