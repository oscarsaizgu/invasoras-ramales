# Datos del mapa público

`reportes-publicos.json` alimenta el mapa público (`mapa.html`). Está vacío
a propósito: todavía no existe una base de datos real conectada, y el mapa
no debe mostrar puntos inventados.

Cuando exista un backend (ver más abajo), este archivo se sustituye por una
llamada a la API real. Formato esperado por `js/mapa-publico.js`, un array de:

```json
{
  "id": "string",
  "especie": "nombre común",
  "lat": 43.2522,
  "lon": -3.4628,
  "fecha": "2026-09-11",
  "tamanyo": "Colonia mediana (10-100 m²)",
  "estado": "pendiente | en_revision | confirmado | gestionado | descartado",
  "fotos": ["url1.jpg"]
}
```

No debe incluir nunca nombre, email ni otros datos personales del
ciudadano que envió el reporte. Si el reporte contiene información
sensible, la coordenada pública debe redondearse para no señalar un
punto exacto.

# Estatus de flora fuera del catálogo (`estatus-flora.json`)

Tabla ligera, independiente de `cantabria-flora.json`, para poder mostrar
el estatus (autóctona / exótica / invasora) de una especie identificada
por Pl@ntNet que todavía no tiene ficha completa en la guía botánica.
No sustituye una ficha ni añade nuevas especies al catálogo (eso es la
fase 2): solo permite etiquetar el estatus cuando existe una fuente
oficial fiable que lo confirme.

Está vacío a propósito hasta que se decida qué fuente oficial citar para
especies autóctonas/exóticas (para las invasoras ya sirve el Plan de
Cantabria de `cantabria-flora.json`). No añadir entradas sin una fuente
citable — no se debe inferir ni suponer el estatus.

Formato esperado por `js/catalogo.js`, un array de:

```json
{
  "cientifico": "Quercus robur",
  "estatus": "autoctona",
  "fuente": { "label": "Nombre de la fuente oficial", "url": "https://..." }
}
```
