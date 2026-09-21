// ================================================================
// Guía Botánica de Ramales Natural
//
// Tres fuentes de datos, cada una con una responsabilidad distinta
// (ver data/README.md para el detalle y las fuentes citadas):
//
//   - ESPECIES (data/cantabria-flora.json): guía botánica de la flora
//     de Cantabria con fichas verificadas. Cada ficha lleva su
//     `estatus` botánico (autoctona | aloctona | invasora | dudosa) y
//     las fuentes por campo. No es "la lista de invasoras".
//   - CATALOGO_INVASORAS (data/catalogo-invasoras.json): fuente
//     INDEPENDIENTE y autoritativa sobre si una especie es invasora:
//     solo las especies del Catálogo Español de Especies Exóticas
//     Invasoras (CEEEI, MITECO) cuyo ámbito incluye Cantabria.
//     Es la única que decide si una identificación puede generar un
//     registro — nunca el simple hecho de estar en ESPECIES ni el
//     `estatus` de la ficha.
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

// La página Guía Botánica (guia-botanica.html) muestra TODO el catálogo
// (autóctonas, alóctonas, invasoras y pendientes de revisión). Cada
// entrada lleva su `nivelInvasion` ya resuelto por resolverNivelInvasion()
// — la misma fuente de verdad que usan las fichas y la identificación —,
// de modo que "invasora" sale siempre del CEEEI (catalogo-invasoras.json)
// y nunca del simple hecho de estar en este array.
let ESPECIES_GUIA = [];

let filtroActivo = 'todas';
let filtroEstatus = 'todas';
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
  url: 'https://www.cantabria.es/detalle/-/journal_content/56_INSTANCE_DETALLE/16835/6017320',
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

// Además de quitar tildes y mayúsculas, "×" (signo de híbrido, tal como lo
// escriben POWO o Pl@ntNet) se trata igual que la "x" de las fichas.
function normalizar(txt) {
  return (txt || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/×/g, 'x').toLowerCase();
}

function coincide(entry, q) {
  if (!q) return true;
  const nq = normalizar(q);
  const campos = [entry.cientifico, ...(entry.sinonimos || []), ...(entry.comunes || [])];
  return campos.some(c => normalizar(c).includes(nq));
}

// Filtra por categoría/biotipo (herbacea/arbusto/arbol/acuatica), el
// mismo campo `categoria` que ya trae cada especie en cantabria-flora.json
// — no se inventa ninguna categoría nueva.
function pasaFiltro(entry) {
  if (filtroActivo !== 'todas' && entry.categoria !== filtroActivo) return false;
  if (filtroEstatus !== 'todas' && entry.nivelInvasion !== filtroEstatus) return false;
  return true;
}

// Los estados visuales que puede ver la persona usuaria (en la guía y tras
// una identificación), independientemente del detalle interno que se guarde:
// 🔴 invasora (solo CEEEI + ámbito Cantabria) / 🟢 autóctona / 🟠 alóctona
// (presente en Cantabria pero NO catalogada como invasora) / ⚪ pendiente de
// revisión (no puede determinarse con las fuentes consultadas). El nivel
// interno 'exotica_no_invasora' se conserva por compatibilidad con
// identificar.js y las clases CSS ya existentes; su etiqueta pública es
// "Alóctona".
const ETIQUETA_NIVEL = {
  invasora: { texto: 'Exótica invasora', clase: 'invasora', emoji: '🔴' },
  autoctona: { texto: 'Autóctona', clase: 'autoctona', emoji: '🟢' },
  exotica_no_invasora: { texto: 'Alóctona', clase: 'exotica', emoji: '🟠' },
  dudosa: { texto: 'Estatus pendiente de revisión', clase: 'dudosa', emoji: '⚪' },
};

