import { PLANTNET_API_KEY } from './identificar-config.js';
import { getEspecies, cargarDatos, abrirFichaPorCientifico, seleccionarEspecieParaReportar } from './catalogo.js';

// ================================================================
// Identificación de plantas con Pl@ntNet — llamada directa desde el
// navegador (sin backend/intermediario), por decisión expresa del
// proyecto: Pl@ntNet ofrece este modo para apps cliente mediante
// "Expose my API key" + "Authorized domains" en my.plantnet.org.
// Ver instrucciones completas en js/identificar-config.js.
//
// MUY IMPORTANTE: Pl@ntNet identifica el NOMBRE CIENTÍFICO de la
// planta; no dice si es invasora. El estado (🔴/🟢/⚪) siempre se
// calcula aquí, cruzando ese nombre contra nuestra guía oficial de
// Cantabria (data/cantabria-flora.json) — nunca se toma de Pl@ntNet
// directamente ni se inventa.
// ================================================================

const PLANTNET_ENDPOINT = 'https://my-api.plantnet.org/v2/identify/all';
const MAX_FOTOS = 5;

// Umbral orientativo por debajo del cual no confiamos en el resultado
// como identificación clara (no es un valor que imponga Pl@ntNet, es
// un criterio propio de esta app para decidir cuándo mostrar el aviso
// "no estamos seguros").
const CONFIANZA_MINIMA = 0.20;

let especiesCache = [];
let fotosSeleccionadas = [];
let ultimaFotoDataUrl = '';

async function especiesDisponibles() {
  if (especiesCache.length) return especiesCache;
  const yaCargadas = getEspecies();
  especiesCache = (yaCargadas && yaCargadas.length) ? yaCargadas : await cargarDatos();
  return especiesCache;
}

