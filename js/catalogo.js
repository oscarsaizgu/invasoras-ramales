import { goToStepAndEnter } from './app.js';

// ================================================================
// Guía de especies invasoras de Cantabria
//
// Los datos de cada especie (nombre, familia, biotipo, hábitat,
// descripción, medidas de control...) proceden literalmente del
// "Plan Estratégico Regional de Gestión y Control de Especies
// Exóticas Invasoras de Cantabria" (Gobierno de Cantabria, aprobado
// el 23/11/2017) — ver data/cantabria-flora.json, generado a partir
// de ese documento oficial. No se ha redactado ninguna descripción
// propia: cuando una sección no tiene información oficial disponible
// se omite en la ficha en lugar de inventarla.
//
// Esta misma estructura por especie (fotos de referencia, nombre
// científico, características, hábitat e información oficial) es la
// que permitiría en el futuro comparar una fotografía del usuario
// con el catálogo mediante IA; no se implementa ningún modelo aquí.
// ================================================================

const PAGINA = 12;

let ESPECIES = [];
let ESTATUS_EXTERNO = []; // data/estatus-flora.json — ver data/README.md
let filtroActivo = 'todas';
let consulta = '';
let visibles = PAGINA;

let fichaActual = null;
let fotoActual = 0;

// Normaliza cada especie tras cargarla: por robustez (nunca debe romper la
// pantalla), no por desconfianza de los datos — pero si algún campo llegara
// vacío o con un formato inesperado, esto evita mostrar basura como una
// única letra suelta en vez de "no rellenar automáticamente con un valor
// genérico" tal y como se pidió.
const FUENTE_PLAN_CANTABRIA = {
  label: 'Plan Estratégico Regional de Gestión y Control de Especies Exóticas Invasoras de Cantabria — Gobierno de Cantabria (2017)',
  url: 'https://www.cantabria.es/documents/16835/6017188/Fichas_Sp_Objetivo_Flora_Rev01.pdf',
};
const FUENTE_CEEEI = {
  label: 'Catálogo Español de Especies Exóticas Invasoras (CEEEI) — MITECO',
  url: 'https://www.miteco.gob.es/es/biodiversidad/temas/conservacion-de-especies/especies-exoticas-invasoras/ce_eei_flora.html',
};

function normalizarEspecie(e) {
  const fuentes = [FUENTE_PLAN_CANTABRIA];
  if (e.enCatalogoNacionalCEEEI) fuentes.push(FUENTE_CEEEI);
  return {
    ...e,
    comunes: Array.isArray(e.comunes) ? e.comunes.filter(Boolean) : (e.comunes ? [e.comunes] : []),
    fotos: Array.isArray(e.fotos) ? e.fotos.filter(f => f && f.image) : [],
    fuentes,
  };
}

function nombreComunDe(entry) {
  return (entry.comunes && entry.comunes.length) ? entry.comunes[0] : 'Nombre común no disponible';
}

export async function cargarDatos() {
  try {
    const resp = await fetch('data/cantabria-flora.json', { cache: 'no-store' });
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.map(normalizarEspecie);
  } catch (err) {
    return [];
  }
}

async function cargarEstatusExterno() {
  try {
    const resp = await fetch('data/estatus-flora.json', { cache: 'no-store' });
    if (!resp.ok) return [];
    return await resp.json();
  } catch (err) {
    return [];
  }
}

