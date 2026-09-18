/**
 * Criterio de "especie invasora" — PORTADO tal cual desde js/catalogo.js
 * (normalizar / coincideNombre / buscarPorCientifico), para que Apps
 * Script decida exactamente igual que la web. No es una clasificación
 * nueva: es la misma fuente (data/catalogo-invasoras.json) y la misma
 * lógica de coincidencia (nombre exacto, sinónimos, y como último
 * recurso una entrada de género "Genero spp."/"Genero sp.").
 *
 * Ver js/catalogo.js líneas 115-117 (normalizar) y 546-561
 * (coincideNombre / buscarPorCientifico) para el original.
 */

var CACHE_KEY_CATALOGO = 'catalogo_invasoras_json';
var CACHE_TTL_SEGUNDOS = 6 * 60 * 60; // 6 horas

/**
 * Descarga (con caché) data/catalogo-invasoras.json desde el propio sitio
 * público. Si por lo que sea no se puede leer, devuelve [] — nunca se
 * inventa una lista alternativa; con [] ninguna especie coincidirá y todo
 * quedará en Pendiente (nunca se auto-aprueba a ciegas).
 */
function leerCatalogoInvasoras_() {
  var cache = CacheService.getScriptCache();
  var cacheado = cache.get(CACHE_KEY_CATALOGO);
  if (cacheado) {
    return JSON.parse(cacheado);
  }

  try {
    var resp = UrlFetchApp.fetch(CATALOGO_INVASORAS_URL, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      Logger.log('No se pudo leer catalogo-invasoras.json (HTTP ' + resp.getResponseCode() + ')');
      return [];
    }
    var lista = JSON.parse(resp.getContentText());
    if (!Array.isArray(lista)) return [];

    // El caché de Apps Script tiene un límite de 100KB por valor; el
    // catálogo actual (117 especies) cabe de sobra, pero por seguridad
    // no dejamos que un fallo de caché tumbe la función.
    try {
      cache.put(CACHE_KEY_CATALOGO, JSON.stringify(lista), CACHE_TTL_SEGUNDOS);
    } catch (eCache) {
      Logger.log('Aviso: no se pudo cachear el catálogo (' + eCache + '), se continúa sin caché.');
    }

    return lista;
  } catch (err) {
    Logger.log('Error al leer catalogo-invasoras.json: ' + err);
    return [];
  }
}

/** Mismo criterio de normalización que normalizar() en catalogo.js. */
function normalizarTexto_(txt) {
  return (txt || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function coincideNombreInvasora_(nombreBuscado, entry) {
  var nc = normalizarTexto_(nombreBuscado);
  if (normalizarTexto_(entry.cientifico) === nc) return true;
  var sinonimos = entry.sinonimos || [];
  for (var i = 0; i < sinonimos.length; i++) {
    if (normalizarTexto_(sinonimos[i]) === nc) return true;
  }
  return false;
}

/**
 * Busca un nombre científico en el catálogo de invasoras: coincidencia
 * exacta, por sinónimo, o —como último recurso— por género si el
 * catálogo tiene una entrada "Genero spp." / "Genero sp.".
 *
 * Devuelve { entry, tipo } donde tipo es 'exacta' (nombre exacto o
 * sinónimo — misma fiabilidad que usa catalogo.js para "invasora") o
 * 'genero' (coincidencia débil, solo por género), o null si la especie no
 * está reconocida como invasora en absoluto.
 *
 * El "tipo" es lo que permite que Endpoints.gs nunca auto-apruebe una
 * coincidencia solo por género (p.ej. Pl@ntNet dice "Conyza bonariensis" y
 * el catálogo solo tiene "Conyza sp."): es informativo para el humano que
 * revisa Sheets, pero no es una identificación firme.
 */
function buscarEnCatalogoInvasoras_(cientifico, catalogo) {
  if (!cientifico) return null;

  for (var i = 0; i < catalogo.length; i++) {
    if (coincideNombreInvasora_(cientifico, catalogo[i])) {
      return { entry: catalogo[i], tipo: 'exacta' };
    }
  }

  // Apps Script usa el runtime V8 (ES6+), igual que catalogo.js: se porta
  // literalmente la misma condición (ec.endsWith(' spp.') || ec.endsWith(' sp.')).
  var genero = normalizarTexto_(cientifico).split(' ')[0];
  for (var j = 0; j < catalogo.length; j++) {
    var ec = normalizarTexto_(catalogo[j].cientifico);
    if ((ec.endsWith(' spp.') || ec.endsWith(' sp.')) && ec.split(' ')[0] === genero) {
      return { entry: catalogo[j], tipo: 'genero' };
    }
  }

  return null;
}
