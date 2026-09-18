/**
 * Configuración común del backend de reportes de Ramales Natural.
 *
 * Nada de esto se conecta todavía a reportar.html / formulario.js /
 * mapa-publico.js — este proyecto de Apps Script se prueba de forma
 * independiente primero.
 *
 * Claves secretas: SIEMPRE via PropertiesService (Propiedades del script),
 * nunca escritas en este código. Deben existir ya (las creaste tú):
 *   - DRIVE_FOLDER_ID   → carpeta "Fotos reportes" en Drive
 *   - PLANTNET_API_KEY  → misma clave (o una específica) de Pl@ntNet
 */

var HOJA_REPORTES = 'Reportes';
var HOJA_CONFIG = 'Config';

// Columnas de la pestaña "Reportes", en el orden exacto ya creado.
var COL = {
  ID: 1,
  ESTADO: 2,
  FECHA: 3,
  NOMBRE_COMUN: 4,
  CIENTIFICO: 5,
  CONFIANZA: 6,
  LATITUD: 7,
  LONGITUD: 8,
  FOTO: 9,
  RESULTADO_PLANTNET: 10,
  CANTIDAD: 11,
  LUGAR: 12,
  OBSERVACIONES: 13,
  NOMBRE_REPORTANTE: 14,
  EMAIL_REPORTANTE: 15,
};

var ESTADO = {
  PENDIENTE: '🟡 Pendiente',
  APROBADO: '🟢 Aprobado',
  RECHAZADO: '🔴 Rechazado',
};

// URL pública del sitio (GitHub Pages) de donde se lee el catálogo de
// invasoras — así el script usa siempre la MISMA fuente que la web, sin
// mantener una copia duplicada que se pueda desincronizar.
var CATALOGO_INVASORAS_URL = 'https://flora.ramalesnatural.org/data/catalogo-invasoras.json';

function hojaReportes_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_REPORTES);
}

function hojaConfig_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_CONFIG);
}

/** Umbral de confianza (0-100) leído de Config!B1. Nunca hardcodeado. */
function obtenerUmbralConfianza_() {
  var valor = hojaConfig_().getRange('B1').getValue();
  var n = Number(valor);
  if (isNaN(n)) {
    throw new Error('Config!B1 no contiene un número válido (umbral de confianza).');
  }
  return n;
}

function obtenerPropiedad_(nombre) {
  var valor = PropertiesService.getScriptProperties().getProperty(nombre);
  if (!valor) {
    throw new Error('Falta la propiedad de script "' + nombre + '". Ve a Configuración del proyecto → Propiedades del script.');
  }
  return valor;
}

function idCarpetaDrive_() {
  return obtenerPropiedad_('DRIVE_FOLDER_ID');
}

function clavePlantNet_() {
  return obtenerPropiedad_('PLANTNET_API_KEY');
}
