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
