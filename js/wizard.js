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

export const STEPS = STEP_ORDER;

function updateChrome(name) {
  const header = document.getElementById('app-header');
  const backBtn = document.getElementById('header-back');
  const progressWrap = document.getElementById('progress-wrap');
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');
  const footer = document.getElementById('app-footer');
  const nav = document.getElementById('wizard-nav');

  const isChrome = name !== 'inicio' && name !== 'exito';
  backBtn.hidden = !isChrome || history.length === 0;
  footer.hidden = isChrome;

  const stepIndex = STEP_ORDER.indexOf(name);
  if (stepIndex >= 0) {
    progressWrap.hidden = false;
    const pct = ((stepIndex + 1) / STEP_ORDER.length) * 100;
    progressFill.style.width = pct + '%';
    progressLabel.textContent = `Paso ${stepIndex + 1} de ${STEP_ORDER.length}`;
  } else {
    progressWrap.hidden = true;
  }

  nav.hidden = (name === 'inicio' || name === 'exito');
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
  history.length = 0;
}