// ── Tarjetas ──
function crearTarjeta(entry) {
  const nombreComun = nombreComunDe(entry);
  const foto = entry.fotos && entry.fotos[0] ? entry.fotos[0].image : null;
  const etiqueta = ETIQUETA_NIVEL[entry.nivelInvasion];

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'especie-card' + (foto ? '' : ' especie-card--neutra');
  card.setAttribute('aria-label', 'Ver la especie: ' + nombreComun + (etiqueta ? ' (' + etiqueta.texto + ')' : ''));

  card.innerHTML = `
    ${foto
      ? `<span class="especie-card__foto" style="background-image:url('${foto}')" aria-hidden="true"></span>`
      : `<span class="especie-card__foto especie-card__foto--neutra" aria-hidden="true">🌿</span>`}
    <span class="especie-card__cuerpo">
      <span class="especie-card__comun">${nombreComun}</span>
      <span class="especie-card__cientifico">${entry.cientifico}</span>
      ${etiqueta ? `<span class="especie-card__badge especie-card__badge--${etiqueta.clase}">${etiqueta.emoji} ${etiqueta.texto}</span>` : ''}
      <span class="especie-card__ver">Ver la especie →</span>
    </span>`;

  card.addEventListener('click', () => abrirFicha(entry));
  return card;
}

function renderCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  const vacio = document.getElementById('catalogo-vacio');
  const info = document.getElementById('catalogo-resultados-info');
  const btnMas = document.getElementById('catalogo-cargar-mas');
  if (!grid) return;

  const resultado = ESPECIES_GUIA.filter(e => pasaFiltro(e) && coincide(e, consulta));

  grid.innerHTML = '';
  resultado.slice(0, visibles).forEach(entry => grid.appendChild(crearTarjeta(entry)));

  vacio.hidden = resultado.length > 0;
  vacio.textContent = 'No hemos encontrado ninguna especie con ese nombre.';
  info.textContent = resultado.length
    ? `${resultado.length} especie${resultado.length === 1 ? '' : 's'}`
    : '';
  btnMas.hidden = resultado.length <= visibles;
}

// ── Ficha con carrusel de fotografías ──
// Galería: [FOTO PRINCIPAL] ← 1/N → con una tira de miniaturas debajo,
// ambas leyendo SIEMPRE del mismo array `fichaActual.fotos` por el
// mismo índice — no hay una lista separada para las miniaturas, así
// que no pueden desincronizarse entre sí.
let miniaturasDe = null; // referencia al array `fotos` ya pintado en la tira