function normalizar(txt) {
  return (txt || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function coincide(entry, q) {
  if (!q) return true;
  const nq = normalizar(q);
  const campos = [entry.cientifico, ...(entry.comunes || [])];
  return campos.some(c => normalizar(c).includes(nq));
}

function pasaFiltro(entry) {
  if (filtroActivo === 'todas') return true;
  if (filtroActivo === 'destacadas') return !!entry.destacadaRamales;
  return entry.estatus === filtroActivo;
}

const ETIQUETA_CATEGORIA = {
  herbacea: 'Herbácea',
  arbusto: 'Arbusto',
  arbol: 'Árbol',
  acuatica: 'Acuática',
};

const ETIQUETA_ESTATUS = {
  autoctona: { texto: 'Autóctona', clase: 'autoctona' },
  exotica: { texto: 'Exótica', clase: 'exotica' },
  invasora: { texto: 'Invasora', clase: 'invasora' },
};

// Mensaje del estado vacío: distinto según si la categoría todavía no
// tiene especies cargadas (autóctonas/exóticas, pendientes de fase 2) o
// si simplemente no hay resultados para la búsqueda/filtro actual.
const MENSAJE_VACIO_CATEGORIA = {
  autoctona: 'Todavía no hemos incorporado especies autóctonas a la guía. Iremos ampliándola progresivamente.',
  exotica: 'Todavía no hemos incorporado especies exóticas no invasoras a la guía. Iremos ampliándola progresivamente.',
};

// ── Tarjetas ──
function crearTarjeta(entry, destacada) {
  const nombreComun = nombreComunDe(entry);
  const foto = entry.fotos && entry.fotos[0] ? entry.fotos[0].image : null;

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'especie-card' + (destacada ? ' especie-card--destacada' : '') + (foto ? '' : ' especie-card--neutra');
  card.setAttribute('aria-label', 'Ver la especie: ' + nombreComun);

  const etiquetaCategoria = ETIQUETA_CATEGORIA[entry.categoria] || '';
  const estatus = ETIQUETA_ESTATUS[entry.estatus] || null;

  card.innerHTML = `
    ${foto
      ? `<span class="especie-card__foto" style="background-image:url('${foto}')" aria-hidden="true"></span>`
      : `<span class="especie-card__foto especie-card__foto--neutra" aria-hidden="true">🌿</span>`}
    <span class="especie-card__cuerpo">
      <span class="especie-card__comun">${nombreComun}</span>
      <span class="especie-card__cientifico">${entry.cientifico}</span>
      ${!destacada && etiquetaCategoria ? `<span class="especie-card__ambito">${etiquetaCategoria}${estatus ? ' · ' + estatus.texto : ''}</span>` : ''}
      <span class="especie-card__ver">Ver la especie →</span>
    </span>`;

  card.addEventListener('click', () => abrirFicha(entry));
  return card;
}

function renderDestacadas() {
  const cont = document.getElementById('catalogo-destacadas');
  if (!cont) return;
  const destacadas = ESPECIES.filter(e => e.destacadaRamales);
  cont.innerHTML = '';
  destacadas.forEach(e => cont.appendChild(crearTarjeta(e, true)));
}

function renderCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  const vacio = document.getElementById('catalogo-vacio');
  const info = document.getElementById('catalogo-resultados-info');
  const btnMas = document.getElementById('catalogo-cargar-mas');
  if (!grid) return;

  const resultado = ESPECIES.filter(e => pasaFiltro(e) && coincide(e, consulta));

  grid.innerHTML = '';
  resultado.slice(0, visibles).forEach(entry => grid.appendChild(crearTarjeta(entry, false)));

  vacio.hidden = resultado.length > 0;
  vacio.textContent = (!consulta && MENSAJE_VACIO_CATEGORIA[filtroActivo])
    ? MENSAJE_VACIO_CATEGORIA[filtroActivo]
    : 'No hemos encontrado ninguna especie con ese nombre.';
  info.textContent = resultado.length
    ? `${resultado.length} especie${resultado.length === 1 ? '' : 's'} en la guía`
    : '';
  btnMas.hidden = resultado.length <= visibles;
}

// ── Ficha con carrusel de fotografías ──
function actualizarFoto() {
  const fotos = (fichaActual && fichaActual.fotos) || [];
  const img = document.getElementById('ficha-carrusel-img');
  const contador = document.getElementById('ficha-contador');
  const credito = document.getElementById('ficha-carrusel-credito');
  const prevBtn = document.getElementById('ficha-prev');
  const nextBtn = document.getElementById('ficha-next');

  if (!fotos.length) {
    img.removeAttribute('src');
    img.alt = '';
    contador.textContent = '';
    credito.hidden = true;
    prevBtn.hidden = true;
    nextBtn.hidden = true;
    return;
  }

  const foto = fotos[fotoActual];
  img.src = foto.image;
  img.alt = nombreComunDe(fichaActual);

  const multiple = fotos.length > 1;
  prevBtn.hidden = !multiple;
  nextBtn.hidden = !multiple;
  contador.textContent = multiple ? `${fotoActual + 1} / ${fotos.length}` : '';

  if (foto.imageAuthor) {
    const licenciaLegible = (foto.imageLicense || '').toUpperCase().replace(/-/g, ' ');
    credito.textContent = `Foto: ${foto.imageAuthor} · ${foto.imageSource}${licenciaLegible ? ' (' + licenciaLegible + ')' : ''}`;
    credito.href = foto.imageSourceUrl || '#';
    credito.hidden = false;
  } else {
    credito.hidden = true;
  }
}

function moverFoto(delta) {
  const fotos = (fichaActual && fichaActual.fotos) || [];
  if (fotos.length < 2) return;
  fotoActual = (fotoActual + delta + fotos.length) % fotos.length;
  actualizarFoto();
}

function listaOrVacio(items) {
  return (items && items.length) ? items : null;
}

// Ficha botánica única: recibe siempre el mismo tipo de registro
// (cientifico, comunes, fotos, estatus, y opcionalmente familia,
// biotipo, comoReconocerla, habitat, medidasControl, fuentes...),
// tanto si procede de las fichas propias como de una identificación de
// Pl@ntNet resuelta por resolverEspecie(). No sabe ni le importa de
// dónde viene cada dato: cada sección se muestra si hay contenido y se
// oculta si no lo hay, nunca con un aviso de "no disponible".
function abrirFicha(entry) {
  fichaActual = entry;
  fotoActual = 0;

  const nombreComun = nombreComunDe(entry);
  document.getElementById('ficha-comun').textContent = nombreComun;
  document.getElementById('ficha-cientifico').textContent = entry.cientifico;
  actualizarFoto();

  // Estatus (autóctona / exótica / invasora) — solo se muestra cuando
  // tenemos una clasificación fiable; no se inventa para especies sin
  // esa información todavía.
  const estatusEl = document.getElementById('ficha-estatus');
  const estatus = ETIQUETA_ESTATUS[entry.estatus];
  if (estatusEl) {
    if (estatus) {
      estatusEl.textContent = estatus.texto;
      estatusEl.className = 'ficha-estatus ficha-estatus--' + estatus.clase;
      estatusEl.hidden = false;
    } else {
      estatusEl.hidden = true;
    }
  }

  // ¿Cómo reconocerla?
  const seccionReconocer = document.getElementById('ficha-seccion-reconocer');
  if (entry.comoReconocerla) {
    document.getElementById('ficha-reconocer').textContent = entry.comoReconocerla;
    seccionReconocer.hidden = false;
  } else {
    seccionReconocer.hidden = true;
  }

  // Características (familia, biotipo, origen) — solo los datos oficiales disponibles
  const caracteristicas = [];
  if (entry.familia) caracteristicas.push(`<li><strong>Familia:</strong> ${entry.familia}</li>`);
  if (entry.biotipo) caracteristicas.push(`<li><strong>Tipo de planta:</strong> ${entry.biotipo}</li>`);
  if (entry.origen) caracteristicas.push(`<li><strong>Origen:</strong> ${entry.origen}</li>`);
  const seccionCaract = document.getElementById('ficha-seccion-caracteristicas');
  if (caracteristicas.length) {
    document.getElementById('ficha-caracteristicas').innerHTML = caracteristicas.join('');
    seccionCaract.hidden = false;
  } else {
    seccionCaract.hidden = true;
  }

  // ¿Dónde aparece?
  const dondePartes = [];
  if (entry.habitat) dondePartes.push(entry.habitat);
  if (entry.distribucionGeneralidades) dondePartes.push(entry.distribucionGeneralidades);
  const seccionDonde = document.getElementById('ficha-seccion-donde');
  if (dondePartes.length) {
    document.getElementById('ficha-donde').textContent = dondePartes.join(' ');
    seccionDonde.hidden = false;
  } else {
    seccionDonde.hidden = true;
  }

  // ¿Es una especie invasora? — solo se muestra si hay contenido real
  // sobre su situación legal o medidas de control; si no lo hay, la
  // sección se oculta igual que el resto (nunca un aviso genérico).
  const invasoraPartes = [];
  if (entry.estatus === 'invasora') {
    invasoraPartes.push(entry.enCatalogoNacionalCEEEI
      ? 'Está incluida en el Catálogo Español de Especies Exóticas Invasoras (CEEEI) de ámbito estatal.'
      : 'No figura en el Catálogo Español de Especies Exóticas Invasoras (CEEEI) de ámbito estatal, pero sí está identificada como especie objetivo en el Plan Estratégico Regional de Cantabria.');
  }
  if (entry.erradicacionCantabria) {
    invasoraPartes.push(`Posibilidad de erradicación en Cantabria: ${entry.erradicacionCantabria.toLowerCase()}.`);
  }
  if (entry.medidasControl) {
    invasoraPartes.push(entry.medidasControl);
  }
  const seccionInvasora = document.getElementById('ficha-seccion-invasora');
  if (invasoraPartes.length) {
    document.getElementById('ficha-invasora').textContent = invasoraPartes.join(' ');
    seccionInvasora.hidden = false;
  } else {
    seccionInvasora.hidden = true;
  }

  // Fuentes — siempre construidas a partir de entry.fuentes (lista
  // explícita que prepara resolverEspecie/normalizarEspecie), nunca
  // señalando si el origen es "externo" o propio.
  const fuentes = [];
  (entry.fuentes || []).forEach(f => {
    fuentes.push(`<li><a href="${f.url}" target="_blank" rel="noopener">${f.label}</a></li>`);
  });
  (entry.fotos || []).forEach(f => {
    if (f.imageSourceUrl && f.imageSource) {
      fuentes.push(`<li><a href="${f.imageSourceUrl}" target="_blank" rel="noopener">${f.imageSource}</a> — fotografía (${(f.imageAuthor || '').replace(/^\(c\)\s*/, '')})</li>`);
    }
  });
  const seccionFuentes = document.getElementById('ficha-seccion-fuentes');
  if (fuentes.length) {
    document.getElementById('ficha-fuentes').innerHTML = fuentes.join('');
    seccionFuentes.hidden = false;
  } else {
    seccionFuentes.hidden = true;
  }

  // Botón ficha oficial (solo si existe una, del catálogo nacional)
  const oficialBtn = document.getElementById('ficha-btn-oficial');
  if (entry.fichaNacionalUrl) {
    oficialBtn.href = entry.fichaNacionalUrl;
    oficialBtn.hidden = false;
  } else {
    oficialBtn.hidden = true;
  }

  document.getElementById('ficha-btn-reportar').onclick = () => reportarEspecie(entry.cientifico);

  const overlay = document.getElementById('ficha-overlay');
  overlay.hidden = false;
  void overlay.offsetWidth;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.ficha-panel').scrollTop = 0;
}

function cerrarFicha() {
  const overlay = document.getElementById('ficha-overlay');
  if (!overlay || overlay.hidden) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  clearTimeout(cerrarFicha._t);
  cerrarFicha._t = setTimeout(() => { overlay.hidden = true; }, 200);
}

// ── Zoom de fotografía ──
function abrirZoom(src, alt) {
  const overlay = document.getElementById('zoom-overlay');
  const img = document.getElementById('zoom-overlay-img');
  img.src = src;
  img.alt = alt || '';
  overlay.hidden = false;
  void overlay.offsetWidth;
  overlay.classList.add('is-open');
}

function cerrarZoom() {
  const overlay = document.getElementById('zoom-overlay');
  if (!overlay || overlay.hidden) return;
  overlay.classList.remove('is-open');
  clearTimeout(cerrarZoom._t);
  cerrarZoom._t = setTimeout(() => { overlay.hidden = true; }, 200);
}

// ── Conexión con el flujo de reporte existente ──
// Reutiliza tal cual los botones y el estado ya existentes del asistente
// (especies.js / wizard.js / app.js): no se toca su lógica, solo se simula
// la misma selección que haría la persona usuaria a mano. Se exporta para
// que identificar.js (resultados de Pl@ntNet) pueda arrancar el mismo
// reporte con la especie identificada ya seleccionada.
export function seleccionarEspecieParaReportar(cientifico) {
  const boton = document.querySelector(`.species-btn[data-especie="${CSS.escape(cientifico)}"]`);
  if (boton) {
    boton.click();
  } else {
    const otraBtn = document.querySelector('.species-btn--other');
    const otraInput = document.getElementById('otra-descripcion');
    if (otraBtn) otraBtn.click();
    if (otraInput) otraInput.value = cientifico;
  }
  goToStepAndEnter('especie');
}

function reportarEspecie(cientifico) {
  cerrarFicha();
  seleccionarEspecieParaReportar(cientifico);
}

// ── Buscador, filtros y paginación ──
function initBuscador() {
  const input = document.getElementById('catalogo-buscar');
  if (!input) return;
  input.addEventListener('input', (e) => {
    consulta = e.target.value;
    visibles = PAGINA;
    renderCatalogo();
  });
}

function initFiltros() {
  const chips = document.querySelectorAll('.catalogo-filtro');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      filtroActivo = chip.dataset.filtro;
      visibles = PAGINA;
      renderCatalogo();
    });
  });
}

