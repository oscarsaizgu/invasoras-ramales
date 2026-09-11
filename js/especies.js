import { ESPECIES } from './config.js';
import { state, setNextEnabled } from './wizard.js';

export function renderEspecies() {
  const grid = document.getElementById('species-grid');
  grid.innerHTML = '';

  ESPECIES.forEach(sp => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'species-btn' + (sp.esOtra ? ' species-btn--other' : '');
    btn.dataset.especie = sp.cientifico;
    btn.dataset.nombre = sp.nombre;
    btn.setAttribute('aria-pressed', 'false');

    if (sp.esOtra) {
      btn.innerHTML = `
        <span class="species-btn__icon" aria-hidden="true">${sp.icono}</span>
        <span class="species-btn__body">
          <span class="species-btn__name">${sp.nombre}</span>
        </span>
        <span class="species-btn__check" aria-hidden="true">✓</span>`;
    } else {
      const photoStyle = sp.imagen ? `style="background-image:url('${sp.imagen}')"` : '';
      btn.innerHTML = `
        <span class="species-btn__photo" ${photoStyle} aria-hidden="true">${sp.imagen ? '' : sp.icono}</span>
        <span class="species-btn__body">
          <span class="species-btn__name">${sp.nombre}</span>
          <span class="species-btn__sci">${sp.cientifico}</span>
        </span>
        <span class="species-btn__check" aria-hidden="true">✓</span>`;
    }

    btn.addEventListener('click', () => selectEspecie(btn, sp));
    grid.appendChild(btn);
  });
}

function selectEspecie(btn, sp) {
  document.querySelectorAll('.species-btn').forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('selected');
  btn.setAttribute('aria-pressed', 'true');

  state.especie = sp.cientifico;
  state.especieNombre = sp.nombre;
  state.especieEsOtra = !!sp.esOtra;

  const otherHelp = document.getElementById('other-help');
  otherHelp.hidden = !sp.esOtra;

  setNextEnabled(true);
}

export function especieDescripcionInput() {
  return document.getElementById('otra-descripcion');
}

// Pantalla informativa "Especies invasoras" (contenido, no seleccionable).
// Reutiliza ESPECIES para no duplicar los nombres/científicos en ningún sitio.
export function renderEspeciesInfo() {
  const grid = document.getElementById('info-especies-grid');
  if (!grid || grid.dataset.rendered) return;
  grid.innerHTML = '';

  ESPECIES.forEach(sp => {
    const card = document.createElement('article');

    if (sp.esOtra) {
      card.className = 'info-especie-card info-especie-card--otra';
      card.innerHTML = `
        <span class="info-especie-card__icon" aria-hidden="true">${sp.icono}</span>
        <span class="info-especie-card__body">
          <p class="info-especie-card__name">${sp.nombre}</p>
          <p class="info-especie-card__desc">¿No la reconoces? No pasa nada: haz una foto y nosotros la revisamos.</p>
        </span>`;
    } else {
      card.className = 'info-especie-card';
      card.innerHTML = `
        <div class="info-especie-card__photo" style="background-image:url('${sp.imagen}')" role="img" aria-label="${sp.nombre}"></div>
        <div class="info-especie-card__body">
          <p class="info-especie-card__name">${sp.nombre}</p>
          <p class="info-especie-card__sci">${sp.cientifico}</p>
        </div>`;
    }
    grid.appendChild(card);
  });

  grid.dataset.rendered = 'true';
}