function normalizar(txt) {
  return (txt || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Cruza el nombre científico devuelto por Pl@ntNet contra nuestra guía.
// Primero busca coincidencia exacta; si no la hay, prueba a nivel de
// género para las entradas de nuestro catálogo que son genéricas
// ("Azolla spp.", "Cortaderia spp."...), ya que Pl@ntNet siempre da una
// especie concreta dentro de ese género.
function buscarEnCatalogo(nombreCientifico, especies) {
  const nc = normalizar(nombreCientifico);
  let match = especies.find(e => normalizar(e.cientifico) === nc);
  if (match) return match;

  const genero = nc.split(' ')[0];
  match = especies.find(e => {
    const ec = normalizar(e.cientifico);
    return ec.endsWith(' spp.') && ec.split(' ')[0] === genero;
  });
  return match || null;
}

function estadoDeEspecie(match) {
  // No inventamos el estado: solo lo determinamos si el cruce con
  // nuestra guía nos da una base real. Todas las especies incluidas en
  // ella son, por definición del propio Plan de Cantabria, especies
  // objetivo/invasoras — no tenemos ninguna fuente propia de especies
  // autóctonas, así que ese estado (🟢) no se usa todavía en la
  // práctica; se deja preparado por si en el futuro se añade esa
  // información con una fuente fiable.
  if (match) return { nivel: 'invasora', etiqueta: '🔴 Especie invasora en Cantabria' };
  return { nivel: 'desconocido', etiqueta: '⚪ Información no disponible' };
}

function crearTarjetaResultado(resultado, especies) {
  const match = buscarEnCatalogo(resultado.scientificName, especies);
  const estado = estadoDeEspecie(match);
  const porcentaje = resultado.score != null ? Math.round(resultado.score * 100) : null;
  const nombreComunPropio = match && match.comunes && match.comunes[0];
  const nombreComunPlantnet = resultado.commonNames && resultado.commonNames[0];

  const div = document.createElement('div');
  div.className = 'identificar-resultado';

  const nombreMostrado = nombreComunPropio || nombreComunPlantnet || resultado.scientificName;

  div.innerHTML = `
    <p class="identificar-resultado__comun">${nombreMostrado}</p>
    <p class="identificar-resultado__cientifico">${resultado.scientificName}</p>
    ${porcentaje != null ? `<p class="identificar-resultado__score">${porcentaje}% de coincidencia (Pl@ntNet)</p>` : ''}
    <p class="identificar-resultado__estado identificar-resultado__estado--${estado.nivel}">${estado.etiqueta}</p>
    ${!match ? '<p class="identificar-resultado__no-incluida">Especie no incluida en nuestra guía de Cantabria.</p>' : ''}
    <div class="identificar-resultado__acciones">
      ${match ? '<button type="button" class="btn btn-secondary identificar-btn-conocer">Conocer esta especie</button>' : ''}
      ${match ? '<button type="button" class="btn btn-primary identificar-btn-reportar">📍 Mandar registro</button>' : ''}
    </div>`;

  if (match) {
    div.querySelector('.identificar-btn-conocer').addEventListener('click', () => {
      cerrarIdentificar();
      abrirFichaPorCientifico(match.cientifico);
    });
    div.querySelector('.identificar-btn-reportar').addEventListener('click', () => {
      cerrarIdentificar();
      seleccionarEspecieParaReportar(match.cientifico);
    });
  }

  return div;
}

function mostrarEstado(nombre) {
  ['inicio', 'cargando', 'resultados', 'error'].forEach(n => {
    document.getElementById(`identificar-estado-${n}`).hidden = (n !== nombre);
  });
}

async function mostrarResultados(resultados, fotoDataUrl) {
  const especies = await especiesDisponibles();
  const lista = document.getElementById('identificar-resultados-lista');
  const intro = document.getElementById('identificar-resultados-intro');
  const titulo = document.getElementById('identificar-resultados-titulo');
  const duda = document.getElementById('identificar-duda');
  const fotoEl = document.getElementById('identificar-foto-enviada');

  fotoEl.src = fotoDataUrl;
  lista.innerHTML = '';

  const mejor = resultados[0];
  const confianzaBaja = !mejor || (mejor.score != null && mejor.score < CONFIANZA_MINIMA);

  if (confianzaBaja) {
    titulo.textContent = '🤔 No estamos seguros';
    intro.hidden = false;
    duda.hidden = false;
  } else {
    titulo.textContent = 'Podría ser…';
    intro.hidden = true;
    duda.hidden = true;
  }

  if (!resultados.length) {
    lista.innerHTML = '<p class="identificar-resultado__no-incluida">Pl@ntNet no ha devuelto ninguna especie para esta fotografía.</p>';
  } else {
    resultados.forEach(r => lista.appendChild(crearTarjetaResultado(r, especies)));
  }

  document.getElementById('identificar-btn-mandar-duda').onclick = () => {
    cerrarIdentificar();
    seleccionarEspecieParaReportar('Otras');
  };

  mostrarEstado('resultados');
}

function mostrarError(mensaje) {
  document.getElementById('identificar-error-mensaje').textContent = mensaje;
  document.getElementById('identificar-btn-mandar-error').onclick = () => {
    cerrarIdentificar();
    seleccionarEspecieParaReportar('Otras');
  };
  mostrarEstado('error');
}

function leerComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Selección de fotografías (una o varias, hasta el límite de Pl@ntNet) ──
function renderMiniaturas() {
  const cont = document.getElementById('identificar-miniaturas');
  const btnAnalizar = document.getElementById('identificar-btn-analizar');
  cont.innerHTML = '';
  cont.hidden = fotosSeleccionadas.length === 0;
  btnAnalizar.disabled = fotosSeleccionadas.length === 0;

  fotosSeleccionadas.forEach((file, i) => {
    const div = document.createElement('div');
    div.className = 'identificar-miniatura';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = `Fotografía ${i + 1}`;
    const quitar = document.createElement('button');
    quitar.type = 'button';
    quitar.className = 'identificar-miniatura__quitar';
    quitar.setAttribute('aria-label', `Quitar fotografía ${i + 1}`);
    quitar.textContent = '✕';
    quitar.addEventListener('click', () => {
      fotosSeleccionadas.splice(i, 1);
      renderMiniaturas();
    });
    div.appendChild(img);
    div.appendChild(quitar);
    cont.appendChild(div);
  });
}

function agregarFotos(fileList) {
  const nuevas = Array.from(fileList || []).filter(f => f.type.startsWith('image/'));
  const espacio = MAX_FOTOS - fotosSeleccionadas.length;
  fotosSeleccionadas = fotosSeleccionadas.concat(nuevas.slice(0, Math.max(0, espacio)));
  renderMiniaturas();
}

async function identificarFotos() {
  if (!fotosSeleccionadas.length) return;

  if (!PLANTNET_API_KEY) {
    mostrarError('La identificación automática todavía no está configurada en esta app (falta la clave de Pl@ntNet). Mientras tanto, puedes enviarnos la fotografía directamente.');
    return;
  }

  mostrarEstado('cargando');

  try {
    ultimaFotoDataUrl = await leerComoDataUrl(fotosSeleccionadas[0]);
  } catch (err) {
    ultimaFotoDataUrl = '';
  }

  try {
    const formData = new FormData();
    fotosSeleccionadas.forEach(file => {
      formData.append('images', file, file.name || 'foto.jpg');
      formData.append('organs', 'auto');
    });

    const url = new URL(PLANTNET_ENDPOINT);
    url.searchParams.set('api-key', PLANTNET_API_KEY);
    url.searchParams.set('lang', 'es');
    url.searchParams.set('nb-results', '3');
    url.searchParams.set('include-related-images', 'false');

    const resp = await fetch(url.toString(), { method: 'POST', body: formData });

    if (resp.status === 429) {
      mostrarError('Hemos alcanzado el límite diario de identificaciones de Pl@ntNet. Puedes enviarnos la fotografía directamente y la revisaremos.');
      return;
    }
    if (!resp.ok) {
      mostrarError('No hemos podido identificar la fotografía. Puedes enviárnosla directamente y la revisaremos.');
      return;
    }

    const data = await resp.json();
    const resultados = (data.results || []).slice(0, 3).map(r => ({
      scientificName: r.species?.scientificNameWithoutAuthor || null,
      score: typeof r.score === 'number' ? r.score : null,
      commonNames: Array.isArray(r.species?.commonNames) ? r.species.commonNames.slice(0, 3) : [],
    })).filter(r => r.scientificName);

    await mostrarResultados(resultados, ultimaFotoDataUrl);
  } catch (err) {
    // Un error de red aquí suele significar que el dominio todavía no
    // está en "Authorized domains" de Pl@ntNet, o que no hay conexión.
    mostrarError('No hemos podido conectar con Pl@ntNet. Comprueba tu conexión, o puede que el dominio aún no esté autorizado en la configuración de Pl@ntNet.');
  }
}

function reiniciarSeleccion() {
  fotosSeleccionadas = [];
  renderMiniaturas();
  const inputCamara = document.getElementById('identificar-input-camara');
  const inputGaleria = document.getElementById('identificar-input-galeria');
  if (inputCamara) inputCamara.value = '';
  if (inputGaleria) inputGaleria.value = '';
}

function abrirIdentificar() {
  reiniciarSeleccion();
  mostrarEstado('inicio');
  const overlay = document.getElementById('identificar-overlay');
  overlay.hidden = false;
  void overlay.offsetWidth;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function cerrarIdentificar() {
  const overlay = document.getElementById('identificar-overlay');
  if (!overlay || overlay.hidden) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  clearTimeout(cerrarIdentificar._t);
  cerrarIdentificar._t = setTimeout(() => { overlay.hidden = true; }, 200);
  reiniciarSeleccion();
}

export function initIdentificar() {
  const botonesAbrir = document.querySelectorAll('#btn-identificar, .js-abrir-identificar');
  const overlay = document.getElementById('identificar-overlay');
  if (!botonesAbrir.length || !overlay) return;

  botonesAbrir.forEach(btn => btn.addEventListener('click', abrirIdentificar));
  document.getElementById('identificar-cerrar').addEventListener('click', cerrarIdentificar);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrarIdentificar(); });
  document.addEventListener('keydown', (e) => { if (!overlay.hidden && e.key === 'Escape') cerrarIdentificar(); });

  document.getElementById('identificar-input-camara').addEventListener('change', (e) => {
    agregarFotos(e.target.files);
    e.target.value = '';
  });
  document.getElementById('identificar-input-galeria').addEventListener('change', (e) => {
    agregarFotos(e.target.files);
    e.target.value = '';
  });
  document.getElementById('identificar-btn-analizar').addEventListener('click', identificarFotos);
  document.getElementById('identificar-reintentar').addEventListener('click', identificarFotos);
  document.getElementById('identificar-otra-foto').addEventListener('click', () => {
    reiniciarSeleccion();
    mostrarEstado('inicio');
  });
}
