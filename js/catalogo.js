import { CATALOGO_FLORA, FICHAS_AMPLIADAS, ESPECIES_RAMALES } from './catalogo-especies.js';
import { goToStepAndEnter } from './app.js';

const PAGINA = 12;

let filtroActivo = 'todas';
let consulta = '';
let visibles = PAGINA;

// Mapa catalogoId -> foto local, para reutilizar las fotos que ya
// tiene la aplicación en las especies del catálogo que coinciden.
const FOTOS_LOCALES = {};
ESPECIES_RAMALES.forEach(e => {
  if (e.catalogoId) FOTOS_LOCALES[e.catalogoId] = e.imagen;
});

// Fotografías del catálogo completo obtenidas de iNaturalist (solo con
// licencia reutilizable) — ver assets/especies/credits.json. Se cargan
// en tiempo de ejecución, igual que el resto de datos estáticos de la
// aplicación (p. ej. data/reportes-publicos.json).
let CREDITOS_FOTOS = {};

async function cargarCreditosFotos() {
  try {
    const resp = await fetch('assets/especies/credits.json', { cache: 'no-store' });
    if (!resp.ok) return;
    const data = await resp.json();
    data.forEach(c => { CREDITOS_FOTOS[c.id] = c; });
  } catch (err) {
    // Sin conexión o archivo no disponible: las tarjetas usan el estado
    // visual neutro definido para especies sin fotografía.
  }
}

function fotoDe(id) {
  if (FOTOS_LOCALES[id]) return { url: FOTOS_LOCALES[id], credito: null };
  const credito = CREDITOS_FOTOS[id];
  return credito ? { url: credito.image, credito } : { url: null, credito: null };
}

function normalizar(txt) {
  return (txt || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function coincide(entry, q) {
  if (!q) return true;
  const nq = normalizar(q);
  const campos = [entry.cientifico, ...(entry.comunes || [])];
  return campos.some(c => normalizar(c).includes(nq));
}

function pasaFiltro(entry) {
  if (filtroActivo === 'acuatica') return entry.acuatica;
  if (filtroActivo === 'terrestre') return !entry.acuatica;
  if (filtroActivo === 'ramales') {
    return ESPECIES_RAMALES.some(e => e.catalogoId === entry.id);
  }
  return true;
}

function ambitoTexto(ambito) {
  return ambito && ambito.trim() ? ambito : 'Todo el territorio nacional';
}

// ── Tarjeta de especie (catálogo completo) ──
function crearTarjeta(entry) {
  const { url: foto } = fotoDe(entry.id);
  const nombreComun = entry.comunes && entry.comunes[0] ? entry.comunes[0] : entry.cientifico;

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'especie-card' + (foto ? '' : ' especie-card--neutra');
  card.setAttribute('aria-label', 'Ver ficha de ' + nombreComun);

  card.innerHTML = `
    ${foto
      ? `<span class="especie-card__foto" style="background-image:url('${foto}')" aria-hidden="true"></span>`
      : `<span class="especie-card__foto especie-card__foto--neutra" aria-hidden="true">🌿</span>`}
    <span class="especie-card__cuerpo">
      <span class="especie-card__comun">${nombreComun}</span>
      <span class="especie-card__cientifico">${entry.cientifico}</span>
      ${entry.ambito ? `<span class="especie-card__ambito">${entry.ambito}</span>` : ''}
    </span>`;

  card.addEventListener('click', () => abrirFichaCatalogo(entry));
  return card;
}

function crearTarjetaDestacada(especie) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'especie-card especie-card--destacada';
  card.setAttribute('aria-label', 'Ver ficha de ' + especie.nombre);
  card.innerHTML = `
    <span class="especie-card__foto" style="background-image:url('${especie.imagen}')" aria-hidden="true"></span>
    <span class="especie-card__cuerpo">
      <span class="especie-card__comun">${especie.nombre}</span>
      <span class="especie-card__cientifico">${especie.cientifico}</span>
    </span>`;
  card.addEventListener('click', () => abrirFichaRamales(especie));
  return card;
}

// ── Render principal del catálogo completo (con paginación simple) ──
function renderCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  const vacio = document.getElementById('catalogo-vacio');
  const info = document.getElementById('catalogo-resultados-info');
  const btnMas = document.getElementById('catalogo-cargar-mas');
  if (!grid) return;

  const resultado = CATALOGO_FLORA.filter(e => pasaFiltro(e) && coincide(e, consulta));

  grid.innerHTML = '';
  resultado.slice(0, visibles).forEach(entry => grid.appendChild(crearTarjeta(entry)));

  vacio.hidden = resultado.length > 0;
  info.textContent = resultado.length
    ? `${resultado.length} especie${resultado.length === 1 ? '' : 's'} de flora del catálogo oficial`
    : '';

  btnMas.hidden = resultado.length <= visibles;
}

function renderDestacadas() {
  const cont = document.getElementById('catalogo-destacadas');
  if (!cont || cont.dataset.rendered) return;
  ESPECIES_RAMALES.forEach(especie => cont.appendChild(crearTarjetaDestacada(especie)));
  cont.dataset.rendered = 'true';
}

