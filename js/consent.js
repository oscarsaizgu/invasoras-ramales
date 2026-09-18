// Consentimiento de cookies/analítica + carga diferida de Google
// Analytics 4. Un único módulo importado por app.js (que ya se carga en
// las 12 páginas), así el aviso y la carga condicional de GA llegan a
// toda la web sin duplicar banner ni script por página.
//
// Analytics NUNCA se carga hasta que el usuario pulsa "Aceptar": antes
// de eso no se inyecta ni gtag.js ni ninguna petición a Google.

const CLAVE_CONSENTIMIENTO = 'rn_consent_analytics';
const GA_MEASUREMENT_ID = 'G-N73R7QHEE2';

function leerConsentimiento() {
  try {
    return localStorage.getItem(CLAVE_CONSENTIMIENTO);
  } catch (err) {
    return null; // localStorage no disponible: se trata como "sin decidir"
  }
}

function guardarConsentimiento(valor) {
  try {
    localStorage.setItem(CLAVE_CONSENTIMIENTO, valor);
  } catch (err) {
    // No se puede persistir: el aviso volverá a aparecer en la próxima
    // visita, pero no rompe el funcionamiento de la página.
  }
}

function cargarGoogleAnalytics() {
  if (window.__gaCargado) return;
  window.__gaCargado = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // anonymize_ip + sin señales de Google/personalización de anuncios:
  // solo medición de uso, nada de perfilado publicitario.
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

// Envío de eventos propios de la app (identificar_uso, reporte_inicio,
// reporte_completado...). Si Analytics no está cargado (sin consentimiento
// todavía, o rechazado) esto no hace nada — nunca se guardan eventos en
// espera de un consentimiento posterior.
export function trackEvent(nombre, parametros) {
  if (!window.__gaCargado || typeof window.gtag !== 'function') return;
  window.gtag('event', nombre, parametros || {});
}

function ocultarBanner(banner) {
  banner.classList.remove('is-visible');
  setTimeout(() => banner.remove(), 200);
}

function crearBanner() {
  if (document.getElementById('cookie-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Aviso de cookies');
  banner.innerHTML = `
    <p class="cookie-banner__texto">
      Usamos cookies propias necesarias para el funcionamiento de la web y,
      si nos das tu permiso, cookies analíticas (Google Analytics) para saber
      cómo se usa la aplicación. Puedes cambiar tu decisión cuando quieras en
      <a href="cookies.html">la política de cookies</a>.
    </p>
    <div class="cookie-banner__botones">
      <button type="button" class="btn btn-secondary cookie-banner__rechazar">Rechazar</button>
      <button type="button" class="btn btn-primary cookie-banner__aceptar">Aceptar</button>
    </div>`;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('is-visible'));

  banner.querySelector('.cookie-banner__aceptar').addEventListener('click', () => {
    guardarConsentimiento('granted');
    cargarGoogleAnalytics();
    ocultarBanner(banner);
  });
  banner.querySelector('.cookie-banner__rechazar').addEventListener('click', () => {
    guardarConsentimiento('denied');
    ocultarBanner(banner);
  });
}

export function initConsentimiento() {
  const valor = leerConsentimiento();
  if (valor === 'granted') {
    cargarGoogleAnalytics();
    return;
  }
  if (valor === 'denied') return;
  crearBanner();
}

// Usado desde cookies.html ("Cambiar mi elección de cookies") para volver
// a mostrar el aviso, por ejemplo si alguien quiere retirar su consentimiento.
export function reabrirPreferencias() {
  crearBanner();
}
