import { CONFIG } from './config.js';
import { state } from './wizard.js';
import { identificarEspecie, resumenResultadosPlantNet } from './plantnet.js';

const TIPOS_VALIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const TAMANYO_MAX_ORIGINAL = 25 * 1024 * 1024; // 25 MB, límite de sanidad antes de comprimir

export function renderFotoSlots() {
  const grid = document.getElementById('photo-grid');
  grid.innerHTML = '';

  for (let i = 0; i < CONFIG.maxFotos; i++) {
    const slot = document.createElement('div');
    slot.className = 'photo-slot';
    slot.dataset.index = String(i);

    const foto = state.fotos[i];
    if (foto) {
      slot.classList.add('has-photo');
      slot.innerHTML = `
        <img src="${foto.dataUrl}" alt="Fotografía ${i + 1} de la planta">
        <button type="button" class="photo-slot__remove" aria-label="Eliminar fotografía ${i + 1}">✕</button>
        <input type="file" accept="image/*" aria-label="Sustituir fotografía ${i + 1}">`;
      slot.querySelector('.photo-slot__remove').addEventListener('click', (e) => {
        e.stopPropagation();
        removeFoto(i);
      });
    } else {
      slot.innerHTML = `
        <span class="photo-slot__icon" aria-hidden="true">📷</span>
        <input type="file" accept="image/*" aria-label="Añadir fotografía ${i + 1}">`;
    }

    slot.querySelector('input').addEventListener('change', (e) => handleFotoInput(e, i));
    grid.appendChild(slot);
  }

  updateFotoState();
}

async function handleFotoInput(e, index) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!TIPOS_VALIDOS.includes(file.type) && !file.type.startsWith('image/')) {
    showFotoError('Ese archivo no es una imagen válida. Prueba con otra foto.');
    e.target.value = '';
    return;
  }
  if (file.size > TAMANYO_MAX_ORIGINAL) {
    showFotoError('La imagen es demasiado grande. Prueba con otra foto.');
    e.target.value = '';
    return;
  }

  showFotoError('');
  try {
    const dataUrl = await comprimirImagen(file, CONFIG.fotoMaxLado, CONFIG.fotoCalidad);
    state.fotos[index] = { file, dataUrl };
    renderFotoSlots();
    actualizarIdentificacionPlantNet();
  } catch (err) {
    showFotoError('No se pudo procesar la foto. Prueba con otra.');
  }
}

function removeFoto(index) {
  state.fotos.splice(index, 1);
  renderFotoSlots();
  actualizarIdentificacionPlantNet();
}

// Identifica automáticamente con las fotos que haya en ese momento en el
// paso de foto del asistente de reporte — así TODOS los reportes con foto
// pasan por Pl@ntNet, no solo los que vienen de "Identificar planta".
// Reutiliza identificarEspecie() de plantnet.js: es la misma función (y la
// misma llamada a Pl@ntNet) que usa identificar.html, no una copia.
// El resultado se guarda en state.plantnetScientific/Confidence/Results —
// los mismos campos que ya envía formulario.js a Apps Script — así que no
// hace falta tocar el envío del reporte para que esto llegue a Sheets.
let identificacionEnCurso = 0;

