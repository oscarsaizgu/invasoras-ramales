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
function normalizarEspecie(e) {
  return {
    ...e,
    comunes: Array.isArray(e.comunes) ? e.comunes.filter(Boolean) : (e.comunes ? [e.comunes] : []),
    fotos: Array.isArray(e.fotos) ? e.fotos.filter(f => f && f.image) : [],
  };
}

function nombreComunDe(entry) {
  return (entry.comunes && entry.comunes.length) ? entry.comunes[0] : 'Nombre común no disponible';
}

async function cargarDatos() {
  try {
    const resp = await fetch('data/cantabria-flora.json', { cache: 'no-store' });
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.map(normalizarEspecie);
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
  if (filtroActivo === 'ramales') return entry.destacadaRamales;
  if (filtroActivo === 'todas') return true;
  return entry.categoria === filtroActivo;
}

const ETIQUETA_CATEGORIA = {
  herbacea: 'Herbácea',
  arbusto: 'Arbusto',
  arbol: 'Árbol',
  acuatica: 'Acuática',
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

  card.innerHTML = `
    ${foto
      ? `<span class="especie-card__foto" style="background-image:url('${foto}')" aria-hidden="true"></span>`
      : `<span class="especie-card__foto especie-card__foto--neutra" aria-hidden="true">🌿</span>`}
    <span class="especie-card__cuerpo">
      <span class="especie-card__comun">${nombreComun}</span>
      <span class="especie-card__cientifico">${entry.cientifico}</span>
      ${!destacada && etiquetaCategoria ? `<span class="especie-card__ambito">${etiquetaCategoria}</span>` : ''}
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
  info.textContent = resultado.length
    ? `${resultado.length} especie${resultado.length === 1 ? '' : 's'} de la guía de Cantabria`
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

function abrirFicha(entry) {
  fichaActual = entry;
  fotoActual = 0;

  const nombreComun = nombreComunDe(entry);
  document.getElementById('ficha-comun').textContent = nombreComun;
  document.getElementById('ficha-cientifico').textContent = entry.cientifico;
  actualizarFoto();

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

  // ¿Es una especie invasora?
  const invasoraPartes = [];
  invasoraPartes.push(entry.enCatalogoNacionalCEEEI
    ? 'Está incluida en el Catálogo Español de Especies Exóticas Invasoras (CEEEI) de ámbito estatal.'
    : 'No figura en el Catálogo Español de Especies Exóticas Invasoras (CEEEI) de ámbito estatal, pero sí está identificada como especie objetivo en el Plan Estratégico Regional de Cantabria.');
  if (entry.erradicacionCantabria) {
    invasoraPartes.push(`Posibilidad de erradicación en Cantabria: ${entry.erradicacionCantabria.toLowerCase()}.`);
  }
  if (entry.medidasControl) {
    invasoraPartes.push(entry.medidasControl);
  }
  document.getElementById('ficha-invasora').textContent = invasoraPartes.join(' ');
  document.getElementById('ficha-seccion-invasora').hidden = false;

  // Fuentes
  const fuentes = [];
  fuentes.push('<li><a href="https://www.cantabria.es/documents/16835/6017188/Fichas_Sp_Objetivo_Flora_Rev01.pdf" target="_blank" rel="noopener">Plan Estratégico Regional de Gestión y Control de Especies Exóticas Invasoras de Cantabria</a> — Gobierno de Cantabria (2017)</li>');
  if (entry.enCatalogoNacionalCEEEI) {
    fuentes.push('<li><a href="https://www.miteco.gob.es/es/biodiversidad/temas/conservacion-de-especies/especies-exoticas-invasoras/ce_eei_flora.html" target="_blank" rel="noopener">Catálogo Español de Especies Exóticas Invasoras (CEEEI)</a> — MITECO</li>');
  }
  (entry.fotos || []).forEach(f => {
    if (f.imageSourceUrl && f.imageSource) {
      fuentes.push(`<li><a href="${f.imageSourceUrl}" target="_blank" rel="noopener">${f.imageSource}</a> — fotografía (${(f.imageAuthor || '').replace(/^\(c\)\s*/, '')})</li>`);
    }
  });
  document.getElementById('ficha-fuentes').innerHTML = fuentes.join('');

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
// la misma selección que haría la persona usuaria a mano.
function reportarEspecie(cientifico) {
  const boton = document.querySelector(`.species-btn[data-especie="${CSS.escape(cientifico)}"]`);
  if (boton) {
    boton.click();
  } else {
    const otraBtn = document.querySelector('.species-btn--other');
    const otraInput = document.getElementById('otra-descripcion');
    if (otraBtn) otraBtn.click();
    if (otraInput) otraInput.value = cientifico;
  }
  cerrarFicha();
  goToStepAndEnter('especie');
}

// Botón "Ayúdame a identificarla": todavía no hay IA (fase futura). Por
// ahora selecciona "Otra / No sé" y lleva directamente al paso de la foto
// del flujo de reporte que ya existe, sin tocar su lógica.
function ayudameAIdentificarla() {
  const otraBtn = document.querySelector('.species-btn--other');
  if (otraBtn) otraBtn.click();
  goToStepAndEnter('foto');
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

function initIdentificar() {
  const btn = document.getElementById('btn-identificar');
  if (btn) btn.addEventListener('click', ayudameAIdentificarla);
}

export async function initCatalogo() {
  initBuscador();
  initFiltros();
  initCargarMas();
  initFicha();
  initZoom();
  initIdentificar();

  ESPECIES = await cargarDatos();
  renderDestacadas();
  renderCatalogo();
}
