# Reporte de especies invasoras — Ramales Natural

Aplicación web estática (HTML/CSS/JS, sin build ni backend propio) para que
cualquier persona pueda comunicar la presencia de flora invasora en Ramales
de la Victoria.

- Alojamiento: **GitHub Pages**, dominio propio `reporteinvasoras.ramalesnatural.org`
  configurado mediante el archivo `CNAME` de este repositorio.
- Envío de reportes: **FormSubmit** (ver más abajo). No se usa Netlify ni
  ningún backend propio.

## Envío de reportes por email

GitHub Pages solo sirve archivos estáticos: no puede procesar el
formulario ni enviar correos por sí mismo. Por eso el envío se hace a
través de **[FormSubmit](https://formsubmit.co)**, un servicio externo
gratuito que reenvía el contenido de un formulario por email sin necesidad
de backend propio.

El endpoint está configurado en [`js/config.js`](js/config.js):

```js
submitUrl: 'https://formsubmit.co/ajax/invasorasenramales@gmail.com'
```

Esto **no es una clave secreta**: es simplemente la dirección de destino,
igual que ya era pública en el formulario de Netlify anterior.

### ⚠️ Paso manual obligatorio (una sola vez)

FormSubmit exige activar cada dirección de email la primera vez que
recibe un envío:

1. Despliega estos cambios y haz un envío de prueba real desde la
   aplicación (rellena el asistente completo y pulsa "Enviar reporte").
2. FormSubmit enviará un correo a **invasorasenramales@gmail.com** con el
   asunto "Please Activate FormSubmit" (o similar) pidiendo confirmar la
   dirección.
3. Abre ese correo desde `invasorasenramales@gmail.com` y pulsa el enlace
   de activación / "Activate Form".
4. Ese primer envío de prueba puede no llegar (se pierde mientras se
   activa). A partir de aquí, todos los envíos siguientes sí llegarán con
   normalidad.

No hace falta crear ninguna cuenta en FormSubmit ni generar ninguna clave.

### Recomendación opcional de privacidad

FormSubmit permite sustituir el email público del código por un
"alias" (una cadena aleatoria) para que la dirección de Gmail no quede
expuesta en el JavaScript público del repositorio. Ese alias se recibe
por email tras la primera activación. Si quieres activarlo:

1. Sigue el proceso de activación anterior.
2. En el correo de confirmación de FormSubmit busca la opción de "email
   invisible" / alias.
3. Sustituye en `js/config.js` la parte `invasorasenramales@gmail.com` de
   `submitUrl` por ese alias (manteniendo el prefijo
   `https://formsubmit.co/ajax/`).

Esto es opcional: la aplicación funciona igualmente con el email
directamente en el código.

### Si las fotografías no llegaran adjuntas

El envío usa `fetch()` con `FormData` (multipart), que es la forma
estándar de mandar archivos por AJAX y el mismo mecanismo que ya usaba el
formulario de Netlify anterior. Si tras la prueba real las fotos no
llegasen adjuntas al correo (algo que no se puede comprobar sin enviar un
email real), la alternativa es cambiar a un envío de formulario clásico
(sin JavaScript, con `enctype="multipart/form-data"` y redirección a una
pantalla de gracias mediante el campo `_next`), que FormSubmit sí
documenta explícitamente para archivos. Avísame si ocurre esto.

### Límites del plan gratuito de FormSubmit

- Envíos ilimitados, sin coste.
- Archivos adjuntos: hasta 10 MB en total por envío (las fotos se
  comprimen en el navegador antes de enviarse, ver `js/fotos.js`).
- Sin necesidad de registro ni panel de control para el uso básico.

## Estructura del proyecto

```
index.html              Asistente de reporte (pantallas del wizard)
css/style.css           Estilos
js/
  config.js             Configuración (especies, tamaños, endpoint de envío)
  wizard.js             Motor de navegación entre pantallas
  especies.js           Paso de selección de especie
  fotos.js              Captura/compresión/miniaturas de fotos
  mapa.js               Paso de ubicación (Leaflet + GPS)
  formulario.js         Cantidad, revisión y envío del reporte
  app.js                Arranque y cableado de eventos
images/                 Fotos de especies y logos
mapa.html, js/mapa-publico.js, data/
                        Mapa público de avistamientos: preparado pero NO
                        enlazado desde la app todavía (sin datos reales).
aviso-legal.html, privacidad.html, cookies.html, accesibilidad.html
                        Páginas legales
```

## Desarrollo local

No hay build ni dependencias que instalar. Para probarlo en local necesitas
servir los archivos con cualquier servidor estático (no puede abrirse con
`file://` porque los módulos JS y el `fetch` del mapa público requieren
HTTP). Por ejemplo, con Node instalado:

```bash
npx serve .
```
