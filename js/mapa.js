import { CONFIG } from './config.js';
import { state, setNextEnabled } from './wizard.js';

let leafletMap = null;
let mapMarker = null;
let pendingLat = null;
let pendingLon = null;
let gpsLat = null;
let gpsLon = null;

export function initUbicacionStep() {
  document.getElementById('btn-abrir-mapa').addEventListener('click', openMapModal);
  document.getElementById('map-modal-close').addEventListener('click', closeMapModal);
  document.getElementById('map-confirm-btn').addEventListener('click', confirmMapLocation);
  setNextEnabled(!!(state.lat && state.lon));
  document.getElementById('lugar-desc').addEventListener('input', (e) => {
    state.lugarDesc = e.target.value;
  });
}

function setHint(text, cls) {
  const el = document.getElementById('map-hint');
  el.textContent = text;
  el.className = cls || '';
}

function openMapModal() {
  pendingLat = state.lat;
  pendingLon = state.lon;
  const confirmBtn = document.getElementById('map-confirm-btn');
  confirmBtn.disabled = true;

  document.getElementById('map-modal').classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    if (!leafletMap) {
      leafletMap = L.map('map').setView(CONFIG.mapaCenter, CONFIG.mapaZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(leafletMap);
      leafletMap.on('click', onMapClick);
    }
    leafletMap.invalidateSize();

    if (state.lat && state.lon) {
      const latlng = [parseFloat(state.lat), parseFloat(state.lon)];
      placeMarker(latlng);
      leafletMap.setView(latlng, 16);
      setHint('📍 Ubicación guardada. Puedes tocar el mapa para ajustarla.', 'ok');
      confirmBtn.disabled = false;
    } else {
      setHint('🔍 Buscando tu ubicación GPS…');
      requestGps();
    }
  }, 80);
}

function requestGps() {
  if (!navigator.geolocation) {
    setHint('El GPS no está disponible en este dispositivo. Toca en el mapa donde viste la planta.', 'err');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      gpsLat = pos.coords.latitude.toFixed(6);
      gpsLon = pos.coords.longitude.toFixed(6);
      pendingLat = gpsLat;
      pendingLon = gpsLon;
      const latlng = [parseFloat(gpsLat), parseFloat(gpsLon)];
      placeMarker(latlng);
      leafletMap.setView(latlng, 16);
      leafletMap.invalidateSize();
      setHint('📍 Ubicación detectada. Puedes tocar el mapa para ajustarla si hace falta.', 'ok');
      document.getElementById('map-confirm-btn').disabled = false;
    },
    err => {
      setHint('No hemos podido obtener tu ubicación. Puedes colocarla manualmente en el mapa.', 'err');
    },
    { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
  );
}

function placeMarker(latlng) {
  if (mapMarker) mapMarker.setLatLng(latlng);
  else mapMarker = L.marker(latlng, { draggable: true }).addTo(leafletMap).on('dragend', (e) => {
    const p = e.target.getLatLng();
    pendingLat = p.lat.toFixed(6);
    pendingLon = p.lng.toFixed(6);
    setHint('📍 Ubicación ajustada manualmente.', 'ok');
  });
}

function onMapClick(e) {
  pendingLat = e.latlng.lat.toFixed(6);
  pendingLon = e.latlng.lng.toFixed(6);
  placeMarker(e.latlng);
  setHint('📍 Ubicación seleccionada. Pulsa Confirmar cuando estés listo.', 'ok');
  document.getElementById('map-confirm-btn').disabled = false;
}

function closeMapModal() {
  document.getElementById('map-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function confirmMapLocation() {
  if (!pendingLat || !pendingLon) return;
  state.lat = pendingLat;
  state.lon = pendingLon;

  const res = document.getElementById('loc-result');
  res.textContent = (pendingLat === gpsLat && pendingLon === gpsLon)
    ? '📍 Ubicación GPS confirmada'
    : '📍 Ubicación confirmada en el mapa';
  res.className = 'loc-status ok';

  setNextEnabled(true);
  document.getElementById('btn-abrir-mapa').textContent = '📍 Ajustar ubicación';
  closeMapModal();
}

export function resetUbicacion() {
  pendingLat = null; pendingLon = null; gpsLat = null; gpsLon = null;
  if (mapMarker) { mapMarker.remove(); mapMarker = null; }
  const res = document.getElementById('loc-result');
  res.textContent = '';
  res.className = 'loc-status';
  document.getElementById('btn-abrir-mapa').textContent = '📍 Indicar ubicación en el mapa';
  setNextEnabled(false);
  document.getElementById('lugar-desc').value = '';
}