// Repinta el mensaje de Pl@ntNet a partir del estado actual, SIN volver a
// llamar a la API. Se usa tanto justo después de identificar como al
// reentrar en el paso de foto (p.ej. si el usuario vuelve atrás y cambia
// la especie elegida a/desde "Otra / No sé" con una foto ya analizada):
// así el mensaje siempre coincide con la especie actualmente seleccionada.
export function renderMensajePlantNet() {
  const el = document.getElementById('foto-plantnet-status');
  if (!el) return;

  if (!state.fotos.length) {
    el.textContent = '';
    el.hidden = true;
    el.className = 'loc-status';
    return;
  }

  if (!state.plantnetScientific) {
    // O bien no hay identificación (falló/no se ha llamado todavía), o
    // acabamos de vaciar el mensaje por error — actualizarIdentificacionPlantNet
    // ya se encarga de mostrar el aviso de "no hemos podido identificar" en
    // su propio flujo; aquí simplemente no hay nada que mostrar todavía.
    return;
  }

  el.hidden = false;

  if (state.especieEsOtra) {
    // Sugerencia informativa: no cambia la selección del usuario, no cierra
    // ni resetea el formulario. El enlace abre la ficha en una pestaña
    // nueva a propósito, para que el formulario en curso nunca se pierda.
    const enlace = `guia-botanica.html?especie=${encodeURIComponent(state.plantnetScientific)}`;
    const pct = state.plantnetConfidence != null ? `${state.plantnetConfidence}% de coincidencia` : '';
    el.innerHTML = `
      🔍 Creemos que podría ser:<br>
      <strong>${state.plantnetScientific}</strong><br>
      ${state.plantnetNombreComun ? `${state.plantnetNombreComun}${pct ? ' · ' + pct : ''}<br>` : (pct ? `${pct}<br>` : '')}
      <a href="${enlace}" target="_blank" rel="noopener">Ver más información →</a><br>
      <span style="opacity:0.7;font-size:0.78rem;">Esto es solo una sugerencia informativa.</span>
    `;
    el.className = 'loc-status ok';
  } else {
    el.textContent = `🔍 Podría ser: ${state.plantnetScientific}${state.plantnetConfidence != null ? ' (' + state.plantnetConfidence + '% de coincidencia)' : ''}`;
    el.className = 'loc-status ok';
  }
}

async function actualizarIdentificacionPlantNet() {
  const el = document.getElementById('foto-plantnet-status');
  const archivos = state.fotos.map(f => f && f.file).filter(Boolean);

  if (!archivos.length) {
    state.plantnetScientific = '';
    state.plantnetConfidence = null;
    state.plantnetResults = '';
    state.plantnetNombreComun = '';
    if (el) { el.textContent = ''; el.hidden = true; el.className = 'loc-status'; }
    return;
  }

  const idPeticion = ++identificacionEnCurso;
  if (el) {
    el.hidden = false;
    el.textContent = '🔍 Identificando la especie con Pl@ntNet…';
    el.className = 'loc-status';
  }

  const { resultados, error } = await identificarEspecie(archivos);

  // Si el usuario ha añadido/quitado otra foto mientras esta identificación
  // estaba en curso, esta respuesta ya está obsoleta: se descarta para no
  // pisar un resultado más reciente.
  if (idPeticion !== identificacionEnCurso) return;

  if (error || !resultados.length) {
    state.plantnetScientific = '';
    state.plantnetConfidence = null;
    state.plantnetResults = '';
    state.plantnetNombreComun = '';
    if (el) {
      el.textContent = 'No hemos podido identificar la especie automáticamente. No pasa nada: tu reporte se enviará igualmente y quedará pendiente de revisión.';
      el.className = 'loc-status';
    }
    return;
  }

  const mejor = resultados[0];
  const porcentaje = mejor.score != null ? Math.round(mejor.score * 100) : null;
  state.plantnetScientific = mejor.scientificName;
  state.plantnetConfidence = porcentaje;
  state.plantnetResults = resumenResultadosPlantNet(resultados);
  state.plantnetNombreComun = (mejor.commonNames && mejor.commonNames[0]) || '';

  renderMensajePlantNet();
}

function showFotoError(msg) {
  const el = document.getElementById('foto-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

function updateFotoState() {
  const count = document.getElementById('photo-count');
  if (count) {
    count.textContent = state.fotos.length
      ? `${state.fotos.length} de ${CONFIG.maxFotos} fotos añadidas`
      : '';
  }
}

// Redimensiona y comprime la imagen en el navegador para no enviar
// archivos innecesariamente grandes desde el móvil.
function comprimirImagen(file, maxLado, calidad) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxLado || height > maxLado) {
          if (width > height) {
            height = Math.round(height * (maxLado / width));
            width = maxLado;
          } else {
            width = Math.round(width * (maxLado / height));
            height = maxLado;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function dataUrlToBlob(dataUrl) {
  const [meta, data] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)[1];
  const bin = atob(data);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
