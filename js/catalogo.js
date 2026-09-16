import { goToStepAndEnter } from './app.js';

// ================================================================
// Guía Botánica de Ramales Natural
//
// Tres fuentes de datos, cada una con una responsabilidad distinta
// (ver data/README.md para el detalle y las fuentes citadas):
//
//   - ESPECIES (data/cantabria-flora.json): catálogo botánico general
//     de flora documentada en Cantabria (autóctona, exótica e
//     invasora), con fichas divulgativas. No es "la lista de
//     invasoras" — la mayoría de sus 104 especies actuales no lo son.
//   - CATALOGO_INVASORAS (data/catalogo-invasoras.json): fuente
//     INDEPENDIENTE y autoritativa sobre si una especie está
//     reconocida como invasora (Plan de Cantabria + CEEEI/MITECO).
//     Es la única que decide si una identificación puede generar un
//     registro — nunca el simple hecho de estar en ESPECIES.
//   - ESTATUS_EXTERNO (data/estatus-flora.json): estatus puntual
//     (autóctona/exótica) para especies aún sin ficha en ESPECIES.
//
// No se ha redactado ninguna descripción inventada: cuando una
// sección no tiene información fiable disponible se omite en la
// ficha en lugar de rellenarla artificialmente.
// ================================================================

const PAGINA = 12;

