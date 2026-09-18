/**
 * Puntos de entrada HTTP. TODAVÍA NO desplegados como Web App público, y
 * TODAVÍA NO conectados de verdad a la web en producción — CONFIG.reportesApiUrl
 * está vacío en js/config.js a propósito. Se prueban primero desde el
 * propio editor (ver Pruebas.gs).
 *
 * doPost(e): recibe un reporte nuevo → { ok, id, estado, cientifico, confianza }
 * doGet(e):  devuelve solo los reportes Aprobados, solo campos públicos.
 *
 * ── Cambio de arquitectura (ver PlantNet.gs) ──
 * Apps Script YA NO llama a Pl@ntNet (bloqueaba con HTTP 403 por IP). La
 * identificación se hace en el navegador, exactamente igual que hasta
 * ahora en identificar.html, y el resultado (especie + confianza + resumen
 * de los 3 primeros) viaja DENTRO del propio reporte:
 *
 * {
 *   "nombreComun": "Plumero",                 // texto libre del usuario, opcional
 *   "nombreCientifico": "Cortaderia selloana", // especie elegida en el wizard, opcional
 *   "plantnetScientific": "Cortaderia selloana", // lo que identificó Pl@ntNet, o "" si no se usó
 *   "plantnetConfidence": 92,                  // 0-100, o null/ausente si no hay identificación
 *   "plantnetResults": "Cortaderia selloana (92%) · Arundo donax (5%) · ...",
 *   "lat": 43.2522, "lon": -3.4628,            // obligatorios
 *   "cantidad": "Colonia mediana (10-100 m²)",
 *   "lugarDescripcion": "Junto al río",
 *   "observaciones": "...",
 *   "nombreReportante": "", "emailReportante": "",
 *   "fotos": [ { "base64": "...", "mime": "image/jpeg" } ]  // 0 a 3
 * }
 *
 * ── Limitación de seguridad, documentada explícitamente (no se oculta) ──
 * plantnetScientific/plantnetConfidence/plantnetResults los declara el
 * NAVEGADOR, no un servidor de confianza: quien quisiera manipular la
 * petición (con las herramientas de desarrollador, o llamando al endpoint
 * directamente) podría mandar cualquier valor y forzar un "Aprobado". No se
 * ha añadido ninguna verificación server-side de que ese resultado sea el
 * que Pl@ntNet dio de verdad — hacerlo requeriría que Apps Script volviera
 * a llamar a Pl@ntNet (lo cual no funciona, ver PlantNet.gs) o un backend
 * intermedio (fuera del alcance que se ha pedido para este proyecto).
 * El daño que esto permite está acotado: como mucho, una fila queda
 * "Aprobado" en una hoja de gestión privada que cualquiera puede revisar y
 * corregir a mano en cualquier momento; nunca expone datos de nadie.
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

    var decision = decidirEstadoReporte_({
      plantnetScientific: body.plantnetScientific,
      plantnetConfidence: body.plantnetConfidence,
    });

    // El nombre científico "oficial" que se guarda es el de Pl@ntNet si lo
    // hay; si no, el que el usuario eligió a mano en el wizard (puede no
    // coincidir con ninguna especie del catálogo, y no pasa nada: se
    // guarda igual, simplemente no auto-aprueba).
    var cientifico = body.plantnetScientific || body.nombreCientifico || '';

    crearFilaReporte_({
      id: id,
      estado: decision.estado,
      fecha: fechaTexto,
      nombreComun: body.nombreComun || '',
      cientifico: cientifico,
      confianza: (typeof body.plantnetConfidence === 'number') ? body.plantnetConfidence : '',
      lat: body.lat,
      lon: body.lon,
      fotos: fotosGuardadas,
      resultadoPlantNet: body.plantnetResults || '',
      cantidad: body.cantidad || '',
      lugarDescripcion: body.lugarDescripcion || '',
      observaciones: body.observaciones || '',
      nombreReportante: body.nombreReportante || '',
      emailReportante: body.emailReportante || '',
    });

    return respuestaJson_({
      ok: true,
      id: id,
      estado: decision.estado,
      motivo: decision.motivo, // solo para depurar en pruebas, no es un dato público
      cientifico: cientifico,
      confianza: body.plantnetConfidence != null ? body.plantnetConfidence : null,
    });
  } catch (err) {
    Logger.log('Error en doPost: ' + err);
    return respuestaJson_({ ok: false, error: String(err) });
  }
}

/**
 * Regla de estado (Fase 5) — pura, sin efectos secundarios, para poder
 * probarla directamente desde Pruebas.gs sin escribir en Sheets/Drive:
 *
 *   🟢 Aprobado: coincidencia EXACTA o por SINÓNIMO con el catálogo de
 *                invasoras (nunca solo por género) Y confianza >= Config!B1.
 *   🟡 Pendiente: cualquier otro caso (sin identificación, confianza baja,
 *                 coincidencia solo por género, especie no reconocida,
 *                 datos incompletos).
 *   🔴 Rechazado: nunca se asigna aquí — siempre es una acción manual en Sheets.
 */
function decidirEstadoReporte_(datos) {
  var cientifico = datos.plantnetScientific;
  var confianza = typeof datos.plantnetConfidence === 'number' ? datos.plantnetConfidence : null;

  if (!cientifico) {
    return { estado: ESTADO.PENDIENTE, motivo: 'Sin identificación de Pl@ntNet.' };
  }
  if (confianza == null) {
    return { estado: ESTADO.PENDIENTE, motivo: 'Sin porcentaje de confianza.' };
  }

  var catalogo = leerCatalogoInvasoras_();
  var coincidencia = buscarEnCatalogoInvasoras_(cientifico, catalogo);

  if (!coincidencia) {
    return { estado: ESTADO.PENDIENTE, motivo: 'Especie no encontrada en el catálogo de invasoras.' };
  }
  if (coincidencia.tipo === 'genero') {
    return { estado: ESTADO.PENDIENTE, motivo: 'Coincidencia solo por género (' + coincidencia.entry.cientifico + '), no autoaprueba.' };
  }

  var umbral = obtenerUmbralConfianza_();
  if (confianza < umbral) {
    return { estado: ESTADO.PENDIENTE, motivo: 'Confianza ' + confianza + '% por debajo del umbral (' + umbral + '%).' };
  }

  return { estado: ESTADO.APROBADO, motivo: 'Coincidencia exacta/sinónimo (' + coincidencia.entry.cientifico + ') con confianza ' + confianza + '% >= ' + umbral + '%.' };
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