function renderMiniaturas() {
  const fotos = (fichaActual && fichaActual.fotos) || [];
  const cont = document.getElementById('ficha-miniaturas');
  cont.innerHTML = '';
  cont.hidden = fotos.length < 2;
  miniaturasDe = fotos;
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

  // Solo reconstruye la tira de miniaturas si ha cambiado de especie
  // (comparando el propio array, no su longitud: dos especies distintas
  // pueden tener el mismo número de fotos). Si es la misma especie,
  // basta con mover el resalte a la miniatura activa.
  const cont = document.getElementById('ficha-miniaturas');
  if (miniaturasDe !== fotos) {
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
// No todas las páginas incluyen todas las secciones de la ficha (por
// ejemplo, guia-botanica.html solo muestra invasoras y omite secciones
// como "¿Qué es?" o "Curiosidades" que aquí nunca tienen contenido) —
// por eso ambas funciones comprueban que el elemento exista antes de
// tocarlo, en vez de asumir que siempre está presente.
function rellenarParrafo(seccionId, textoId, valor) {
  const seccion = document.getElementById(seccionId);
  if (!seccion) return;
  if (valor) {
    document.getElementById(textoId).textContent = valor;
    seccion.hidden = false;
  } else {
    seccion.hidden = true;
  }
}

function rellenarLista(seccionId, listaId, items) {
  const seccion = document.getElementById(seccionId);
  if (!seccion) return;
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

  // Nomenclatura: nombre aceptado (con autor, si consta) y sinónimos, para
  // que quien busque por un nombre antiguo (o el que devuelva Pl@ntNet)
  // entienda por qué el nombre de la ficha es otro.
  const nomenclatura = [];
  if (entry.autor) nomenclatura.push(`<li><strong>Nombre aceptado:</strong> <em>${entry.cientifico}</em> ${entry.autor}</li>`);
  const sinonimosVisibles = (entry.sinonimos || []).filter(s => s && normalizar(s) !== normalizar(entry.cientifico));
  if (sinonimosVisibles.length) {
    nomenclatura.push(`<li><strong>También conocida como:</strong> ${sinonimosVisibles.map(s => `<em>${s}</em>`).join(', ')}</li>`);
  }
  if (entry.nombreCEEEI && normalizar(entry.nombreCEEEI) !== normalizar(entry.cientifico)) {
    nomenclatura.push(`<li><strong>Nombre en el CEEEI:</strong> <em>${entry.nombreCEEEI}</em></li>`);
  }
  rellenarLista('ficha-seccion-nomenclatura', 'ficha-nomenclatura', nomenclatura);

  // Estatus en Cantabria: por qué lleva la etiqueta que lleva.
  rellenarParrafo('ficha-seccion-estatus-detalle', 'ficha-estatus-detalle', entry.estatusDetalle);

  // Características (familia, biotipo, origen, presencia en Cantabria...)
  const caracteristicas = [];
  if (entry.familia) {
    const alt = entry.familiaFloraIberica && normalizar(entry.familiaFloraIberica) !== normalizar(entry.familia)
      ? ` (en Flora Ibérica: ${entry.familiaFloraIberica})` : '';
    caracteristicas.push(`<li><strong>Familia:</strong> ${entry.familia}${alt}</li>`);
  }
  if (entry.biotipo) caracteristicas.push(`<li><strong>Tipo de planta:</strong> ${entry.biotipo}</li>`);
  if (entry.origen) caracteristicas.push(`<li><strong>Origen:</strong> ${entry.origen}</li>`);
  if (entry.presenciaCantabria) caracteristicas.push(`<li><strong>Presencia en Cantabria:</strong> ${entry.presenciaCantabria}</li>`);
  if (entry.erradicacionCantabria) {
    caracteristicas.push(`<li><strong>Estado en Cantabria:</strong> posibilidad de erradicación ${entry.erradicacionCantabria.toLowerCase()}</li>`);
  }
  rellenarLista('ficha-seccion-caracteristicas', 'ficha-caracteristicas', caracteristicas);

  // Posible confusión con otras especies (solo cuando hay fuente que lo
  // respalde en la propia ficha; nunca se rellena por defecto).
  const confusiones = (entry.confusiones || [])
    .filter(c => c && c.especie && c.nota)
    .map(c => `<li><strong><em>${c.especie}</em>:</strong> ${c.nota}</li>`);
  rellenarLista('ficha-seccion-confusiones', 'ficha-confusiones', confusiones);

  // Hábitat y distribución en Cantabria — dos secciones separadas
  // (antes iban juntas en "¿Dónde vive?").
  rellenarParrafo('ficha-seccion-donde', 'ficha-donde', entry.habitat);
  rellenarParrafo('ficha-seccion-distribucion', 'ficha-distribucion', entry.distribucionGeneralidades);

  rellenarParrafo('ficha-seccion-ecologico', 'ficha-ecologico', entry.interesEcologico);
  rellenarParrafo('ficha-seccion-cantabria', 'ficha-cantabria', entry.importanciaCantabria);
  rellenarParrafo('ficha-seccion-curiosidades', 'ficha-curiosidades', entry.curiosidades);

  // ¿Por qué es invasora? — el estatus legal/de control solo se
  // muestra cuando nivelInvasion (independiente) confirma que lo es;
  // si hay medidas de control conocidas se añaden, si no, basta con la
  // referencia a la fuente que la reconoce como invasora. La posibilidad
  // de erradicación ya se muestra en Características, así que aquí no
  // se repite.
  const invasoraPartes = [];
  if (nivel === 'invasora') {
    const ambito = entry.ambitoCEEEI || (entry.fuentesInvasion || []).map(f => f.ambito).find(Boolean);
    if (ambito) {
      invasoraPartes.push(`Está incluida en el Catálogo Español de Especies Exóticas Invasoras (CEEEI). Ámbito de aplicación: ${ambito}, que incluye Cantabria.`);
    } else {
      invasoraPartes.push('Está incluida en el Catálogo Español de Especies Exóticas Invasoras (CEEEI), con un ámbito de aplicación que incluye Cantabria.');
    }
    if (entry.medidasControl) invasoraPartes.push(entry.medidasControl);
  }
  rellenarParrafo('ficha-seccion-invasora', 'ficha-invasora', invasoraPartes.join(' ') || null);

  // Información que todavía no se ha podido contrastar con fuentes
  // fiables: se dice claramente en vez de omitirlo o darlo por bueno.
  const pendientes = (entry.pendiente || []).filter(Boolean).map(p => `<li>${p}</li>`);
  rellenarLista('ficha-seccion-pendiente', 'ficha-pendiente', pendientes);

  // Fuentes — agrupadas por tipo de dato (taxonomía, estatus, distribución,
  // descripción) cuando la ficha las trae desglosadas (fuentesPorCampo);
  // si no, se mantiene el listado único de siempre (entry.fuentes +
  // entry.fuentesInvasion). Las fuentes de cada fotografía NO se listan
  // aquí: ya aparecen debajo de la propia foto (ver actualizarFoto()).
  const fuentes = [];
  // Una fuente sin URL verificable se muestra como texto, sin enlace.
  const enlace = f => (f.url ? `<a href="${f.url}" target="_blank" rel="noopener">${f.label}</a>` : f.label);
  if (entry.fuentesPorCampo && Object.keys(entry.fuentesPorCampo).length) {
    const ETIQUETAS_CAMPO = {
      taxonomia: 'Nombre y sinonimia',
      estatus: 'Estatus (autóctona / alóctona / invasora)',
      distribucion: 'Presencia y distribución',
      descripcion: 'Descripción',
    };
    Object.keys(ETIQUETAS_CAMPO).forEach(campo => {
      const lista = (entry.fuentesPorCampo[campo] || []).filter(f => f && f.label);
      if (!lista.length) return;
      fuentes.push(`<li><strong>${ETIQUETAS_CAMPO[campo]}:</strong> ${lista.map(enlace).join(' · ')}</li>`);
    });
  } else {
    const fuentesUrls = new Set();
    [...(entry.fuentes || []), ...(entry.fuentesInvasion || [])].forEach(f => {
      if (!f || !f.url || fuentesUrls.has(f.url)) return;
      fuentesUrls.add(f.url);
      fuentes.push(`<li>${enlace(f)}</li>`);
    });
  }
  rellenarLista('ficha-seccion-fuentes', 'ficha-fuentes', fuentes);

  // Botón ficha oficial: solo si tenemos ficha propia con URL oficial (del
  // catálogo nacional). Si la especie NO está en nuestra guía (p.ej. una
  // identificación de Pl@ntNet que aún no tiene ficha propia), no se enlaza
  // a ninguna web externa: toda la experiencia se queda dentro del sitio,
  // mostrando en su lugar el aviso "todavía no está en nuestro catálogo".
  const oficialBtn = document.getElementById('ficha-btn-oficial');
  const avisoNoGuia = document.getElementById('ficha-no-guia-aviso');
  if (entry.fichaNacionalUrl) {
    oficialBtn.href = entry.fichaNacionalUrl;
    oficialBtn.hidden = false;
  } else {
    oficialBtn.hidden = true;
  }
  if (avisoNoGuia) avisoNoGuia.hidden = entry.enGuia !== false;

  // Solo se ofrece generar un registro cuando el estatus resuelto de
  // forma independiente es realmente "invasora" Y, además, la especie
  // está en nuestra guía (entry.enGuia) — nunca solo por estar en el
  // catálogo independiente de invasoras si todavía no tiene ficha propia,
  // ni por estar simplemente en la guía sin ser invasora.
  const reportarBtn = document.getElementById('ficha-btn-reportar');
  if (nivel === 'invasora' && entry.enGuia) {
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
// El asistente de reporte vive en su propia página (reportar.html), así
// que arrancar un reporte desde aquí (o desde identificar.js) es una
// navegación normal, pasando la especie por la URL. reportar.js lee ese
// parámetro al cargar y preselecciona la especie exactamente igual que
// antes se simulaba con un clic.
//
// Clave usada para pasar el resultado de Pl@ntNet a reportar.html sin
// tocar la URL (el resumen de 3 especies no cabe bien en un query param).
// reportar.js la lee una sola vez al cargar y la borra inmediatamente
// (sessionStorage.removeItem), así que nunca sobrevive a un reporte
// enviado ni contamina una visita posterior sin identificación.
export const CLAVE_PLANTNET_SESSION = 'rn_plantnet_resultado';

// `plantnet` es opcional: { scientific, confidence, resultsText }. Solo se
// rellena cuando venimos de una identificación real (ver identificar.js);
// si no se pasa, se borra cualquier resto de una identificación anterior
// para que reportar.html arranque sin datos de Pl@ntNet, tal como debe
// pasar si se entra directo a "Otra especie" o desde la guía botánica.
export function seleccionarEspecieParaReportar(cientifico, plantnet) {
  try {
    if (plantnet) {
      sessionStorage.setItem(CLAVE_PLANTNET_SESSION, JSON.stringify(plantnet));
    } else {
      sessionStorage.removeItem(CLAVE_PLANTNET_SESSION);
    }
  } catch (err) {
    // sessionStorage puede fallar en navegación privada estricta; no debe
    // impedir nunca que el reporte se pueda enviar.
  }
  window.location.href = 'reportar.html?especie=' + encodeURIComponent(cientifico);
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

// Dos grupos de chips independientes: tipo de planta (data-filtro) y
// estatus en Cantabria (data-estatus). Cada grupo solo desactiva a los suyos.
function initFiltros() {
  const chips = document.querySelectorAll('.catalogo-filtro[data-filtro]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      filtroActivo = chip.dataset.filtro;
      visibles = PAGINA;
      renderCatalogo();
    });
  });

  const chipsEstatus = document.querySelectorAll('.catalogo-filtro[data-estatus]');
  chipsEstatus.forEach(chip => {
    chip.addEventListener('click', () => {
      chipsEstatus.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      filtroEstatus = chip.dataset.estatus;
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

// `excepciones`: especies concretas de un género (entrada "Genero spp.")
// que el catálogo excluye expresamente — p. ej. el CEEEI incluye
// "Ludwigia spp. [excepto L. palustris]". Nunca deben resolverse por la
// coincidencia de género.
function estaExcluida(nombreBuscado, entry) {
  const nc = normalizar(nombreBuscado);
  return (entry.excepciones || []).some(x => normalizar(x) === nc);
}

function buscarPorCientifico(cientifico, lista) {
  const match = lista.find(e => coincideNombre(cientifico, e));
  if (match) return match;

  const genero = normalizar(cientifico).split(' ')[0];
  return lista.find(e => {
    const ec = normalizar(e.cientifico);
    return (ec.endsWith(' spp.') || ec.endsWith(' sp.')) && ec.split(' ')[0] === genero && !estaExcluida(cientifico, e);
  }) || null;
}

// Traduce el `estatus` de una ficha de la guía al nivel interno que usan
// la identificación y las etiquetas. 'invasora' NUNCA se toma de aquí: solo
// el catálogo CEEEI (CATALOGO_INVASORAS) puede decidirlo. 'exotica' se
// acepta como alias antiguo de 'aloctona'.
function nivelDesdeEstatusGuia(estatus) {
  if (estatus === 'autoctona') return 'autoctona';
  if (estatus === 'aloctona' || estatus === 'exotica') return 'exotica_no_invasora';
  if (estatus === 'dudosa') return 'dudosa';
  return null;
}

// Única fuente de verdad sobre si una especie es invasora, siempre
// independiente de si tiene o no ficha en la guía botánica (ESPECIES).
// Consulta primero el catálogo independiente de invasoras
// (data/catalogo-invasoras.json, construido exclusivamente a partir del
// CEEEI y de su ámbito de aplicación en Cantabria); si no hay coincidencia
// ahí, nunca se concluye "invasora" solo porque la especie esté en la guía.
function resolverNivelInvasion(cientifico, guia) {
  let refInvasora = buscarPorCientifico(cientifico, CATALOGO_INVASORAS);
  // La ficha puede llamarse distinto al nombre buscado (p. ej. una entrada
  // de género "Carpobrotus spp." cuyos sinónimos son las especies del CEEEI):
  // se prueban también sus propios nombres.
  if (!refInvasora && guia) {
    for (const n of [guia.cientifico, ...(guia.sinonimos || [])]) {
      refInvasora = buscarPorCientifico(n, CATALOGO_INVASORAS);
      if (refInvasora) break;
    }
  }
  if (refInvasora) {
    return { nivel: 'invasora', fuentesInvasion: refInvasora.fuentes || [], ambitoCEEEI: refInvasora.ambito || null };
  }
  const nivelGuia = guia ? nivelDesdeEstatusGuia(guia.estatus) : null;
  if (nivelGuia) return { nivel: nivelGuia, fuentesInvasion: [] };

  const externo = buscarPorCientifico(cientifico, ESTATUS_EXTERNO);
  if (externo) {
    const nivel = nivelDesdeEstatusGuia(externo.estatus) || 'desconocida';
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
  const { nivel, fuentesInvasion, fuenteEstatus, ambitoCEEEI } = resolverNivelInvasion(cientifico, guia);

  if (guia) {
    return { ...guia, nivelInvasion: nivel, fuentesInvasion, ambitoCEEEI: ambitoCEEEI || guia.ambitoCEEEI || null, enGuia: true };
  }

  return {
    cientifico,
    comunes: Array.isArray(comunes) ? comunes.filter(Boolean) : [],
    fotos: fotoDataUrl ? [{ image: fotoDataUrl }] : [],
    estatus: nivel === 'autoctona' ? 'autoctona' : nivel === 'exotica_no_invasora' ? 'aloctona' : null,
    ambitoCEEEI: ambitoCEEEI || null,
    fuentes: fuenteEstatus ? [fuenteEstatus] : [],
    nivelInvasion: nivel,
    fuentesInvasion,
    enGuia: false,
  };
}

// Punto de entrada único desde identificar.js: siempre abre la misma
// ficha botánica, tanto si la especie ya está en la guía como si es la
// primera vez que aparece por una identificación de Pl@ntNet.
export function abrirFichaDesdeIdentificacion({ cientifico, comunes, fotoDataUrl }) {
  abrirFicha(resolverEspecie({ cientifico, comunes, fotoDataUrl }));
}

export { ETIQUETA_NIVEL };

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

  // Guía Botánica: todo el catálogo. El nivel de cada entrada se resuelve
  // con la misma función que usa la identificación (resolverEspecie), así
  // que "invasora" sale siempre del CEEEI y no del campo `estatus` de la
  // ficha.
  ESPECIES_GUIA = ESPECIES
    .map(e => {
      const { nivel, fuentesInvasion, ambitoCEEEI } = resolverNivelInvasion(e.cientifico, e);
      return { ...e, nivelInvasion: nivel, fuentesInvasion, ambitoCEEEI: ambitoCEEEI || e.ambitoCEEEI || null, enGuia: true };
    })
    .sort((a, b) => nombreComunDe(a).localeCompare(nombreComunDe(b), 'es'));

  renderCatalogo();
  abrirFichaDesdeUrlSiCorresponde();
}

// Si se llega con guia-botanica.html?especie=Nombre+cientifico (desde el
// popup del mapa público, o desde reportar.js del mismo modo), abre
// directamente la ficha de esa especie en vez de dejar que el usuario
// tenga que buscarla a mano. Reutiliza el mismo punto de entrada que ya
// usa identificar.js — no se inventa un mecanismo nuevo.
function abrirFichaDesdeUrlSiCorresponde() {
  const params = new URLSearchParams(window.location.search);
  const cientifico = params.get('especie');
  if (!cientifico) return;
  abrirFichaDesdeIdentificacion({ cientifico });
}
