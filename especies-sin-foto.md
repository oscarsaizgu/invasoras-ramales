# Especies sin fotografía — informe

Fecha: 2026-09-16

## Resultado final

**Todas las 69 especies del catálogo completo tienen actualmente una
fotografía** con licencia reutilizable, obtenida de iNaturalist (66) o
reutilizando una fotografía ya existente en la aplicación para las 3
especies prioritarias que coinciden con el catálogo (Plumero, Bambú
japonés, Amor de hombre — ver más abajo). Este archivo se conserva
igualmente, tal y como se pidió, para dejar constancia del proceso de
búsqueda y de los casos que requirieron una segunda pasada.

## Proceso de búsqueda

Para cada especie se consultó la API pública de iNaturalist
(`api.inaturalist.org`) en dos pasos:

1. Búsqueda del taxón por nombre científico y comprobación de si su
   `default_photo` tiene una licencia reutilizable
   (CC0 / CC-BY / CC-BY-SA / CC-BY-NC / CC-BY-NC-SA).
2. Si no la tiene, búsqueda de observaciones de calidad "research grade"
   de ese taxón filtradas por `photo_license` con esas mismas licencias,
   ordenadas por votos, y selección de la primera fotografía válida.

Se **descartaron explícitamente** las fotografías con licencia
"Todos los derechos reservados" (sin licencia) o con cláusula
**ND (No Derivados)**, ya que optimizar/redimensionar la imagen para la
tarjeta se considera una modificación no permitida por esa cláusula.

## Casos que inicialmente no encontraron foto (y por qué)

En la primera pasada, 6 especies quedaron sin fotografía porque
iNaturalist las tiene catalogadas bajo un **nombre científico distinto**
al usado por el MITECO en el Catálogo Español de Especies Exóticas
Invasoras (reclasificaciones taxonómicas recientes), y la comprobación
de seguridad para evitar mezclar especies fue inicialmente demasiado
estricta:

| Especie (nombre MITECO) | Nombre aceptado en iNaturalist |
|---|---|
| *Pennisetum clandestinum* | *Cenchrus clandestinus* |
| *Pennisetum purpureum* | *Cenchrus purpureus* |
| *Pennisetum villosum* | *Cenchrus longisetus* |
| *Spartina alterniflora* | *Sporobolus alterniflorus* |
| *Spartina densiflora* | *Sporobolus densiflorus* |
| *Spartina patens* | *Sporobolus pumilus* |

Estas reclasificaciones son, de hecho, las mismas que ya recoge el
propio MITECO como sinónimos en su ficha oficial (columna "autoridad"
del catálogo). Se confirmó mediante el campo `matched_term` que
devuelve la API de iNaturalist (que indica exactamente qué término de
búsqueda reconoció) que se trataba de la misma especie, no de una
especie distinta, y se repitió la búsqueda con esa comprobación
añadida. Las 6 especies obtuvieron entonces una fotografía válida con
licencia reutilizable (CC-BY, CC-BY-NC o CC0 según el caso).

## Especies prioritarias de Ramales — origen de su fotografía

Las 4 especies destacadas para Ramales usan las fotografías **que ya
tenía la aplicación** (no se han tocado ni sustituido):

- Plumero (*Cortaderia selloana*) → `images/plumero.jpg`
- Bambú japonés (*Fallopia japonica*) → `images/bambu.jpg`
- Amor de hombre (*Tradescantia fluminensis*) → `images/amor.jpg`
- Vara de San José (*Crocosmia x crocosmiiflora*) → `images/vara.jpeg`

Por eso, aunque estas 3 primeras especies también existen como entradas
en el catálogo completo (bajo *Cortaderia spp.*, *Fallopia japonica* y
*Tradescantia fluminensis*), sus tarjetas reutilizan la foto local en
lugar de la de iNaturalist — que se descargó igualmente durante la
búsqueda pero se descartó para no duplicar innecesariamente, ya que la
foto local cumple perfectamente su función.

## Si en el futuro falta alguna fotografía

Si se amplía el catálogo con nuevas especies del CEEEI y alguna no
encuentra fotografía con licencia reutilizable en iNaturalist, debe
documentarse aquí siguiendo este mismo formato en lugar de usar una
imagen inventada, genérica o de otra especie.
