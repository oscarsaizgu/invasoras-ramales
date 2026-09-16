import { state, goTo, goBack, currentStep, setNextEnabled } from './wizard.js';
import { renderEspecies, especieDescripcionInput } from './especies.js';
import { renderFotoSlots } from './fotos.js';
import { initUbicacionStep } from './mapa.js';
import {
  renderTamanyos, initObservacionesStep, initContactoStep,
  renderRevision, enviarReporte, resetAll,
} from './formulario.js';
import { initCatalogo } from './catalogo.js';
import { initIdentificar } from './identificar.js';

function isStepValid(step) {
  switch (step) {
    case 'especie':
      if (!state.especie) return false;
      return true;
    case 'foto':
      return true; // la foto es recomendable pero no obligatoria
    case 'ubicacion':
      return !!(state.lat && state.lon);
    case 'cantidad':
      return !!state.tamanyo;
    case 'observaciones':
    case 'contacto':
      return true;
    default:
      return true;
  }
}

function enterStep(step) {
  if (step === 'revision') renderRevision();
  setNextEnabled(isStepValid(step));

  const nextBtn = document.getElementById('btn-siguiente');
  nextBtn.textContent = step === 'revision' ? 'Enviar reporte' : 'Continuar';
}

async function handleSiguiente() {
  const step = currentStep();

  if (step === 'especie') {
    state.especieDescripcion = especieDescripcionInput().value.trim();
  }

  if (step === 'revision') {
    const ok = await enviarReporte();
    if (ok) {
      goTo('exito', { record: false });
    }
    return;
  }

  const order = ['especie', 'foto', 'ubicacion', 'cantidad', 'observaciones', 'contacto', 'revision'];
  const idx = order.indexOf(step);
  const next = order[idx + 1];
  if (next) {
    goTo(next);
    enterStep(next);
  }
}

export function goToStepAndEnter(step) {
  goTo(step);
  enterStep(step);
}

// ── Menú de navegación (hamburguesa) ──
// Da acceso a las pantallas de contenido (Sobre el proyecto, Especies
// invasoras, Cómo hacer un buen reporte); no interviene en el flujo de
// reporte ni en su lógica de envío.
let menuHideTimer = null;

function openMenu() {
  const overlay = document.getElementById('menu-overlay');
  if (!overlay) return;
  clearTimeout(menuHideTimer);
  overlay.hidden = false;
  // Fuerza un reflow para que la transición de apertura se aplique de
  // forma síncrona (evita la carrera de un requestAnimationFrame si el
  // menú se cierra inmediatamente después de abrirse).
  void overlay.offsetWidth;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  const overlay = document.getElementById('menu-overlay');
  if (!overlay || overlay.hidden) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  clearTimeout(menuHideTimer);
  menuHideTimer = setTimeout(() => { overlay.hidden = true; }, 200);
}

function initMenu() {
  const menuBtn = document.getElementById('header-menu');
  const closeBtn = document.getElementById('menu-close');
  const overlay = document.getElementById('menu-overlay');
  if (!menuBtn || !overlay) return;

  menuBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

function init() {
  renderEspecies();
  renderFotoSlots();
  renderTamanyos();
  initUbicacionStep();
  initObservacionesStep();
  initContactoStep();
  initMenu();
  initCatalogo();
  initIdentificar();

  document.getElementById('btn-empezar').addEventListener('click', () => goToStepAndEnter('especie'));
  document.getElementById('header-back').addEventListener('click', () => {
    goBack();
    enterStep(currentStep());
  });
  document.getElementById('btn-siguiente').addEventListener('click', handleSiguiente);

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      closeMenu();
      goToStepAndEnter(el.dataset.goto);
    });
  });

  document.querySelectorAll('[data-edit-step]').forEach(el => {
    el.addEventListener('click', () => goToStepAndEnter(el.dataset.editStep));
  });

  document.getElementById('btn-reportar-otro').addEventListener('click', () => {
    resetAll();
    goTo('inicio', { record: false });
  });

  goTo('inicio', { record: false });
}

document.addEventListener('DOMContentLoaded', init);
