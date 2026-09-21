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
concreta) e `imageLicense` — nunca se inventa una atribución.

Si una especie no tiene suficientes fotos con licencia abierta
disponibles en iNaturalist, se guardan las que haya (pueden ser menos
de 3) en lugar de forzar el número con imágenes dudosas o de baja
calidad identificativa.

# Guía Botánica (`cantabria-flora.json`)

Guía de la flora de Cantabria con **fichas verificadas** (revisión taxonómica y
de estatus del 21/09/2026). Contiene 172 especies: 86 autóctonas, 59 alóctonas,
23 invasoras y 4 con estatus pendiente de revisión. El informe de la segunda
auditoría (comprobaciones, cambios y especies pendientes) está en
`AUDITORIA-BOTANICA-2026-09-21.md`. No es «la lista de
invasoras»: la mayoría de las fichas no lo son.

## Estatus de cada ficha (`estatus`)

| Valor | Significado | Criterio |
|---|---|---|
| `invasora` | Exótica invasora | Figura en el **CEEEI** (MITECO) con un ámbito que incluye Cantabria. Es el único criterio. |
| `aloctona` | Presente en Cantabria pero no de origen local y **no** catalogada como invasora aquí | POWO (Kew) la da como introducida en España, o Flora Ibérica la cita como naturalizada/cultivada. Aparecer solo en el Plan Estratégico Regional de Cantabria o en la lista MITECO de alóctonas NO la hace invasora. |
| `autoctona` | Nativa | POWO la da como nativa de España **y** hay presencia en Cantabria (Flora Ibérica, GBIF). |
| `dudosa` | Estatus pendiente de revisión | Las fuentes se contradicen o no bastan (p. ej. *Laurus nobilis*, *Populus nigra*, *Buxus sempervirens*, *Myosotis scorpioides*, *Dittrichia viscosa*). |

`exotica` (valor antiguo) se sigue leyendo como `aloctona`. **El campo `estatus`
de la ficha nunca decide por sí solo si un registro es invasora:** en la web el
nivel se resuelve en `js/catalogo.js` (`resolverNivelInvasion`) exclusivamente
con `catalogo-invasoras.json` (CEEEI + ámbito). Si el `estatus` de una ficha
y el CEEEI se contradijeran, gana el CEEEI.

## Campos de cada ficha

`id`, `cientifico` (nombre **aceptado** según POWO/Kew), `autor`, `sinonimos`
(sin autores, para que Pl@ntNet u otras fuentes puedan devolver un nombre
distinto y aun así encontrar la ficha), `comunes` (Flora Ibérica, «N.v.»; los
etiquetados «(Cantabria)» van al final), `familia` (POWO) y
`familiaFloraIberica` (solo cuando Flora Ibérica usa otra familia),
`biotipo`, `categoria` (`herbacea|arbusto|arbol|acuatica`, la que usan los
filtros), `estatus`, `estatusDetalle` (explicación con las fuentes),
`presenciaCantabria`, `origen`, la descripción (`queEs`, `comoReconocerla`,
`hojas`, `flores`, `frutosSemillas`, `floracion`, `fructificacion`, `habitat`,
`distribucionGeneralidades`; en las fichas del Plan de Cantabria, `biologiaEcologia`,
`introduccion`, `medidasControl` y `erradicacionCantabria`), `fotos`, `pendiente` (lo que **no** se ha podido
verificar: se muestra en la ficha como «Pendiente de verificar»),
`fuentesPorCampo` (`taxonomia`, `estatus`, `distribucion`, `descripcion`; cada
una con `label` y `url`), `fuentes` (unión de las anteriores, por
compatibilidad) y `revisionTaxonomica`.

Campos solo para especies del CEEEI: `enCatalogoNacionalCEEEI`, `nombreCEEEI`
(nombre tal como aparece en el CEEEI), `ambitoCEEEI`, `planRegionalCantabria`.
Fichas de género: `nivelTaxonomico: "genero"` (nombre acabado en « spp.»);
`excepciones` excluye especies del género (p. ej. *Ludwigia palustris*, nativa).

