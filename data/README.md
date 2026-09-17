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

# Fotografías de las especies (`assets/especies/`)

Cada especie de `cantabria-flora.json` tiene un array `fotos` con (como
objetivo) 3–5 fotografías útiles para reconocerla en el campo — no son
decorativas: se prioriza que muestren porte, hojas, flores y frutos
cuando existen imágenes así de calidad y con licencia reutilizable.

Fuente: iNaturalist (API pública `api.inaturalist.org`), filtrando
observaciones `quality_grade=research` (identificación validada por la
comunidad) y solo fotos con licencia abierta individual
(`cc0`/`cc-by`/`cc-by-nc`/`cc-by-sa`/`cc-by-nc-sa`), ordenadas por votos
para priorizar las más útiles. Cada foto guarda `imageAuthor`,
`imageSource`, `imageSourceUrl` (ficha del taxón o de la observación
concreta) e `imageLicense` — nunca se inventa una atribución. La misma
información se duplica en `assets/especies/credits.json` para los
créditos de la aplicación.

Si una especie no tiene suficientes fotos con licencia abierta
disponibles en iNaturalist, se guardan las que haya (pueden ser menos
de 3) en lugar de forzar el número con imágenes dudosas o de baja
calidad identificativa.

# Guía Botánica (`cantabria-flora.json`)

Catálogo botánico de especies de flora documentadas en Cantabria (no solo
invasoras). Cada especie puede tener, cuando hay fuente fiable que lo
sostenga: nombre científico aceptado, `sinonimos` (para que Pl@ntNet
pueda devolver un nombre distinto y aun así encontrarse la ficha),
nombre(s) común(es), familia, biotipo/categoría, `estatus`
(`autoctona` | `exotica` | `invasora` | `null` si no se puede determinar
con fiabilidad — ver `Laurus nobilis` como ejemplo de estatus dejado sin
determinar a propósito), descripción divulgativa (`queEs`,
`comoReconocerla`, `hojas`, `flores`, `frutosSemillas`, `floracion`,
`fructificacion`, `habitat`, `distribucionGeneralidades`,
`interesEcologico`, `importanciaCantabria`, `curiosidades`),
`destacadaRamales` y `fuentes`.

`fichaCompleta: true|false` distingue las especies con ficha divulgativa
desarrollada de las que solo tienen los datos mínimos (nombre,
sinónimos, estatus) mientras se completan progresivamente — así se puede
seguir ampliando el catálogo sin tener que redactar toda la ficha de
golpe.

**IMPORTANTE:** el campo `estatus` de este archivo (autóctona / exótica /
invasora) es la clasificación **botánica general** de la especie. NO es
la fuente que determina si un registro debe considerarse invasora para
efectos de reporte — para eso existe `catalogo-invasoras.json`,
independiente y comprobable por separado (ver más abajo). Que una
especie esté en esta guía no implica que sea invasora, y que no esté
todavía no implica que no lo sea.

# Catálogo independiente de especies invasoras (`catalogo-invasoras.json`)

Lista independiente de `cantabria-flora.json`, cuyo único propósito es
responder a una pregunta: "¿esta especie está reconocida como invasora
por una fuente oficial?" — usada para decidir si una identificación
puede generar un registro de invasora. Se construye a partir de:

- Las especies objetivo del *Plan Estratégico Regional de Gestión y
  Control de Especies Exóticas Invasoras de Cantabria* (Gobierno de
  Cantabria, 2017) — ámbito `regional-cantabria`.
- El listado de flora del *Catálogo Español de Especies Exóticas
  Invasoras* (CEEEI, MITECO) — ámbito `nacional`.

No es una copia de la guía botánica: una especie puede estar en el
catálogo de invasoras sin tener todavía ficha divulgativa completa en
`cantabria-flora.json` (en ese caso, `resolverEspecie()` la resuelve con
los datos mínimos disponibles). También se han excluido explícitamente
del listado nacional tres táxones (*Arbutus unedo*, *Cytisus scoparius*,
*Ulex europaeus*) que aparecían en una extracción automática de la
página del MITECO pero que son especies nativas ibéricas bien
documentadas — su inclusión no pudo confirmarse contra el texto legal
primario y se prefirió omitirlas antes que arriesgar una clasificación
errónea. Esta lista debe revisarse periódicamente contra la fuente
primaria del MITECO (el Excel/BOE oficial), no solo contra su página web.

Formato, un array de:

```json
{
  "cientifico": "Ailanthus altissima",
  "sinonimos": [],
  "fuentes": [{ "label": "...", "url": "https://..." }],
  "ambito": "regional-cantabria+nacional"
}
```

# Estatus de flora fuera del catálogo (`estatus-flora.json`)

Tabla ligera adicional para casos concretos: permite fijar el estatus
autóctona/exótica (no invasora — eso ya lo cubre
`catalogo-invasoras.json`) de una especie identificada por Pl@ntNet que
todavía no tiene ficha en `cantabria-flora.json`. Está vacía salvo que
se documente una fuente fiable puntual; no añadir entradas sin fuente
citable.

```json
{
  "cientifico": "Nombre científico",
  "estatus": "autoctona",
  "fuente": { "label": "Nombre de la fuente oficial", "url": "https://..." }
}
```
