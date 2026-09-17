/**
 * Identificación con Pl@ntNet, llamada desde el servidor (Apps Script),
 * NO desde el navegador — a diferencia de js/identificar.js, que llama a
 * Pl@ntNet directamente desde el cliente para la identificación
 * interactiva de identificar.html (eso sigue funcionando igual, no se
 * toca). Esta llamada server-side es la que decide automáticamente el
 * estado de un reporte, así que se hace siempre, exista o no una
 * identificación previa del navegador.
 *
 * Mismo endpoint y misma forma de payload que el cliente (ver
 * js/identificar.js), para mantener resultados coherentes.
 */

var PLANTNET_ENDPOINT = 'https://my-api.plantnet.org/v2/identify/all';

/**
 * @param {Array<{base64:string, mime:string}>} fotos
 * @return {{
 *   mejorCientifico: string|null,
 *   mejorConfianza: number|null,   // 0-100
 *   resultadosTexto: string,       // resumen legible de los 3 primeros, para la columna J
 *   error: string|null
 * }}
 */
function identificarConPlantNet_(fotos) {
  if (!fotos || !fotos.length) {
    return { mejorCientifico: null, mejorConfianza: null, resultadosTexto: '', error: 'Sin fotografías: no se puede identificar.' };
  }

  var url = PLANTNET_ENDPOINT
    + '?api-key=' + encodeURIComponent(clavePlantNet_())
    + '&lang=es&nb-results=3&include-related-images=false';

  var imagenes = [];
  var organos = [];
  for (var i = 0; i < fotos.length; i++) {
    var foto = fotos[i];
    var bytes = Utilities.base64Decode(foto.base64);
    var blob = Utilities.newBlob(bytes, foto.mime || 'image/jpeg', 'foto_' + (i + 1) + '.jpg');
    imagenes.push(blob);
    organos.push('auto');
  }

  // UrlFetchApp serializa un objeto de payload como multipart/form-data
  // automáticamente; un valor array bajo la misma clave genera varias
  // partes con ese mismo nombre (equivalente a los varios
  // formData.append('images', file) del cliente).
  var payload = { images: imagenes, organs: organos };

  try {
    var resp = UrlFetchApp.fetch(url, {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true,
    });

    var codigo = resp.getResponseCode();
    if (codigo === 429) {
      return { mejorCientifico: null, mejorConfianza: null, resultadosTexto: '', error: 'Límite diario de Pl@ntNet alcanzado (HTTP 429).' };
    }
    if (codigo !== 200) {
      var cuerpo = resp.getContentText().slice(0, 300);
      return { mejorCientifico: null, mejorConfianza: null, resultadosTexto: '', error: 'Pl@ntNet respondió HTTP ' + codigo + ': ' + cuerpo };
    }

    var data = JSON.parse(resp.getContentText());
    var resultados = (data.results || []).slice(0, 3).map(function (r) {
      return {
        cientifico: r.species && r.species.scientificNameWithoutAuthor ? r.species.scientificNameWithoutAuthor : null,
        score: typeof r.score === 'number' ? r.score : null,
      };
    }).filter(function (r) { return r.cientifico; });

    if (!resultados.length) {
      return { mejorCientifico: null, mejorConfianza: null, resultadosTexto: 'Pl@ntNet no devolvió ninguna especie.', error: null };
    }

    var mejor = resultados[0];
    var resumen = resultados.map(function (r) {
      var pct = r.score != null ? Math.round(r.score * 100) + '%' : '?%';
      return r.cientifico + ' (' + pct + ')';
    }).join(' · ');

    return {
      mejorCientifico: mejor.cientifico,
      mejorConfianza: mejor.score != null ? Math.round(mejor.score * 100) : null,
      resultadosTexto: resumen,
      error: null,
    };
  } catch (err) {
    return { mejorCientifico: null, mejorConfianza: null, resultadosTexto: '', error: 'Error de red llamando a Pl@ntNet: ' + err };
  }
}