let ESPECIES = [];
let CATALOGO_INVASORAS = []; // data/catalogo-invasoras.json — fuente independiente
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
  // Las fichas con esquema nuevo ya traen su propio `fuentes` (p.ej.
  // Flora iberica/GBIF para una autóctona) — se respeta tal cual. Solo
  // para las fichas antiguas que aún no lo tienen se reconstruye a
  // partir del Plan de Cantabria (+CEEEI si aplica), que es de donde
  // procedían literalmente sus datos.
  let fuentes = e.fuentes;
  if (!Array.isArray(fuentes) || !fuentes.length) {
    fuentes = [FUENTE_PLAN_CANTABRIA];
    if (e.enCatalogoNacionalCEEEI) fuentes.push(FUENTE_CEEEI);
  }
  return {
    ...e,
    comunes: Array.isArray(e.comunes) ? e.comunes.filter(Boolean) : (e.comunes ? [e.comunes] : []),
    sinonimos: Array.isArray(e.sinonimos) ? e.sinonimos.filter(Boolean) : [],
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

async function cargarCatalogoInvasoras() {
  try {
    const resp = await fetch('data/catalogo-invasoras.json', { cache: 'no-store' });
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
  const campos = [entry.cientifico, ...(entry.sinonimos || []), ...(entry.comunes || [])];
  return campos.some(c => normalizar(c).includes(nq));
}

function pasaFiltro(entry) {
  if (filtroActivo === 'todas') return true;
  if (filtroActivo === 'destacadas') return !!entry.destacadaRamales;
  if (filtroActivo === 'exotica') return entry.estatus === 'exotica';
  return entry.estatus === filtroActivo;
}

const ETIQUETA_CATEGORIA = {
  herbacea: 'Herbácea',
  arbusto: 'Arbusto',
  arbol: 'Árbol',
  acuatica: 'Acuática',
};

// Estatus botánico general (guía) — usado en las tarjetas/fichas de la
// guía. NO decide por sí solo si algo es invasora a efectos de reporte;
// para eso está resolverNivelInvasion().
const ETIQUETA_ESTATUS = {
  autoctona: { texto: 'Autóctona', clase: 'autoctona' },
  exotica: { texto: 'No invasora', clase: 'exotica' },
  invasora: { texto: 'Invasora', clase: 'invasora' },
};

// Los tres estados visuales que puede ver la persona usuaria tras una
// identificación (independientemente del detalle interno que se guarde):
// 🔴 invasora / 🟢 autoctona / ⚪ exotica_no_invasora / (desconocida → sin etiqueta)
const ETIQUETA_NIVEL = {
  invasora: { texto: 'Invasora', clase: 'invasora', emoji: '🔴' },
  autoctona: { texto: 'Autóctona', clase: 'autoctona', emoji: '🟢' },
  exotica_no_invasora: { texto: 'No invasora', clase: 'exotica', emoji: '⚪' },
};

// Mensaje del estado vacío: distinto según si la categoría todavía no
// tiene muchas especies cargadas o si simplemente no hay resultados
// para la búsqueda/filtro actual.
const MENSAJE_VACIO_CATEGORIA = {
  autoctona: 'Todavía estamos ampliando las especies autóctonas de la guía.',
  exotica: 'Todavía estamos ampliando las especies exóticas no invasoras de la guía.',
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
// Galería: [FOTO PRINCIPAL] ← 1/N → con una tira de miniaturas debajo
// para saltar directamente a cualquier fotografía. Misma experiencia
// para cualquier especie, tenga 1 o 5 fotografías.
function renderMiniaturas() {
  const fotos = (fichaActual && fichaActual.fotos) || [];
  const cont = document.getElementById('ficha-miniaturas');
  cont.innerHTML = '';
  cont.hidden = fotos.length < 2;
  if (fotos.length < 2) return;

  fotos.forEach((foto, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ficha-miniatura-btn' + (i === fotoActual ? ' is-activa' : '');
    btn.style.backgroundImage = `url('${foto.image}')`;
    btn.setAttribute('aria-label', `Ver fotografía ${i + 1} de ${fotos.length}`);
    btn.addEventListener('click', () => {
      fotoActual = i;
      actualizarFoto();
    });
    cont.appendChild(btn);
  });
}

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
    renderMiniaturas();
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

  // Actualiza solo la miniatura activa si la tira ya está construida
  // para esta ficha; si no (primera vez o cambio de especie), la crea.
  const cont = document.getElementById('ficha-miniaturas');
  if (cont.children.length !== fotos.length) {
    renderMiniaturas();
  } else {
    [...cont.children].forEach((btn, i) => btn.classList.toggle('is-activa', i === fotoActual));
  }
}

function moverFoto(delta) {
  const fotos = (fichaActual && fichaActual.fotos) || [];
  if (fotos.length < 2) return;
  fotoActual = (fotoActual + delta + fotos.length) % fotos.length;
  actualizarFoto();
}

// Helpers genéricos para mostrar/ocultar una sección de la ficha según
// si hay contenido real — el mismo patrón para cualquier campo nuevo
// que se añada a una especie, sin tener que tocar la estructura visual.
function rellenarParrafo(seccionId, textoId, valor) {
  const seccion = document.getElementById(seccionId);
  if (valor) {
    document.getElementById(textoId).textContent = valor;
    seccion.hidden = false;
  } else {
    seccion.hidden = true;
  }
}

function rellenarLista(seccionId, listaId, items) {
  const seccion = document.getElementById(seccionId);
  if (items && items.length) {
    document.getElementById(listaId).innerHTML = items.join('');
    seccion.hidden = false;
  } else {
    seccion.hidden = true;
  }
}

// Ficha botánica única: recibe siempre el mismo tipo de registro,
// tanto si procede de las fichas propias como de una identificación de
// Pl@ntNet resuelta por resolverEspecie(). No sabe ni le importa de
// dónde viene cada dato: cada sección se muestra si hay contenido y se
// oculta si no lo hay, nunca con un aviso de "no disponible". El campo
// `nivelInvasion` (calculado siempre por resolverNivelInvasion, nunca
// por la simple presencia en la guía) decide el estatus mostrado y si
// se puede generar un registro.
function abrirFicha(entry) {
  fichaActual = entry;
  fotoActual = 0;

  const nombreComun = nombreComunDe(entry);
  document.getElementById('ficha-comun').textContent = nombreComun;
  document.getElementById('ficha-cientifico').textContent = entry.cientifico;
  actualizarFoto();

  // Estatus (🟢 autóctona / ⚪ no invasora / 🔴 invasora) — solo se
  // muestra cuando hay una fuente fiable que lo respalde; si es
  // desconocida no se inventa ninguna etiqueta.
  const nivel = entry.nivelInvasion || 'desconocida';
  const estatusEl = document.getElementById('ficha-estatus');
  const etiquetaNivel = ETIQUETA_NIVEL[nivel];
  if (etiquetaNivel) {
    estatusEl.textContent = etiquetaNivel.emoji + ' ' + etiquetaNivel.texto;
    estatusEl.className = 'ficha-estatus ficha-estatus--' + etiquetaNivel.clase;
    estatusEl.hidden = false;
  } else {
    estatusEl.hidden = true;
  }

  rellenarParrafo('ficha-seccion-quees', 'ficha-quees', entry.queEs);
  rellenarParrafo('ficha-seccion-reconocer', 'ficha-reconocer', entry.comoReconocerla);

  // Hojas, flores y frutos
  const partes = [];
  if (entry.hojas) partes.push(`<li><strong>Hojas:</strong> ${entry.hojas}</li>`);
  if (entry.flores) partes.push(`<li><strong>Flores:</strong> ${entry.flores}</li>`);
  if (entry.frutosSemillas) partes.push(`<li><strong>Frutos/semillas:</strong> ${entry.frutosSemillas}</li>`);
  rellenarLista('ficha-seccion-partes', 'ficha-partes', partes);

  // Floración y fructificación
  const ciclo = [];
  if (entry.floracion) ciclo.push(`<li><strong>Floración:</strong> ${entry.floracion}</li>`);
  if (entry.fructificacion) ciclo.push(`<li><strong>Fructificación:</strong> ${entry.fructificacion}</li>`);
  rellenarLista('ficha-seccion-ciclo', 'ficha-ciclo', ciclo);

  // Características (familia, biotipo, origen)
  const caracteristicas = [];
  if (entry.familia) caracteristicas.push(`<li><strong>Familia:</strong> ${entry.familia}</li>`);
  if (entry.biotipo) caracteristicas.push(`<li><strong>Tipo de planta:</strong> ${entry.biotipo}</li>`);
  if (entry.origen) caracteristicas.push(`<li><strong>Origen:</strong> ${entry.origen}</li>`);
  rellenarLista('ficha-seccion-caracteristicas', 'ficha-caracteristicas', caracteristicas);

  // ¿Dónde vive?
  const dondePartes = [entry.habitat, entry.distribucionGeneralidades].filter(Boolean);
  rellenarParrafo('ficha-seccion-donde', 'ficha-donde', dondePartes.join(' ') || null);

  rellenarParrafo('ficha-seccion-ecologico', 'ficha-ecologico', entry.interesEcologico);
  rellenarParrafo('ficha-seccion-cantabria', 'ficha-cantabria', entry.importanciaCantabria);
  rellenarParrafo('ficha-seccion-curiosidades', 'ficha-curiosidades', entry.curiosidades);

  // ¿Es una especie invasora? — el estatus legal/de control solo se
  // muestra cuando nivelInvasion (independiente) confirma que lo es;
  // si hay medidas de control conocidas se añaden, si no, basta con la
  // referencia a la fuente que la reconoce como invasora.
  const invasoraPartes = [];
  if (nivel === 'invasora') {
    const ambitoNacional = (entry.fuentesInvasion || []).some(f => /CEEEI|MITECO/i.test(f.label || ''));
    invasoraPartes.push(ambitoNacional
      ? 'Está reconocida como especie exótica invasora en el Catálogo Español de Especies Exóticas Invasoras (CEEEI), de ámbito estatal.'
      : 'Está identificada como especie objetivo en el Plan Estratégico Regional de Gestión y Control de Especies Exóticas Invasoras de Cantabria.');
    if (entry.erradicacionCantabria) {
      invasoraPartes.push(`Posibilidad de erradicación en Cantabria: ${entry.erradicacionCantabria.toLowerCase()}.`);
    }
    if (entry.medidasControl) invasoraPartes.push(entry.medidasControl);
  }
  rellenarParrafo('ficha-seccion-invasora', 'ficha-invasora', invasoraPartes.join(' ') || null);

  // Fuentes — construidas a partir de entry.fuentes (datos botánicos) y
  // entry.fuentesInvasion (estatus invasor, si aplica), nunca señalando
  // si el origen es "externo" o propio.
  const fuentesUrls = new Set();
  const fuentes = [];
  [...(entry.fuentes || []), ...(entry.fuentesInvasion || [])].forEach(f => {
    if (!f || !f.url || fuentesUrls.has(f.url)) return;
    fuentesUrls.add(f.url);
    fuentes.push(`<li><a href="${f.url}" target="_blank" rel="noopener">${f.label}</a></li>`);
  });
  (entry.fotos || []).forEach(f => {
    if (f.imageSourceUrl && f.imageSource) {
      fuentes.push(`<li><a href="${f.imageSourceUrl}" target="_blank" rel="noopener">${f.imageSource}</a> — fotografía (${(f.imageAuthor || '').replace(/^\(c\)\s*/, '')})</li>`);
    }
  });
  rellenarLista('ficha-seccion-fuentes', 'ficha-fuentes', fuentes);

  // Botón ficha oficial (solo si existe una, del catálogo nacional)
  const oficialBtn = document.getElementById('ficha-btn-oficial');
  if (entry.fichaNacionalUrl) {
    oficialBtn.href = entry.fichaNacionalUrl;
    oficialBtn.hidden = false;
  } else {
    oficialBtn.hidden = true;
  }

  // Solo se ofrece generar un registro cuando el estatus resuelto de
  // forma independiente es realmente "invasora" — nunca por estar
  // simplemente en la guía botánica, ni para autóctonas ni para
  // exóticas no invasoras.
  const reportarBtn = document.getElementById('ficha-btn-reportar');
  if (nivel === 'invasora') {
    reportarBtn.hidden = false;
    reportarBtn.onclick = () => reportarEspecie(entry.cientifico);
  } else {
    reportarBtn.hidden = true;
    reportarBtn.onclick = null;
  }

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

// Busca una especie por nombre científico dentro de una lista,
// aceptando también sus sinónimos (para que un nombre distinto
// devuelto por Pl@ntNet, p.ej. "Reynoutria japonica", encuentre la
// misma ficha que "Fallopia japonica") y, como último recurso, una
// entrada genérica de su mismo género ("Cortaderia spp.").
function coincideNombre(nombreBuscado, entry) {
  const nc = normalizar(nombreBuscado);
  if (normalizar(entry.cientifico) === nc) return true;
  return (entry.sinonimos || []).some(s => normalizar(s) === nc);
}

function buscarPorCientifico(cientifico, lista) {
  const match = lista.find(e => coincideNombre(cientifico, e));
  if (match) return match;

  const genero = normalizar(cientifico).split(' ')[0];
  return lista.find(e => {
    const ec = normalizar(e.cientifico);
    return (ec.endsWith(' spp.') || ec.endsWith(' sp.')) && ec.split(' ')[0] === genero;
  }) || null;
}

// Única fuente de verdad sobre si una especie es invasora, siempre
// independiente de si tiene o no ficha en la guía botánica (ESPECIES).
// Consulta primero el catálogo independiente de invasoras (Plan de
// Cantabria + CEEEI/MITECO); si no hay coincidencia ahí, nunca se
// concluye "invasora" solo porque la especie esté en la guía.
function resolverNivelInvasion(cientifico, guia) {
  const refInvasora = buscarPorCientifico(cientifico, CATALOGO_INVASORAS);
  if (refInvasora) {
    return { nivel: 'invasora', fuentesInvasion: refInvasora.fuentes || [] };
  }
  if (guia && guia.estatus === 'autoctona') return { nivel: 'autoctona', fuentesInvasion: [] };
  if (guia && guia.estatus === 'exotica') return { nivel: 'exotica_no_invasora', fuentesInvasion: [] };

  const externo = buscarPorCientifico(cientifico, ESTATUS_EXTERNO);
  if (externo) {
    const nivel = externo.estatus === 'autoctona' ? 'autoctona'
      : externo.estatus === 'exotica' ? 'exotica_no_invasora'
      : 'desconocida';
    return { nivel, fuentesInvasion: [], fuenteEstatus: externo.fuente };
  }

  return { nivel: 'desconocida', fuentesInvasion: [] };
}

// Resuelve el registro de especie que verá la ficha, combinando fuentes
// en cascada, sin que el componente de ficha necesite saber de dónde
// viene cada dato:
//   1. La guía botánica (ESPECIES): datos completos si existe ficha.
//   2. El catálogo independiente de invasoras y data/estatus-flora.json:
//      determinan nivelInvasion (🔴/🟢/⚪) también para especies sin
//      ficha completa todavía.
//   3. Lo que haya aportado la identificación (nombre común, foto).
// Si nada de lo anterior da una base fiable, nivelInvasion es
// "desconocida" y no se muestra ninguna etiqueta — nunca se infiere.
export function resolverEspecie({ cientifico, comunes, fotoDataUrl }) {
  const guia = buscarPorCientifico(cientifico, ESPECIES);
  const { nivel, fuentesInvasion, fuenteEstatus } = resolverNivelInvasion(cientifico, guia);

  if (guia) {
    return { ...guia, nivelInvasion: nivel, fuentesInvasion };
  }

  return {
    cientifico,
    comunes: Array.isArray(comunes) ? comunes.filter(Boolean) : [],
    fotos: fotoDataUrl ? [{ image: fotoDataUrl }] : [],
    estatus: nivel === 'autoctona' ? 'autoctona' : nivel === 'exotica_no_invasora' ? 'exotica' : null,
    fuentes: fuenteEstatus ? [fuenteEstatus] : [],
    nivelInvasion: nivel,
    fuentesInvasion,
  };
}

// Punto de entrada único desde identificar.js: siempre abre la misma
// ficha botánica, tanto si la especie ya está en la guía como si es la
// primera vez que aparece por una identificación de Pl@ntNet.
export function abrirFichaDesdeIdentificacion({ cientifico, comunes, fotoDataUrl }) {
  abrirFicha(resolverEspecie({ cientifico, comunes, fotoDataUrl }));
}

export { ETIQUETA_NIVEL };

export function getEspecies() {
  return ESPECIES;
}

export async function initCatalogo() {
  initBuscador();
  initFiltros();
  initCargarMas();
  initFicha();
  initZoom();

  [ESPECIES, CATALOGO_INVASORAS, ESTATUS_EXTERNO] = await Promise.all([
    cargarDatos(),
    cargarCatalogoInvasoras(),
    cargarEstatusExterno(),
  ]);
  renderDestacadas();
  renderCatalogo();
}
