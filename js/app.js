// Navegación compartida por TODAS las páginas: menú de hamburguesa.
// Cada página es un HTML independiente con enlaces <a href="..."> normales
// (no hay router ni SPA), así que este script ya no necesita saber nada
// del wizard de reporte, del catálogo ni de la identificación: solo abre
// y cierra el panel del menú.

let menuHideTimer = null;

function openMenu() {
  const overlay = document.getElementById('menu-overlay');
  if (!overlay) return;
  clearTimeout(menuHideTimer);
  overlay.hidden = false;
  // Fuerza un reflow para que la transición de apertura se aplique de
  // forma síncrona (evita la carrera de un requestAnimationFrame si el
  // menú se cierra inmediatamente después de abrirse).
  void overlay.offsetWidth;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  const overlay = document.getElementById('menu-overlay');
  if (!overlay || overlay.hidden) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  clearTimeout(menuHideTimer);
  menuHideTimer = setTimeout(() => { overlay.hidden = true; }, 200);
}

function initMenu() {
  const menuBtn = document.getElementById('header-menu');
  const closeBtn = document.getElementById('menu-close');
  const overlay = document.getElementById('menu-overlay');
  if (!menuBtn || !overlay) return;

  menuBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  // Los enlaces del menú son <a href> normales: solo hace falta cerrar
  // el panel antes de que el navegador navegue a la página destino.
  overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

document.addEventListener('DOMContentLoaded', initMenu);
