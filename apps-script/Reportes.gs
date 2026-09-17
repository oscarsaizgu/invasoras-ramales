/**
 * Guardado en Drive + Sheets, y lectura de aprobados para el mapa.
 */

/** ID único y legible: RPT-AAAAMMDD-HHmmss-nnn */
function generarIdReporte_() {
  var ahora = new Date();
  var tz = Session.getScriptTimeZone();
  var sello = Utilities.formatDate(ahora, tz, 'yyyyMMdd-HHmmss');
  var azar = Math.floor(100 + Math.random() * 900);
  return 'RPT-' + sello + '-' + azar;
}

/**
 * Guarda las fotos recibidas (base64) en la carpeta DRIVE_FOLDER_ID, sin
 * crear subcarpetas. Nombre: reporte-<ID>-<fecha>-<n>.jpg. Cada archivo se
 * comparte como "cualquiera con el enlace puede ver" (necesario para que
 * el mapa público, cuando el reporte esté aprobado, pueda mostrarla) —
 * nunca se comparte la carpeta entera ni el resto de reportes.
 *
 * @return {Array<{id:string, url:string}>} una entrada por foto guardada
 */
function guardarFotosEnDrive_(fotos, idReporte, fechaTexto) {
  if (!fotos || !fotos.length) return [];

  var carpeta = DriveApp.getFolderById(idCarpetaDrive_());
  var guardadas = [];

  for (var i = 0; i < fotos.length; i++) {
    var foto = fotos[i];
    var bytes = Utilities.base64Decode(foto.base64);
    var nombre = 'reporte-' + idReporte + '-' + fechaTexto + '-' + (i + 1) + '.jpg';
    var blob = Utilities.newBlob(bytes, foto.mime || 'image/jpeg', nombre);

    var archivo = carpeta.createFile(blob);
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = archivo.getId();
    // URL de contenido directo: es la que funciona embebida como <img src>
    // en el mapa (la URL normal de "ver" de Drive no sirve para eso).
    var urlDirecta = 'https://drive.google.com/uc?export=view&id=' + fileId;
    guardadas.push({ id: fileId, url: urlDirecta });
  }

  return guardadas;
}

/**
 * Añade una fila nueva en la pestaña Reportes, respetando exactamente las
 * columnas A-O ya creadas. La foto principal se guarda como =IMAGE(url)
 * para verse directamente en la hoja; si hay más de una foto, las
 * adicionales se añaden como nota en la misma celda (no interfieren con
 * la fórmula IMAGE de la primera).
 */
function crearFilaReporte_(datos) {
  var hoja = hojaReportes_();
  var fila = hoja.getLastRow() + 1;

  hoja.getRange(fila, COL.ID).setValue(datos.id);
  hoja.getRange(fila, COL.ESTADO).setValue(datos.estado);
  hoja.getRange(fila, COL.FECHA).setValue(datos.fecha);
  hoja.getRange(fila, COL.NOMBRE_COMUN).setValue(datos.nombreComun || '');
  hoja.getRange(fila, COL.CIENTIFICO).setValue(datos.cientifico || '');
  hoja.getRange(fila, COL.CONFIANZA).setValue(datos.confianza != null ? datos.confianza : '');
  hoja.getRange(fila, COL.LATITUD).setValue(datos.lat != null ? datos.lat : '');
  hoja.getRange(fila, COL.LONGITUD).setValue(datos.lon != null ? datos.lon : '');

  var celdaFoto = hoja.getRange(fila, COL.FOTO);
  if (datos.fotos && datos.fotos.length) {
    celdaFoto.setFormula('=IMAGE("' + datos.fotos[0].url + '")');
    if (datos.fotos.length > 1) {
      var extra = datos.fotos.slice(1).map(function (f) { return f.url; }).join('\n');
      celdaFoto.setNote('Fotos adicionales:\n' + extra);
    }
  } else {
    celdaFoto.setValue('Sin fotografía');
  }

  hoja.getRange(fila, COL.RESULTADO_PLANTNET).setValue(datos.resultadoPlantNet || '');
  hoja.getRange(fila, COL.CANTIDAD).setValue(datos.cantidad || '');
  hoja.getRange(fila, COL.LUGAR).setValue(datos.lugarDescripcion || '');
  hoja.getRange(fila, COL.OBSERVACIONES).setValue(datos.observaciones || '');
  hoja.getRange(fila, COL.NOMBRE_REPORTANTE).setValue(datos.nombreReportante || '');
  hoja.getRange(fila, COL.EMAIL_REPORTANTE).setValue(datos.emailReportante || '');

  return fila;
}

/**
 * Lee la pestaña Reportes y devuelve SOLO los aprobados, y SOLO los campos
 * públicos — esto es lo único que doGet() expone. Los datos privados
 * (columnas M, N, O) nunca se leen aquí siquiera, no solo "no se envían".
 */
function leerReportesAprobados_() {
  var hoja = hojaReportes_();
  var ultimaFila = hoja.getLastRow();
  if (ultimaFila < 2) return [];

  // Solo leemos las columnas públicas (A-I), nunca J-O.
  var rango = hoja.getRange(2, COL.ID, ultimaFila - 1, COL.FOTO - COL.ID + 1);
  var valores = rango.getValues();

  var aprobados = [];
  for (var i = 0; i < valores.length; i++) {
    var fila = valores[i];
    var estado = fila[COL.ESTADO - COL.ID];
    if (estado !== ESTADO.APROBADO) continue;

    aprobados.push({
      id: fila[COL.ID - COL.ID],
      nombreComun: fila[COL.NOMBRE_COMUN - COL.ID],
      cientifico: fila[COL.CIENTIFICO - COL.ID],
      lat: fila[COL.LATITUD - COL.ID],
      lon: fila[COL.LONGITUD - COL.ID],
      foto: extraerUrlDeFoto_(rango.getCell(i + 1, COL.FOTO - COL.ID + 1)),
    });
  }
  return aprobados;
}

/** La celda Foto guarda =IMAGE("url"); esto extrae la URL en texto plano. */
function extraerUrlDeFoto_(celda) {
  var formula = celda.getFormula();
  if (formula) {
    var m = formula.match(/=IMAGE\("([^"]+)"/);
    if (m) return m[1];
  }
  var valor = celda.getValue();
  return typeof valor === 'string' ? valor : '';
}
