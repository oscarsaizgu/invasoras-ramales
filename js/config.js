// Configuración general de la aplicación.
export const CONFIG = {
  mapaCenter: [43.2522, -3.4628],
  mapaZoom: 15,
  // Servicio de formulario-a-email usado por GitHub Pages (sitio estático,
  // sin backend propio). No es una clave secreta: es el mismo email
  // público de destino que antes se usaba con Netlify Forms.
  // Ver README.md → "Envío de reportes por email" para el paso de
  // activación necesario la primera vez.
  submitUrl: 'https://formsubmit.co/ajax/invasorasenramales@gmail.com',
  emailAsunto: '🌿 Nuevo reporte de especie invasora',
  maxFotos: 3,
  // Lado máximo (px) al que se redimensionan las fotos antes de enviarlas.
  fotoMaxLado: 1600,
  fotoCalidad: 0.8,
};

// Especies mostradas en el paso de selección.
// nombre: nombre común · cientifico: nombre científico (also stored value)
// imagen: ruta de la foto · icono: emoji si no hay foto
export const ESPECIES = [
  { id: 'plumero', nombre: 'Plumero', cientifico: 'Cortaderia selloana', imagen: 'images/plumero.jpg', icono: '🌾' },
  { id: 'bambu', nombre: 'Bambú japonés', cientifico: 'Fallopia japonica', imagen: 'images/bambu.jpg', icono: '🎋' },
  { id: 'amor', nombre: 'Amor de hombre', cientifico: 'Tradescantia fluminensis', imagen: 'images/amor.jpg', icono: '🌿' },
  { id: 'vara', nombre: 'Vara de San José', cientifico: 'Crocosmia x crocosmiiflora', imagen: 'images/vara.jpeg', icono: '🌼' },
  { id: 'otra', nombre: 'Otra / No sé', cientifico: 'Otras', imagen: '', icono: '❓', esOtra: true },
];

// Opciones visuales para el tamaño/cantidad de la colonia.
export const TAMANYOS = [
  { id: 'aislada', icono: '🌱', titulo: 'Pocas plantas', sub: '1–3 ejemplares', valor: 'Planta aislada (1-3 ejemplares)' },
  { id: 'grupo', icono: '🌿', titulo: 'Pequeño grupo', sub: 'menos de 10 m²', valor: 'Pequeño grupo (menos de 10 m²)' },
  { id: 'colonia', icono: '🌾', titulo: 'Colonia', sub: '10–100 m²', valor: 'Colonia mediana (10-100 m²)' },
  { id: 'colonia-grande', icono: '🌳', titulo: 'Colonia grande', sub: 'más de 100 m²', valor: 'Colonia grande (más de 100 m²)' },
  { id: 'no-se', icono: '❓', titulo: 'No lo sé', sub: '', valor: 'No sé estimarlo' },
];