// ── Ficha visual ──
function abrirFichaBase({ nombreComun, cientifico, foto, credito, ambitoHtml, descripcionHtml, notaHtml, fichaUrl, onReportar }) {
  const overlay = document.getElementById('ficha-overlay');
  const fotoEl = document.getElementById('ficha-foto');
  const comunEl = document.getElementById('ficha-comun');
  const cientificoEl = document.getElementById('ficha-cientifico');
  const ambitoEl = document.getElementById('ficha-ambito');
  const descEl = document.getElementById('ficha-descripcion');
  const notaEl = document.getElementById('ficha-nota');
  const oficialBtn = document.getElementById('ficha-btn-oficial');
  const reportarBtn = document.getElementById('ficha-btn-reportar');

  let fotoHtml = `<span class="ficha-foto__neutra" aria-hidden="true">🌿</span>`;
  if (foto) {
    fotoHtml = `<img src="${foto}" alt="${nombreComun}">`;
    if (credito) {
      const licenciaLegible = (credito.imageLicense || '').toUpperCase().replace(/-/g, ' ');
      fotoHtml += `
        <a class="ficha-foto__credito" href="${credito.imageSourceUrl}" target="_blank" rel="noopener">
          Foto: ${credito.imageAuthor || 'iNaturalist'} · ${credito.imageSource} (${licenciaLegible})
        </a>`;
    }
  }
  fotoEl.innerHTML = fotoHtml;
  comunEl.textContent = nombreComun;
  cientificoEl.textContent = cientifico;
  ambitoEl.innerHTML = ambitoHtml || '';
  ambitoEl.hidden = !ambitoHtml;
  descEl.innerHTML = descripcionHtml || '';
  notaEl.innerHTML = notaHtml || '';
  notaEl.hidden = !notaHtml;

  if (fichaUrl) {
    oficialBtn.href = fichaUrl;
    oficialBtn.hidden = false;
  } else {
    oficialBtn.hidden = true;
  }

  reportarBtn.onclick = onReportar;

  overlay.hidden = false;
  void overlay.offsetWidth;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.ficha-panel').scrollTop = 0;
}

function abrirFichaCatalogo(entry) {
  const ampliada = FICHAS_AMPLIADAS[entry.id];
  const nombreComun = entry.comunes && entry.comunes[0] ? entry.comunes[0] : entry.cientifico;

  let descripcionHtml = '';
  if (ampliada) {
    descripcionHtml = `
      <p>${ampliada.descripcion}</p>
      <p><strong>Impacto:</strong> ${ampliada.impacto}</p>
      <p><strong>Distribución nativa:</strong> ${ampliada.distribucionNativa}</p>
      <p class="ficha-fuente">Resumen a partir de la ficha oficial del MITECO. Consulta el documento original para la información completa.</p>`;
  } else {
    descripcionHtml = `<p class="ficha-fuente">El MITECO no publica aquí más descripción que la ficha oficial en PDF. Consúltala para conocer sus características, impactos y distribución.</p>`;
  }

  const { url: foto, credito } = fotoDe(entry.id);

  abrirFichaBase({
    nombreComun,
    cientifico: entry.cientifico,
    foto,
    credito,
    ambitoHtml: `<strong>Ámbito de aplicación:</strong> ${ambitoTexto(entry.ambito)}`,
    descripcionHtml,
    fichaUrl: entry.ficha,
    onReportar: () => reportarEspecie({ cientifico: entry.cientifico, ramalesId: null }),
  });
}

function abrirFichaRamales(especie) {
  const entry = especie.catalogoId ? CATALOGO_FLORA.find(e => e.id === especie.catalogoId) : null;
  const ampliada = especie.catalogoId ? FICHAS_AMPLIADAS[especie.catalogoId] : null;

  let descripcionHtml = '';
  if (ampliada) {
    descripcionHtml = `
      <p>${ampliada.descripcion}</p>
      <p><strong>Impacto:</strong> ${ampliada.impacto}</p>
      <p><strong>Distribución nativa:</strong> ${ampliada.distribucionNativa}</p>
      <p class="ficha-fuente">Resumen a partir de la ficha oficial del MITECO. Consulta el documento original para la información completa.</p>`;
  } else if (entry) {
    descripcionHtml = `<p class="ficha-fuente">El MITECO no publica aquí más descripción que la ficha oficial en PDF. Consúltala para conocer sus características, impactos y distribución.</p>`;
  }

  abrirFichaBase({
    nombreComun: especie.nombre,
    cientifico: especie.cientifico,
    foto: especie.imagen,
    ambitoHtml: entry ? `<strong>Ámbito de aplicación:</strong> ${ambitoTexto(entry.ambito)}` : '',
    descripcionHtml,
    notaHtml: especie.notaCatalogo
      ? (entry ? especie.notaCatalogo : `⚠️ ${especie.notaCatalogo}`)
      : '',
    fichaUrl: entry ? entry.ficha : null,
    onReportar: () => reportarEspecie({ cientifico: especie.cientifico, ramalesId: especie.id }),
  });
}

function cerrarFicha() {
  const overlay = document.getElementById('ficha-overlay');
  if (!overlay || overlay.hidden) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  clearTimeout(cerrarFicha._t);
  cerrarFicha._t = setTimeout(() => { overlay.hidden = true; }, 200);
}

// ── Conexión con el flujo de reporte existente ──
// Reutiliza tal cual los botones y el estado ya existentes del
// asistente (especies.js / wizard.js): no se toca su lógica, solo se
// simula la misma selección que haría la persona usuaria a mano.
function reportarEspecie({ cientifico }) {
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

// ── Buscador y filtros ──
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarFicha(); });
}

export async function initCatalogo() {
  renderDestacadas();
  renderCatalogo();
  initBuscador();
  initFiltros();
  initCargarMas();
  initFicha();

  // Las fotos del catálogo completo llegan de un JSON estático; en
  // cuanto están disponibles se vuelve a pintar la rejilla ya visible.
  await cargarCreditosFotos();
  renderCatalogo();
}
