/**
 * Puntos de entrada HTTP. TODAVÍA NO conectados a reportar.html ni a
 * mapa-publico.js — se prueban de forma independiente (ver Pruebas.gs y
 * las instrucciones de despliegue) antes de tocar nada de la web.
 *
 * doPost(e): recibe un reporte nuevo → { ok, id, estado, cientifico, confianza }
 * doGet(e):  devuelve solo los reportes Aprobados, solo campos públicos.
 *
 * Formato esperado por doPost (JSON, no multipart — más fiable en Apps
 * Script para adjuntar fotos):
 * {
 *   "nombreComun": "Plumero",            // opcional, texto libre del usuario
 *   "lat": 43.2522, "lon": -3.4628,      // obligatorios
 *   "cantidad": "Colonia mediana (10-100 m²)",
 *   "lugarDescripcion": "Junto al río",
 *   "observaciones": "...",
 *   "nombreReportante": "", "emailReportante": "",
 *   "fotos": [ { "base64": "...", "mime": "image/jpeg" } ]  // 0 a 3
 * }
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respuestaJson_({ ok: false, error: 'Petición sin cuerpo JSON.' });
    }

    var body = JSON.parse(e.postData.contents);
    if (typeof body.lat !== 'number' || typeof body.lon !== 'number') {
      return respuestaJson_({ ok: false, error: 'Faltan lat/lon numéricos.' });
    }

    var id = generarIdReporte_();
    var tz = Session.getScriptTimeZone();
    var fechaTexto = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

    var fotos = Array.isArray(body.fotos) ? body.fotos.slice(0, 3) : [];
    var fotosGuardadas = guardarFotosEnDrive_(fotos, id, fechaTexto);

    // Pl@ntNet SIEMPRE se llama server-side, aunque el usuario ya haya
    // identificado la planta antes en identificar.html (esa identificación
    // del navegador no llega hasta aquí, y no nos fiamos de un valor que
    // pudiera venir manipulado desde el cliente).
    var identificacion = identificarConPlantNet_(fotos);

    var catalogo = leerCatalogoInvasoras_();
    var coincidencia = identificacion.mejorCientifico
      ? buscarEnCatalogoInvasoras_(identificacion.mejorCientifico, catalogo)
      : null;

    var umbral = obtenerUmbralConfianza_();
    var confianza = identificacion.mejorConfianza; // 0-100 o null

    var estado = ESTADO.PENDIENTE;
    if (coincidencia && confianza != null && confianza >= umbral) {
      estado = ESTADO.APROBADO;
    }
    // Nunca se asigna RECHAZADO automáticamente (regla explícita).

    var resultadoPlantNetTexto = identificacion.resultadosTexto
      || (identificacion.error ? 'Error Pl@ntNet: ' + identificacion.error : '');

    crearFilaReporte_({
      id: id,
      estado: estado,
      fecha: fechaTexto,
      nombreComun: body.nombreComun || '',
      cientifico: identificacion.mejorCientifico || '',
      confianza: confianza,
      lat: body.lat,
      lon: body.lon,
      fotos: fotosGuardadas,
      resultadoPlantNet: resultadoPlantNetTexto,
      cantidad: body.cantidad || '',
      lugarDescripcion: body.lugarDescripcion || '',
      observaciones: body.observaciones || '',
      nombreReportante: body.nombreReportante || '',
      emailReportante: body.emailReportante || '',
    });

    return respuestaJson_({
      ok: true,
      id: id,
      estado: estado,
      cientifico: identificacion.mejorCientifico,
      confianza: confianza,
      plantNetError: identificacion.error, // null si todo fue bien; útil para depurar en pruebas
    });
  } catch (err) {
    Logger.log('Error en doPost: ' + err);
    return respuestaJson_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  try {
    var aprobados = leerReportesAprobados_();
    return respuestaJson_(aprobados);
  } catch (err) {
    Logger.log('Error en doGet: ' + err);
    return respuestaJson_({ ok: false, error: String(err) });
  }
}

function respuestaJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