**Regla de la ficha:** no se escribe ningún dato que no salga de una fuente.
Las secciones sin fuente contrastada (confusiones con otras especies, interés
ecológico, curiosidades, usos) se dejan **vacías** en lugar de rellenarse; en la
segunda auditoría (21/09/2026) se eliminaron todos los textos de este tipo que
no tenían fuente (`interesEcologico`, `importanciaCantabria`, `curiosidades`:
61 textos). El texto descriptivo de cada ficha procede de una de estas fuentes,
indicada en `fuentesPorCampo.descripcion`:

- **Fichas del Plan de Cantabria (76 especies exóticas):** texto literal de las
  fichas oficiales del Plan Estratégico Regional (2017): «Cómo reconocerla»,
  «Generalidades» (campo `biologiaEcologia`, que antes se guardaba por error como
  distribución), «Medidas y control», introducción y viabilidad de erradicación.
  Solo se corrigieron artefactos de extracción y erratas tipográficas. Estos
  textos no se han reescrito ni completado con otras fuentes; donde Flora Ibérica
  da otra fenología, se anota en `pendiente`.
- **Resto de fichas (96):** redactadas a partir de **Flora Ibérica** (RJB-CSIC);
  dos excepciones sin tratamiento en Flora Ibérica: *Iris pseudacorus* (Flora of
  North America) y *Phragmites australis* (Flora of China). Los datos que la
  fuente no recoge (color de la flor, fruto, nombre común…) se dejan vacíos y se
  anotan en `pendiente`.
- Las cifras (tamaños, altitudes, meses) de esas 96 fichas se verificaron contra
  el texto de la fuente.

## Fuentes usadas y su papel

- **CEEEI** (MITECO, tabla de flora del 21/10/2025) y **Real Decreto 630/2013**
  (BOE-A-2013-8565): decide «invasora» y el ámbito de aplicación.
- **Lista de especies alóctonas** (MITECO, junio 2025): solo como contraste; una
  especie que solo está ahí es alóctona, no invasora. Su relación de especies
  nativas de la Lista Patrón (LPES) por género se usa como evidencia **positiva**
  de que una especie es nativa (no es exhaustiva).
- **POWO / Kew** (Plants of the World Online): nombre aceptado, autor, familia,
  sinónimos y carácter nativo/introducido en España.
- **Flora Ibérica** (RJB-CSIC): descripción, hábitat, fenología, nombres
  vernáculos y presencia por provincias (S = Santander/Cantabria; `[S]` =
  naturalizada/cultivada; `(S)` = cita fiable sin material revisado).
- **GBIF**: solo como apoyo de presencia (registros en Cantabria, consulta con
  `gadm_gid=ESP.3_1`, y en el polígono de Ramales). Nunca decide el estatus.
- **Plan Estratégico Regional de Gestión y Control de EEI de Cantabria (2017)**
  (Gobierno de Cantabria): se cita cuando la especie es objetivo del plan; no
  determina «invasora».
- **No disponible:** *Anthos* (Real Jardín Botánico) no pudo consultarse
  (no responde a consultas automáticas) y no se ha usado; *World Flora Online*
  no se ha necesitado. Pendiente de contrastar a mano cuando se pueda.

## Fotografías

Fotos de iNaturalist; cada foto guarda `imageAuthor`, `imageSource`,
`imageSourceUrl` (página de la observación o, si procede de la foto por defecto
de un taxón, página de esa foto) e `imageLicense`.

Las 40 fichas rehechas o añadidas en 2026 (35 nuevas + 5 añadidas) pasaron una
selección estricta, con la evidencia guardada en `imageChecks`: observación de
grado investigación; taxón de la observación igual a la especie; al menos 2
identificaciones de acuerdo y ninguna en desacuerdo (salvo 2 fotos de
identificación inequívoca); licencia **CC0, CC BY o CC BY-SA**; ≥ 800 px; ubicación
no oculta y precisión ≤ 5 km; ámbito ibérico; un observador por foto; y revisión
visual. Cuando ninguna foto cumple, la ficha se queda sin fotos (*Ulex gallii*,
*Pinus radiata*) en lugar de usar una dudosa.

