// Configuración de la identificación de plantas con Pl@ntNet.
//
// Arquitectura (sin backend/intermediario, por decisión expresa del
// proyecto): el navegador llama directamente a la API de Pl@ntNet.
// Esto es posible porque Pl@ntNet ofrece expresamente un modo de uso
// para aplicaciones cliente ("Expose my API key" + "Authorized
// domains"), pensado justo para esto:
// https://my.plantnet.org/doc/getting-started/introduction
//
// Pasos para activarlo (los debe hacer el titular de la cuenta de
// Pl@ntNet, no se puede hacer desde aquí):
//   1. Entra en https://my.plantnet.org/ con tu cuenta y ve a
//      /settings/api-key.
//   2. Genera tu API key privada si aún no tienes una.
//   3. Activa la opción "Expose my API key".
//   4. En "Authorized domains" añade exactamente:
//      reporteinvasoras.ramalesnatural.org
//      (y, si haces pruebas en local, añade también esa otra línea,
//      p. ej. localhost — quítala en producción).
//   5. Pega tu API key aquí abajo. NO subas este archivo con la clave
//      rellena a un repositorio si prefieres no dejarla en el
//      historial de git; en ese caso, mantenla solo en tu copia local
//      y en el despliegue de GitHub Pages.
//
// Mientras PLANTNET_API_KEY esté vacía, la app detecta que la función
// de identificación aún no está configurada y lo indica con un aviso
// en vez de fallar en silencio.
export const PLANTNET_API_KEY = '2b10bHIkxCm2ZSl3SHfH3SSU';
