# Datos del mapa público

El mapa público (`mapa.html`) usa dos fuentes de observaciones, todavía sin
conectar entre sí, más una tercera fuente auxiliar solo para clasificar:

- Los chips de filtro por tipo (herbáceas/arbustos/árboles/acuáticas) no
  añaden una clasificación nueva: reutilizan el campo `categoria` que ya
  existe en `cantabria-flora.json` (el mismo que usan los filtros de
  `guia-botanica.html`). Si una especie del histórico de QGIS todavía no
  tiene ficha en `cantabria-flora.json` (o su nombre es de género, tipo
  `Conyza spp`), no tiene categoría asignada y por tanto no aparece al
  filtrar por tipo — sigue visible en "Todas". No se ha inventado ninguna
  categoría para completar ese hueco.

## Registros históricos de QGIS (`observaciones-qgis.geojson`)

`js/mapa-publico.js` es hoy el que carga y pinta este archivo. Se generó a
partir de `EEI_Ramales_2026.gpkg` (GeoPackage de QGIS, en este mismo
directorio), que contiene 44 capas: 43 especies + `PostesLuz` (0 registros,
no es una observación y se excluyó). Conversión: `ogrinfo`/`ogr2ogr` de GDAL
(bundlados con la instalación de QGIS del proyecto) con una consulta SQL
`UNION ALL` de las 43 capas de especies, exportado a GeoJSON en EPSG:4326
(`urn:ogc:def:crs:OGC:1.3:CRS84`).

Total: 4484 observaciones. De ellas, 26 no tienen geometría en el
GeoPackage de origen (`geometry: null` en el GeoJSON) — no se inventaron
coordenadas para esos registros, así que no aparecen en el mapa; siguen en
el archivo por si se completan más adelante. Además hay 1 registro
(`Lonicera japonica`, código `LJ77`) cuya longitud tiene el signo positivo
en el GeoPackage original (debería casi con toda seguridad ser negativa, a
juzgar por los registros vecinos) — se ha dejado tal cual venía en QGIS en
vez de corregirlo sin confirmación; conviene revisarlo/corregirlo en QGIS y
regenerar el GeoJSON.

Campos conservados por observación (todos los que existían en el
GeoPackage, ninguno inventado): `ID`, `ESPECIE` (nombre científico = nombre
de la capa), `NOMBRE_COM` (nombre común, sin normalizar mayúsculas/minúsculas
del original), `FECHA_HORA`, `ALTITUD`, `OBSERVACIO` (a menudo vacío) y
`CODIGO`. 57 registros tenían `FECHA_HORA` corrupto en el GeoPackage
(`PyQt5.QtCore.QDate(...)`, un error de exportación previo desde QGIS); se
reformateó ese valor a `AAAA-MM-DD` porque los tres números ya estaban
presentes en el propio texto corrupto — no se rellenó ninguna fecha que no
estuviera ya en el dato original.

Para regenerar este archivo tras corregir el GeoPackage en QGIS: usar
`ogr2ogr` (incluido en `C:\Program Files\QGIS 3.30.2\bin\`) con una consulta
`-dialect sqlite -sql "SELECT ID, ESPECIE, NOMBRE_COM, FECHA_HORA, ALTITUD,
OBSERVACIO, CODIGO, geom FROM \"Capa1\" UNION ALL SELECT ... FROM \"Capa2\"
..."` sobre las 43 capas de especies (excluyendo `PostesLuz`), exportando a
`-f GeoJSON`.

**IMPORTANTE — este archivo NO lo usa el mapa público.** Contiene campos que
no deben ser públicos sin más (`FECHA_HORA` exacta, `CODIGO`, y sobre todo
`OBSERVACIO`, que en varios registros incluye literalmente el nombre de pila
de la persona que hizo el trabajo de campo, p. ej. `"BEATRIZ"` /
`"REGISTROS BEATRIZ"`). Al estar en un repositorio de GitHub público, este
archivo es descargable por cualquiera igualmente (ocultarlo en la interfaz
del mapa no lo protege) — se mantiene aquí como fuente de trabajo/histórico
del proyecto, no como dato a publicar tal cual. El mapa usa en su lugar
`observaciones-qgis-publico.geojson` (ver abajo).

## Histórico QGIS — versión PÚBLICA (`observaciones-qgis-publico.geojson`)

Este es el archivo que carga `js/mapa-publico.js` para el histórico. Se
genera a partir del mismo `EEI_Ramales_2026.gpkg`, con la misma consulta
`UNION ALL` de las 43 capas de especies, pero seleccionando únicamente
`ESPECIE, NOMBRE_COM, geom` — sin `ID`, `FECHA_HORA`, `ALTITUD`,
`OBSERVACIO` ni `CODIGO`. Ningún dato personal, ninguna fecha exacta,
ningún identificador de registro individual.

```
-dialect sqlite -sql "SELECT ESPECIE, NOMBRE_COM, geom FROM \"Capa1\"
UNION ALL SELECT ESPECIE, NOMBRE_COM, geom FROM \"Capa2\" ..."
```

Mismas 4484 observaciones (26 sin geometría, igual que en el archivo
completo) — la minimización es de campos, no de registros. Si se regenera
`observaciones-qgis.geojson` tras una corrección en QGIS, hay que regenerar
también este archivo con la misma consulta reducida.

## Reportes ciudadanos aprobados (vía Apps Script)

El mapa ya no lee `reportes-publicos.json`: `cargarReportesCiudadanos()` en
`js/mapa-publico.js` hace `fetch(CONFIG.reportesApiUrl)` (el mismo Web App
de Apps Script que recibe los reportes nuevos, ver `apps-script/`), que
responde solo con las filas `Estado = 🟢 Aprobado` y solo los campos
públicos: `id, nombreComun, cientifico, lat, lon, foto`. Los datos privados
(nombre, email, observaciones, descripción del lugar) ni siquiera los lee
`leerReportesAprobados_()` en Apps Script — no es que se filtren después.

## `reportes-publicos.json` (histórico del formato, sin uso actual)

Ya no lo usa el mapa (ver arriba). Se mantiene vacío por si hace falta como
referencia del formato original o como *fallback* manual en el futuro.
Formato que tenía, un array de:

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