function initCargarMas() {
  const btn = document.getElementById('catalogo-cargar-mas');
  if (!btn) return;
  btn.addEventListener('click', () => {
    visibles += PAGINA;
    renderCatalogo();
  });
}

function initFicha() {
  const overlay = document.getElementById('ficha-overlay');
  const cerrarBtn = document.getElementById('ficha-cerrar');
  if (!overlay || !cerrarBtn) return;
  cerrarBtn.addEventListener('click', cerrarFicha);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrarFicha(); });
  document.getElementById('ficha-prev').addEventListener('click', () => moverFoto(-1));
  document.getElementById('ficha-next').addEventListener('click', () => moverFoto(1));
  document.getElementById('ficha-carrusel-img').addEventListener('click', () => {
    const img = document.getElementById('ficha-carrusel-img');
    if (img.src) abrirZoom(img.src, img.alt);
  });

  document.addEventListener('keydown', (e) => {
    if (overlay.hidden) return;
    if (e.key === 'Escape') cerrarFicha();
    if (e.key === 'ArrowLeft') moverFoto(-1);
    if (e.key === 'ArrowRight') moverFoto(1);
  });
}

function initZoom() {
  const overlay = document.getElementById('zoom-overlay');
  if (!overlay) return;
  overlay.addEventListener('click', cerrarZoom);
  document.addEventListener('keydown', (e) => {
    if (!overlay.hidden && e.key === 'Escape') cerrarZoom();
  });
}