Las fotos de las demás fichas (licencias mayoritariamente CC BY-NC: 455 CC BY-NC y
25 CC BY-NC-SA de 781 fotos) se comprobaron contra la API de iNaturalist (grado
investigación y taxón coincidente) pero **no** se han vuelto a revisar una a una.
La licencia NC permite uso no comercial con atribución: conviene que el
Ayuntamiento confirme que la web encaja en ese uso. Cuatro imágenes del asistente
de reportes (`images/plumero.jpg`, `vara.jpeg`, `bambu.jpg`, `amor.jpg`) no tienen
autoría ni licencia documentadas: se han retirado de las fichas y siguen
usándose en el asistente hasta que se decida.

## Cómo tratar los cambios de nombre (sinonimia)

El nombre científico guardado es el aceptado por POWO; el anterior queda en
`sinonimos`. Casos revisados: *Fallopia japonica* → *Reynoutria japonica*,
*Eichhornia crassipes* → *Pontederia crassipes*, *Bromus willdenowii* →
*Bromus catharticus*, *Chamaesyce polygonifolia* → *Euphorbia polygonifolia*,
*Coronopus didymus* → *Lepidium didymum*, *Paspalum paspalodes* → *Paspalum
distichum*, *Senecio mikanioides* → *Delairea odorata*, *Spartina alterniflora*
→ *Sporobolus alterniflorus*, *Spartina patens* → *Sporobolus pumilus*,
*Tamus communis* → *Dioscorea communis*, y otros. El formulario de reporte
sigue guardando el nombre que ya usaba el envío (`config.js`), con `alias` para
poder preseleccionar desde una ficha con el nombre nuevo.

# Catálogo independiente de especies invasoras (`catalogo-invasoras.json`)

Lista independiente de `cantabria-flora.json`, con un único propósito: responder
«¿esta especie es invasora en Cantabria según la fuente oficial?». Se usa para
decidir si una identificación puede generar un reporte de invasora.

Contiene **solo** las especies del **CEEEI** (flora) cuyo ámbito de aplicación
incluye Cantabria: 43 entradas de las 69 filas de flora del CEEEI. Un ámbito
vacío significa todo el territorio español; «Excepto Canarias» y «Excepto
Canarias y Baleares» y «Península Ibérica y Baleares» incluyen Cantabria;
«Canarias», «Baleares» y «Canarias y Baleares» no. Ya **no** se incluyen las
especies que solo aparecían en el Plan Regional de Cantabria (2017): esas son
alóctonas hasta que entren en el CEEEI.

Formato, un array de:

```json
{
  "cientifico": "Fallopia japonica",
  "sinonimos": ["Reynoutria japonica"],
  "nombreComun": "Hierba nudosa japonesa",
  "ambito": "todo el territorio español",
  "incluyeCantabria": true,
  "norma": "Real Decreto 630/2013",
  "planRegionalCantabria": true,
  "excepciones": [],
  "fuentes": [{ "label": "...", "url": "https://..." }]
}
```

Revisar periódicamente contra el CEEEI vigente del MITECO (se actualiza a
menudo). El Apps Script (`apps-script/CatalogoInvasoras.gs`) lee este mismo
archivo publicado en la web: **hay que volver a desplegar el Apps Script** tras
esta actualización para que los reportes usen la lista nueva.

# Estatus de flora fuera del catálogo (`estatus-flora.json`)

Tabla ligera adicional para casos concretos: permite fijar el estatus
autóctona/alóctona (no invasora — eso ya lo cubre `catalogo-invasoras.json`) de
una especie identificada por Pl@ntNet que todavía no tiene ficha en
`cantabria-flora.json`. Está vacía salvo que se documente una fuente fiable
puntual; no añadir entradas sin fuente citable.

```json
{
  "cientifico": "Nombre científico",
  "estatus": "autoctona",
  "fuente": { "label": "Nombre de la fuente oficial", "url": "https://..." }
}
```
