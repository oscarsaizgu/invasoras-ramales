/**
 * ⚠️ OBSOLETO — este módulo YA NO llama a Pl@ntNet.
 *
 * Motivo: Pl@ntNet devuelve HTTP 403 "remote IP not allowed" cuando la
 * petición llega desde los servidores de Google Apps Script (la clave
 * está configurada para "Authorized domains" de navegador, no para IPs de
 * servidor, y añadir las IPs de Apps Script no es viable: son compartidas
 * y cambiantes). Sin introducir otro backend/proxy —decisión expresa del
 * proyecto—, la única llamada a Pl@ntNet que puede funcionar es la que ya
 * hace el navegador en identificar.html.
 *
 * Arquitectura actual (ver Endpoints.gs):
 *   navegador → Pl@ntNet (igual que siempre, sin cambios)
 *             → el navegador manda el resultado (especie + confianza +
 *               resumen) junto con el resto del reporte
 *             → Apps Script NO vuelve a identificar, solo comprueba ese
 *               resultado contra el catálogo de invasoras y aplica el
 *               umbral de Config!B1.
 *
 * Esto implica una limitación de seguridad real, documentada explícitamente
 * en Endpoints.gs: el resultado de Pl@ntNet que llega aquí viene del
 * cliente, así que en teoría alguien podría manipularlo antes de enviarlo.
 * No se ha añadido ninguna verificación criptográfica para esto (añadiría
 * la complejidad de backend que el proyecto quiere evitar); se acepta como
 * limitación conocida porque el daño posible es acotado (como mucho, un
 * reporte falso quedaría "Aprobado" en una hoja de gestión privada — nunca
 * expone datos de nadie, y sigue siendo revisable/revertible a mano en
 * Sheets en cualquier momento).
 *
 * Se conserva este archivo (en vez de borrarlo) por si en el futuro se
 * decide reintroducir una llamada server-side con otra estrategia (por
 * ejemplo, si Pl@ntNet ofrece algún día autenticación por servidor sin
 * restricción de IP). No lo usa ninguna otra función del proyecto.
 */

function plantNetLlamadaServerSideDeshabilitada_() {
  throw new Error(
    'PlantNet.gs está deshabilitado: Pl@ntNet bloquea las IPs de Apps Script (HTTP 403). ' +
    'La identificación se hace en el navegador (identificar.html) y viaja con el reporte; ' +
    'ver Endpoints.gs.'
  );
}
