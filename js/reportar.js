// Asistente de reporte (7 pasos). Vive solo en reportar.html: antes este
// código estaba dentro de app.js, pero ahora que el reporte tiene su
// propia página ya no hace falta que conviva con el menú, el catálogo ni
// la identificación.
import { state, goTo, goBack, currentStep, setNextEnabled } from './wizard.js';
import { renderEspecies, especieDescripcionInput } from './especies.js';
import { renderFotoSlots } from './fotos.js';
import { initUbicacionStep } from './mapa.js';
import {
  renderTamanyos, initObservacionesStep, initContactoStep,
  renderRevision, enviarReporte, resetAll,
} from './formulario.js';

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

function goToStepAndEnter(step) {
  goTo(step);
  enterStep(step);
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

// Si se llega desde la identificación con Pl@ntNet o desde la ficha de
// una especie del catálogo (reportar.html?especie=Nombre+cientifico),
// preselecciona esa especie tal como hacía antes seleccionarEspecieParaReportar()
// en catalogo.js, cuando todo vivía en la misma página.
function preseleccionarEspecieDesdeUrl() {
  const params = new URLSearchParams(window.location.search);
  const cientifico = params.get('especie');
  if (!cientifico) return;

  const boton = document.querySelector(`.species-btn[data-especie="${CSS.escape(cientifico)}"]`);
  if (boton) {
    boton.click();
  } else {
    const otraBtn = document.querySelector('.species-btn--other');
    const otraInput = document.getElementById('otra-descripcion');
    if (otraBtn) otraBtn.click();
    if (otraInput) otraInput.value = cientifico;
  }
}

function init() {
  renderEspecies();
  renderFotoSlots();
  renderTamanyos();
  initUbicacionStep();
  initObservacionesStep();
  initContactoStep();

  preseleccionarEspecieDesdeUrl();

  document.getElementById('header-back').addEventListener('click', () => {
    goBack();
    enterStep(currentStep());
  });
  document.getElementById('btn-siguiente').addEventListener('click', handleSiguiente);

  document.querySelectorAll('[data-edit-step]').forEach(el => {
    el.addEventListener('click', () => goToStepAndEnter(el.dataset.editStep));
  });

  document.getElementById('btn-reportar-otro').addEventListener('click', () => {
    resetAll();
    window.location.href = 'index.html';
  });

  // Se usa goTo (sin registrar historial) en vez de goToStepAndEnter:
  // esta página empieza directamente en "especie" y no en "inicio" (esa
  // pantalla ya no existe aquí, vive en index.html), así que el primer
  // paso no debe mostrar una flecha "atrás" que no lleve a ningún sitio.
  goTo('especie', { record: false });
  enterStep('especie');
}

document.addEventListener('DOMContentLoaded', init);
