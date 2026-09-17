/**
 * Funciones de prueba para ejecutar manualmente desde el editor de Apps
 * Script (seleccionar la función en el desplegable de arriba → ▶ Ejecutar
 * → ver resultado en "Registro de ejecución" / Ver → Registros).
 *
 * No se llaman solas ni se exponen por HTTP: son solo para verificar el
 * backend antes de conectarlo a la web.
 */

// JPEG de 1x1 píxel válido pero sin contenido real — sirve para probar
// que el circuito completo (Drive, Sheets, manejo de errores) funciona
// sin romperse, pero Pl@ntNet NO podrá identificar una especie real con
// esto: para probar una identificación de verdad hace falta una foto real
// de una planta (ver Parte E de las instrucciones).
var FOTO_PRUEBA_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

/**
 * PRUEBA F/G: comprueba la lógica del catálogo de invasoras (coincidencia
 * exacta, sinónimo, género, y un caso que no debe coincidir) sin tocar
 * Drive ni Sheets. Ejecútala primero — es la más rápida de revisar.
 */
function probarCatalogoInvasoras_() {
  var catalogo = leerCatalogoInvasoras_();
  Logger.log('Especies cargadas del catálogo: ' + catalogo.length);
  if (!catalogo.length) {
    Logger.log('⚠️ El catálogo ha llegado vacío — revisa CATALOGO_INVASORAS_URL en Config.gs y que el sitio esté publicado.');
    return;
  }

  var casos = [
    { nombre: 'Cortaderia selloana', esperado: 'coincide (nombre exacto)' },
    { nombre: 'Reynoutria japonica', esperado: 'coincide (sinónimo de Fallopia japonica)' },
    { nombre: 'Conyza bonariensis', esperado: 'coincide por género (Conyza sp.)' },
    { nombre: 'Quercus robur', esperado: 'NO coincide (roble autóctono)' },
  ];

  casos.forEach(function (caso) {
    var match = buscarEnCatalogoInvasoras_(caso.nombre, catalogo);
    Logger.log(
      caso.nombre + ' → ' + (match ? 'INVASORA (' + match.cientifico + ')' : 'no encontrada')
      + '  [se esperaba: ' + caso.esperado + ']'
    );
  });
}

/**
 * PRUEBA D/E: llama a Pl@ntNet de verdad con la foto de prueba (1x1 px).
 * No esperes una identificación real — solo confirma que la llamada llega,
 * que la clave funciona y que no salta ningún error de autorización/red.
 */
function probarPlantNet_() {
  var resultado = identificarConPlantNet_([{ base64: FOTO_PRUEBA_BASE64, mime: 'image/jpeg' }]);
  Logger.log(JSON.stringify(resultado, null, 2));
}

/**
 * PRUEBA A/B/C completa: simula un doPost real (mismo JSON que mandaría la
 * web) usando la foto de prueba. Guarda una fila real en "Reportes" y una
 * foto real en Drive — bórralas después si no quieres dejar basura de
 * prueba (apunta el ID que se imprima en el registro).
 */
function probarDoPost_() {
  var cuerpo = {
    nombreComun: 'Prueba manual',
    lat: 43.2522,
    lon: -3.4628,
    cantidad: 'Pequeño grupo (menos de 10 m²)',
    lugarDescripcion: 'Prueba desde el editor de Apps Script',
    observaciones: 'Fila de prueba, se puede borrar',
    nombreReportante: 'Nombre de prueba',
    emailReportante: 'prueba@example.com',
    fotos: [{ base64: FOTO_PRUEBA_BASE64, mime: 'image/jpeg' }],
  };

  var eFalso = { postData: { contents: JSON.stringify(cuerpo) } };
  var salida = doPost(eFalso);
  Logger.log(salida.getContent());
}

/** Variante sin foto, para comprobar que también funciona sin fotografía. */
function probarDoPostSinFoto_() {
  var cuerpo = {
    nombreComun: 'Prueba sin foto',
    lat: 43.25,
    lon: -3.46,
    fotos: [],
  };
  var eFalso = { postData: { contents: JSON.stringify(cuerpo) } };
  var salida = doPost(eFalso);
  Logger.log(salida.getContent());
}

/**
 * PRUEBA H/I: comprueba que doGet solo devuelve aprobados y solo campos
 * públicos. Para que salga algo que no sea "[]", primero cambia a mano el
 * Estado de alguna fila de prueba a "🟢 Aprobado" en la hoja.
 */
function probarDoGet_() {
  var salida = doGet();
  var texto = salida.getContent();
  Logger.log(texto);

  var datos = JSON.parse(texto);
  if (Array.isArray(datos)) {
    var camposPrivadosFiltrados = datos.every(function (r) {
      return !('nombreReportante' in r) && !('emailReportante' in r)
        && !('observaciones' in r) && !('lugarDescripcion' in r);
    });
    Logger.log('Reportes aprobados devueltos: ' + datos.length);
    Logger.log(camposPrivadosFiltrados ? '✅ Ningún campo privado en la respuesta.' : '⚠️ Hay campos privados en la respuesta — revisar leerReportesAprobados_().');
  }
}
