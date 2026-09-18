// Motor del asistente paso a paso: controla qué pantalla se muestra,
// el indicador de progreso y la navegación adelante/atrás.

const STEP_ORDER = ['especie', 'foto', 'ubicacion', 'cantidad', 'observaciones', 'contacto', 'revision'];

export const state = {
  especie: '',
  especieNombre: '',
  especieEsOtra: false,
  especieDescripcion: '',
  fotos: [], // { file, dataUrl }
  lat: null,
  lon: null,
  lugarDesc: '',
  tamanyo: '',
  tamanyoTitulo: '',
  observaciones: '',
  nombre: '',
  email: '',
  // Resultado de Pl@ntNet, si el reporte viene de una identificación real
  // en identificar.html (ver catalogo.js → seleccionarEspecieParaReportar
  // y reportar.js → leerIdentificacionPlantNet). Vacíos si se entra
  // directo a reportar.html: el reporte se envía igual, sin estos datos.
  plantnetScientific: '',
  plantnetConfidence: null,
  plantnetResults: '',
  // Nombre común que devuelve Pl@ntNet junto al científico (si lo trae).
  // Solo se usa como sugerencia informativa y, cuando el usuario elige
  // "Otra / No sé", como el nombre común que se guarda en Sheets.
  plantnetNombreComun: '',
};

let currentScreen = 'inicio';
const history = [];

function screenEl(name) {
  return document.getElementById('screen-' + name);
}

export function goTo(name, { record = true } = {}) {
  const from = screenEl(currentScreen);
  const to = screenEl(name);
  if (!to) return;
  if (from) from.classList.remove('is-active');
  to.classList.add('is-active');
  if (record && currentScreen !== name) history.push(currentScreen);
  currentScreen = name;
  updateChrome(name);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  to.querySelector('h1, h2, .step-question')?.focus?.();
}

export function goBack() {
  const prev = history.pop();
  if (prev) goTo(prev, { record: false });
}

export function currentStep() {
  return currentScreen;
}

export function setNextEnabled(enabled) {
  const btn = document.getElementById('btn-siguiente');
  if (btn) btn.disabled = !enabled;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function updateChrome(name) {
  const backBtn = document.getElementById('header-back');
  const menuBtn = document.getElementById('header-menu');
  const progressWrap = document.getElementById('progress-wrap');
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');
  const footer = document.getElementById('app-footer');
  const nav = document.getElementById('wizard-nav');

  const isChrome = name !== 'inicio' && name !== 'exito';
  const isWizardStep = STEP_ORDER.includes(name);

  backBtn.hidden = !isChrome || history.length === 0;
  // El menú de navegación queda oculto durante el recorrido guiado del
  // reporte, para que cada pantalla tenga una única acción principal.
  if (menuBtn) menuBtn.hidden = isWizardStep;
  footer.hidden = isWizardStep;
  nav.hidden = !isWizardStep;

  const stepIndex = STEP_ORDER.indexOf(name);
  if (stepIndex >= 0) {
    progressWrap.hidden = false;
    const pct = ((stepIndex + 1) / STEP_ORDER.length) * 100;
    progressFill.style.width = pct + '%';
    progressLabel.textContent = `${pad2(stepIndex + 1)} / ${pad2(STEP_ORDER.length)}`;
  } else {
    progressWrap.hidden = true;
    progressLabel.textContent = '';
  }
}

export function resetWizard() {
  state.especie = '';
  state.especieNombre = '';
  state.especieEsOtra = false;
  state.especieDescripcion = '';
  state.fotos = [];
  state.lat = null;
  state.lon = null;
  state.lugarDesc = '';
  state.tamanyo = '';
  state.tamanyoTitulo = '';
  state.observaciones = '';
  state.nombre = '';
  state.email = '';
  state.plantnetScientific = '';
  state.plantnetConfidence = null;
  state.plantnetResults = '';
  state.plantnetNombreComun = '';
  history.length = 0;
}