// Resuelve el registro de especie que verá la ficha, combinando fuentes
// en cascada, sin que el componente de ficha necesite saber de dónde
// viene cada dato:
//   1. Nuestras 76 fichas (match exacto o por género "spp."): datos completos.
//   2. data/estatus-flora.json: solo estatus fiable para especies que
//      todavía no tienen ficha completa (ver data/README.md).
//   3. Lo que haya aportado la identificación (nombre común, foto).
// Si no hay nada fiable en 1 o 2, el estatus queda sin determinar y
// esa sección simplemente no aparece — nunca se infiere ni se inventa.
export function resolverEspecie({ cientifico, comunes, fotoDataUrl }) {
  const match = buscarPorCientifico(cientifico, ESPECIES);
  if (match) return match;

  const nc = normalizar(cientifico);
  const estatusExterno = ESTATUS_EXTERNO.find(e => normalizar(e.cientifico) === nc);

  return {
    cientifico,
    comunes: Array.isArray(comunes) ? comunes.filter(Boolean) : [],
    fotos: fotoDataUrl ? [{ image: fotoDataUrl }] : [],
    estatus: estatusExterno ? estatusExterno.estatus : null,
    fuentes: estatusExterno ? [estatusExterno.fuente] : [],
  };
}

function buscarPorCientifico(cientifico, especies) {
  const nc = normalizar(cientifico);
  let match = especies.find(e => normalizar(e.cientifico) === nc);
  if (match) return match;

  const genero = nc.split(' ')[0];
  match = especies.find(e => {
    const ec = normalizar(e.cientifico);
    return ec.endsWith(' spp.') && ec.split(' ')[0] === genero;
  });
  return match || null;
}

// Punto de entrada único desde identificar.js: siempre abre la misma
// ficha botánica, tanto si la especie ya está en la guía como si es la
// primera vez que aparece por una identificación de Pl@ntNet.
export function abrirFichaDesdeIdentificacion({ cientifico, comunes, fotoDataUrl }) {
  abrirFicha(resolverEspecie({ cientifico, comunes, fotoDataUrl }));
}

export function getEspecies() {
  return ESPECIES;
}

export async function initCatalogo() {
  initBuscador();
  initFiltros();
  initCargarMas();
  initFicha();
  initZoom();

  [ESPECIES, ESTATUS_EXTERNO] = await Promise.all([cargarDatos(), cargarEstatusExterno()]);
  renderDestacadas();
  renderCatalogo();
}
