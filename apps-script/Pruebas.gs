/**
 * Funciones de prueba para ejecutar manualmente desde el editor de Apps
 * Script (elige la función en el desplegable de arriba → ▶ Ejecutar → Ver
 * → Registros de ejecución).
 *
 * La mayoría de estas pruebas llaman a decidirEstadoReporte_() directamente
 * (Endpoints.gs) — es una función pura, sin efectos secundarios, así que
 * NO escriben nada en Sheets ni en Drive. Solo probarDoPostCompleto_() (al
 * final) escribe una fila real de prueba; está marcada bien claro.
 */

/**
 * PRUEBA de catálogo: coincidencia exacta, por sinónimo, por género (débil)
 * y un caso que no debe coincidir en absoluto. No escribe nada.
 */
function probarCatalogoInvasoras_() {
  var catalogo = leerCatalogoInvasoras_();
  Logger.log('Especies cargadas del catálogo: ' + catalogo.length);
  if (!catalogo.length) {
    Logger.log('⚠️ El catálogo ha llegado vacío — revisa CATALOGO_INVASORAS_URL en Config.gs y que el sitio esté publicado.');
    return;
  }

  var casos = [
    { nombre: 'Cortaderia selloana', esperado: 'exacta' },
    { nombre: 'Reynoutria japonica', esperado: 'exacta (sinónimo de Fallopia japonica)' },
    { nombre: 'Conyza bonariensis', esperado: 'genero (Conyza sp.)' },
    { nombre: 'Quercus robur', esperado: 'sin coincidencia' },
  ];

  casos.forEach(function (caso) {
    var resultado = buscarEnCatalogoInvasoras_(caso.nombre, catalogo);
    var descripcion = resultado
      ? resultado.tipo + ' → ' + resultado.entry.cientifico
      : 'sin coincidencia';
    Logger.log(caso.nombre + ' → ' + descripcion + '  [se esperaba: ' + caso.esperado + ']');
  });
}

/**
 * Ejecuta un caso de decidirEstadoReporte_() y lo compara con el estado
 * esperado, dejando un ✅/❌ bien visible en el registro.
 */
function ejecutarCasoEstado_(descripcion, cientifico, confianza, estadoEsperado) {
  var resultado = decidirEstadoReporte_({
    plantnetScientific: cientifico,
    plantnetConfidence: confianza,
  });
  var ok = resultado.estado === estadoEsperado;
  Logger.log(
    (ok ? '✅ ' : '❌ ') + descripcion + ' → ' + resultado.estado
    + '  (motivo: ' + resultado.motivo + ')'
    + (ok ? '' : '  [ESPERADO: ' + estadoEsperado + ']')
  );
}

/**
 * PRUEBAS 2-6 de la Fase 7 — decisión de estado, sin escribir nada en
 * Sheets ni Drive (decidirEstadoReporte_ es una función pura). El umbral
 * se lee de verdad de Config!B1, así que si lo cambias, vuelve a ejecutar
 * esto para confirmar que sigue dando lo esperado.
 */
function probarDecisionesDeEstado_() {
  var umbral = obtenerUmbralConfianza_();
  Logger.log('Umbral actual (Config!B1): ' + umbral + '%');

  // 2. Cortaderia selloana, 90% → Aprobado (coincidencia exacta, ≥ umbral)
  ejecutarCasoEstado_('Cortaderia selloana @ 90%', 'Cortaderia selloana', 90, ESTADO.APROBADO);

  // 3. Quercus robur, 95% → Pendiente (no es invasora, no está en el catálogo)
  ejecutarCasoEstado_('Quercus robur @ 95%', 'Quercus robur', 95, ESTADO.PENDIENTE);

  // 4. Conyza bonariensis, 95% → Pendiente (coincidencia solo por género)
  ejecutarCasoEstado_('Conyza bonariensis @ 95%', 'Conyza bonariensis', 95, ESTADO.PENDIENTE);

  // 5. Cortaderia selloana, 70% → Pendiente (por debajo del umbral, salvo que Config!B1 sea ≤70)
  ejecutarCasoEstado_('Cortaderia selloana @ 70%', 'Cortaderia selloana', 70, ESTADO.PENDIENTE);

  // 6. Sin identificación → Pendiente
  ejecutarCasoEstado_('Sin identificación', '', null, ESTADO.PENDIENTE);

  Logger.log('Si Config!B1 es distinto de 85, revisa el caso @70% y @90% a mano: '
    + 'con un umbral ≤70 el caso 5 también debería salir Aprobado, y es correcto que así sea.');
}

// JPEG de 1x1 píxel válido pero sin contenido real — solo para probar que
// Drive guarda el archivo sin romperse; no representa ninguna especie.
var FOTO_PRUEBA_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

/**
 * PRUEBA A/B/C completa, END-TO-END, vía doPost() real (como llegará desde
 * el navegador). ⚠️ ESTA SÍ ESCRIBE DATOS REALES: una fila nueva en
 * "Reportes" y una fotografía real en Drive. Apunta el ID que salga en el
 * registro (RPT-...) para poder borrar la fila y la foto después si no
 * quieres dejarlas.
 *
 * Usa un caso Cortaderia selloana @ 92% → debería quedar Aprobado.
 */
function probarDoPostCompleto_() {
  var cuerpo = {
    nombreComun: 'Plumero (prueba)',
    nombreCientifico: 'Cortaderia selloana',
    plantnetScientific: 'Cortaderia selloana',
    plantnetConfidence: 92,
    plantnetResults: 'Cortaderia selloana (92%) · Arundo donax (4%) · Phragmites australis (2%)',
    lat: 43.2522,
    lon: -3.4628,
    cantidad: 'Pequeño grupo (menos de 10 m²)',
    lugarDescripcion: 'Prueba desde el editor de Apps Script',
    observaciones: 'Fila de prueba end-to-end, se puede borrar',
    nombreReportante: 'Nombre de prueba',
    emailReportante: 'prueba@example.com',
    fotos: [{ base64: FOTO_PRUEBA_BASE64, mime: 'image/jpeg' }],
  };

  var eFalso = { postData: { contents: JSON.stringify(cuerpo) } };
  var salida = doPost(eFalso);
  Logger.log(salida.getContent());
  Logger.log('⚠️ Esto ha creado una fila real en "Reportes" y una foto real en Drive. Bórralas si no las quieres conservar.');
}

/** Variante sin identificación ni foto — confirma que también funciona (caso 6, pero por el endpoint completo). */
function probarDoPostSinIdentificacion_() {
  var cuerpo = {
    nombreComun: 'Otra / No sé',
    lat: 43.25,
    lon: -3.46,
    fotos: [],
  };
  var eFalso = { postData: { contents: JSON.stringify(cuerpo) } };
  var salida = doPost(eFalso);
  Logger.log(salida.getContent());
  Logger.log('⚠️ Esto también ha creado una fila real en "Reportes" (sin foto, sin fila en Drive). Bórrala si no la quieres conservar.');
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
