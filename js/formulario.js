import { CONFIG, TAMANYOS } from './config.js';
import { state, resetWizard, setNextEnabled } from './wizard.js';
import { dataUrlToBlob, renderFotoSlots } from './fotos.js';
import { resetUbicacion } from './mapa.js';

export function renderTamanyos() {
  const grid = document.getElementById('tamanyo-grid');
  grid.innerHTML = '';
  TAMANYOS.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-card';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `
      <span class="option-card__icon" aria-hidden="true">${t.icono}</span>
      <span>
        <span class="option-card__title">${t.titulo}</span>
        ${t.sub ? `<span class="option-card__sub">${t.sub}</span>` : ''}
      </span>`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.option-card').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      state.tamanyo = t.valor;
      state.tamanyoTitulo = t.titulo;
      setNextEnabled(true);
    });
    grid.appendChild(btn);
  });
}

export function initObservacionesStep() {
  document.getElementById('observaciones-input').addEventListener('input', (e) => {
    state.observaciones = e.target.value;
  });
}

export function initContactoStep() {
  document.getElementById('nombre-input').addEventListener('input', (e) => { state.nombre = e.target.value; });
  document.getElementById('email-input').addEventListener('input', (e) => { state.email = e.target.value; });
}

export function renderRevision() {
  document.getElementById('revision-especie').textContent = state.especieEsOtra
    ? 'Otra / No sé' + (state.especieDescripcion ? ` — "${state.especieDescripcion}"` : '')
    : state.especieNombre;

  const fotosWrap = document.getElementById('revision-fotos');
  fotosWrap.innerHTML = state.fotos.length
    ? state.fotos.map(f => `<img src="${f.dataUrl}" alt="">`).join('')
    : '<span class="review-section__value">Sin fotografías</span>';

  document.getElementById('revision-ubicacion').textContent = state.lat && state.lon
    ? `Coordenadas guardadas${state.lugarDesc ? ' — ' + state.lugarDesc : ''}`
    : 'Sin indicar';

  document.getElementById('revision-cantidad').textContent = state.tamanyoTitulo || 'No indicado';
  document.getElementById('revision-observaciones').textContent = state.observaciones || 'Sin observaciones';
  document.getElementById('revision-contacto').textContent = (state.nombre || state.email)
    ? [state.nombre, state.email].filter(Boolean).join(' · ')
    : 'No facilitados (envío anónimo)';
}

export async function enviarReporte() {
  const btn = document.getElementById('btn-siguiente');
  const errorEl = document.getElementById('envio-error');
  btn.disabled = true;
  btn.textContent = 'Enviando…';
  errorEl.style.display = 'none';

  try {
    const especieComun = state.especieEsOtra ? 'Otra / No sé' : state.especieNombre;
    const hoy = new Date();
    const fechaTexto = [
      String(hoy.getDate()).padStart(2, '0'),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      hoy.getFullYear(),
    ].join('/');

    const data = new FormData();

    // Campos de control de FormSubmit (servicio de formulario→email
    // usado porque GitHub Pages no puede procesar envíos por sí mismo).
    data.append('_subject', CONFIG.emailAsunto + ': ' + especieComun);
    data.append('_template', 'table');
    data.append('_captcha', 'false');
    data.append('_honey', ''); // campo trampa anti-spam, debe llegar vacío
    if (state.email) data.append('_replyto', state.email);

    // Contenido del reporte, en el orden en que debe aparecer en el email.
    data.append('Especie', especieComun);
    if (state.especieEsOtra) {
      data.append('Descripción de la planta', state.especieDescripcion || 'No indicada');
    } else {
      data.append('Nombre científico', state.especie);
    }
    data.append('Fecha', fechaTexto);
    data.append('Latitud', state.lat || 'No indicada');
    data.append('Longitud', state.lon || 'No indicada');
    if (state.lat && state.lon) {
      data.append('Ver en Google Maps', `https://maps.google.com/?q=${state.lat},${state.lon}`);
    }
    data.append('Descripción del lugar', state.lugarDesc || 'No indicada');
    data.append('Cantidad', state.tamanyo || 'No indicada');
    data.append('Observaciones', state.observaciones || 'Sin observaciones');
    data.append('Nombre de contacto', state.nombre || 'No facilitado');
    data.append('Email de contacto', state.email || 'No facilitado');

    state.fotos.forEach((foto, i) => {
      const blob = dataUrlToBlob(foto.dataUrl);
      data.append('foto_' + (i + 1), blob, `foto_${i + 1}.jpg`);
    });

    const resp = await fetch(CONFIG.submitUrl, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
    });
    if (!resp.ok) throw new Error('Respuesta no válida del servidor');

    return true;
  } catch (err) {
    errorEl.textContent = 'No se ha podido enviar el reporte. Inténtalo de nuevo.';
    errorEl.style.display = 'block';
    return false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar reporte';
  }
}

export function resetAll() {
  resetWizard();
  resetUbicacion();
  document.querySelectorAll('.species-btn').forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  document.getElementById('other-help').hidden = true;
  document.getElementById('otra-descripcion').value = '';
  document.getElementById('observaciones-input').value = '';
  document.getElementById('nombre-input').value = '';
  document.getElementById('email-input').value = '';
  document.querySelectorAll('.option-card').forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  renderFotoSlots();
}
