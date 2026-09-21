# Auditoría botánica completa del catálogo — 21/09/2026

Documento de trabajo generado a partir de `data/cantabria-flora.json` y de las comprobaciones descritas abajo. No se ha hecho commit ni push.

## 1. Resultado

| | Nº |
|---|---|
| Especies revisadas una por una | **172** (168 previas + 5 añadidas − 1 retirada) |
| Autóctona | **86** |
| Alóctona | **59** |
| Invasora | **23** |
| Dudosa / no suficientemente documentada | **4** |
| Fichas con al menos una sección «Pendiente de verificar» | **60** |
| Fichas modificadas en esta auditoría (algún campo de la lista) | **144** |
| Nombres científicos cambiados | **1** en esta segunda auditoría (*Hedera helix* → ficha de género *Hedera* spp.) y **20** en la revisión de nomenclatura anterior (p. ej. *Fallopia japonica* → *Reynoutria japonica*, *Eichhornia crassipes* → *Pontederia crassipes*, *Spartina alterniflora* → *Sporobolus alterniflorus*) |
| Especies añadidas | 5: Quercus ilex, Origanum vulgare, Angelica sylvestris, Primula veris, Cymbalaria muralis |
| Especies retiradas | 1: Myosotis scorpioides |
| Fotografías en el catálogo | 781 (licencias: cc-by-nc 455, cc-by 207, cc0 60, cc-by-sa 34, cc-by-nc-sa 25) |
| Fotografías de las 40 fichas nuevas tras la revisión estricta | 125 (de 166 candidatas; de las 130 anteriores se conservan 25) |

Cambios por campo (nº de fichas afectadas): distribucionGeneralidades 126, presenciaCantabria 79, comoReconocerla 60, origen 55, habitat 55, queEs 55, biotipo 53, hojas 53, comunes 51, floracion 50, flores 44, frutosSemillas 42, estatusDetalle 24, fructificacion 20, medidasControl 7, introduccion 2, erradicacionCantabria 2.

## 2. Comprobaciones realizadas

1. **Nombre aceptado, autor y familia (POWO/Kew):** las 164 fichas de especie coinciden con un registro POWO «accepted» con el mismo nombre y la misma familia. Incumplimientos: ninguno.
2. **Descripciones del Plan de Cantabria:** las 76 fichas del Plan Estratégico Regional (2017) se contrastaron con el PDF oficial de fichas de flora (texto localizado en el sitio dgmontes.org del Gobierno de Cantabria): 76/76 fichas emparejadas y el texto de «Cómo reconocerla», «Generalidades» y «Medidas y control» coincide literalmente, salvo 6 artefactos de extracción que se corrigieron (números de página, guiones de fin de línea, título de otra ficha dentro de *Arundo donax*) y 5 erratas tipográficas del original (`hoyas`, `medina popular`, `eutrofizacion`, etc.).
3. **Descripciones redactadas (96 fichas: 35 nuevas + 56 antiguas fuera del Plan + 5 añadidas):** cada cifra escrita (1.376 números) se buscó en el texto de Flora Ibérica; las discrepancias se revisaron una a una (2 correcciones reales: tamaño de la hoja de *Ligustrum vulgare* y altura de *Origanum vulgare*; el resto eran conversiones de unidades o redondeos). Fuente distinta de Flora Ibérica solo en 3 fichas: *Iris pseudacorus* (Flora of North America), *Phragmites australis* (Flora of China) y la ficha de género *Hedera*.
4. **Presencia en Cantabria:** Flora Ibérica (código **S** = Santander; material revisado / cita fiable / naturalizada / ausente) + GBIF (recuento nuevo de hoy con la clave del taxón aceptado, `gadm_gid=ESP.3_1`, y polígono de Ramales) + Plan de Cantabria cuando la especie es objetivo. GBIF solo como apoyo.
5. **Estatus nativa/introducida:** POWO + Flora Ibérica + CEEEI; contraste adicional con la relación de especies nativas de la Lista Patrón (LPES) de la lista de alóctonas del MITECO (2025): **ninguna especie alóctona o invasora figura como nativa en LPES**. LPES solo se usa como evidencia positiva (la relación por género es incompleta: p. ej. no incluye *Salix atrocinerea*).
6. **Invasoras:** solo las 23 fichas cuyo nombre está en el CEEEI con ámbito que incluye Cantabria; coherencia ficha ↔ `catalogo-invasoras.json` (43 entradas): 0 incoherencias.
7. **Nombres comunes:** los de las 76 fichas del Plan se localizaron en el PDF del Plan (se corrigieron 2 truncados: *llagas de Cristo*, *hierba calderona*); los del resto proceden de la lista «N.v.» de Flora Ibérica (los marcados «(Cantabria)» se añaden al final). Sin nombre verificado: 10 fichas (se muestra el nombre científico).
8. **Fotografías nuevas (40 fichas):** criterios aplicados a cada observación de iNaturalist: grado investigación; taxón de la observación = la especie (no un taxón superior); ≥2 identificaciones de acuerdo y 0 en desacuerdo (se admitió un solo acuerdo únicamente en 2 fotos de identificación inequívoca a simple vista: *Hepatica nobilis* nº4 y *Prunus laurocerasus* nº2); licencia CC0/CC BY/CC BY-SA; ≥800 px; ubicación no ocultada y precisión ≤5 km; ámbito ibérico; un observador por foto; y revisión visual foto a foto. Se guarda por foto autor, fuente, licencia, nº de observación, nº de identificaciones de acuerdo/desacuerdo, fecha y lugar (`imageChecks`).
9. **Fotografías antiguas (fichas no rehechas):** 660 fotos; consulta a la API de cada observación: **557** de grado investigación con taxón coincidente; **6** con algún desacuerdo registrado; **99** apuntaban a la página del taxón y se sustituyó el enlace por la página concreta de la foto en iNaturalist; **4** imágenes del asistente de reportes (`images/plumero.jpg`, `vara.jpeg`, `bambu.jpg`, `amor.jpg`) no tienen autoría ni licencia documentadas y se han retirado de las fichas (el asistente de reportes las sigue usando: decisión pendiente).

## 3. Especies problemáticas o no resueltas

- **Laurus nobilis** (dudosa): Flora Ibérica y la ficha oficial del hábitat 5230* advierten de la dificultad de separar poblaciones autóctonas y naturalizadas; POWO lo da como introducido; algunos autores (Bueno & Fernández 1991; Loidi et al. 1994) consideran los lauredales costeros cantábricos comunidad con entidad propia. No se puede resolver con las fuentes consultadas.
- **Populus nigra** (dudosa): POWO y la relación LPES del MITECO la dan como nativa de España; Flora Ibérica solo la considera asilvestrada (también en Santander).
- **Buxus sempervirens** (dudosa): Flora Ibérica no cita Santander; POWO nativa; GBIF con 25 registros; la ficha oficial del hábitat 5110 atribuye a Cantabria una parte de la superficie de bojedas. Indicios de poblaciones naturales, pero no demostrado para todas.
- **Dittrichia viscosa** (dudosa): POWO nativa; sin tratamiento de Flora Ibérica ni fuente regional sobre origen de las poblaciones cantábricas.
- **Myosotis scorpioides** (RETIRADA): POWO no la registra para España, GBIF no tiene ningún registro en Cantabria, la relación LPES del género no la incluye y no hay tratamiento de Flora Ibérica localizado: presencia en Cantabria no demostrada.
- **Hedera (helix / hibernica)** (ficha de género): Flora Ibérica cita en Santander *H. hibernica* (material revisado) y no *H. helix*; ambas son difíciles de distinguir y Pl@ntNet suele devolver *H. helix*. Por eso la ficha es de género (*Hedera* spp.).
- **Ulex gallii / Pinus radiata** (sin foto): Ninguna foto cumplió los criterios estrictos o dejó dudas (*Ulex gallii* es indistinguible en foto de otros tojos).
- **Fichas de género (Agapanthus, Azolla, Carpobrotus, Erigeron grupo Conyza, Ipomoea, Ludwigia, Oenothera, Hedera)** (género): La especie concreta presente en Cantabria no está determinada con fuente.
- **Sambucus nigra, Acer campestre y otras** (nota): Flora Ibérica avisa de que en algunas la procedencia (cultivada/espontánea) es difícil de establecer; se ha dejado constancia en la ficha.
- **Quercus ilex, Primula veris, Ulex europaeus, Fraxinus excelsior…** (nota): Flora Ibérica reconoce subespecies; la que consta en Cantabria está anotada o pendiente en cada ficha.
- **76 fichas del Plan de Cantabria** (nota): La descripción es la del Plan (fuente oficial, 2017; nomenclatura de la época: p. ej. «Mimosaceae»). Se contrastó con Flora Ibérica solo donde existe tratamiento (fenología: 9 diferencias menores que se anotan en cada ficha).

## 4. Especies evaluadas y NO añadidas

- *Aquilegia vulgaris*: Flora Ibérica reconoce varias subespecies con áreas distintas y en el norte hay taxones muy próximos; taxonomía a nivel de especie no lo bastante clara para identificar con seguridad.
- *Asplenium trichomanes*: complejo de subespecies (quadrivalens, trichomanes, pachyrachis…) de identificación difícil; GBIF no distingue.
- *Vandenboschia speciosa*: presencia demostrada (Flora Ibérica, material revisado en Santander) pero solo 6 registros GBIF (1 en Ramales), helecho diminuto y de identificación no útil para senderismo; se deja fuera.
- Añadidas con fuentes: *Quercus ilex* (subsp. ilex), *Origanum vulgare*, *Angelica sylvestris*, *Primula veris* y *Cymbalaria muralis* (alóctona naturalizada).

## 5. Fuentes utilizadas

- **Taxonomía:** Plants of the World Online (Kew/POWO); Flora Ibérica (RJB-CSIC).
- **Presencia en Cantabria:** Flora Ibérica (código S); GBIF (solo apoyo); fichas del Plan Estratégico Regional de EEI de Cantabria (2017).
- **Invasora:** Catálogo Español de Especies Exóticas Invasoras (MITECO, tabla del 21/10/2025) y Real Decreto 630/2013 (BOE-A-2013-8565).
- **Nativa / alóctona:** POWO; Flora Ibérica; lista de especies alóctonas del MITECO (junio 2025) con la relación de nativas de la LPES; MITECO Inventario Nacional (*Laurus nobilis*); fichas de hábitats 5230 y 5110 (Bases ecológicas preliminares, MMA/MARM).
- **Descripción botánica:** Flora Ibérica; fichas del Plan de Cantabria (2017); Flora of North America (*Iris pseudacorus*); Flora of China (*Phragmites australis*).
- **Fotografías:** iNaturalist (cada foto con autor, licencia y enlace a la observación o a la foto).
- **No utilizadas / no accesibles:** Anthos (sin acceso automático); World Flora Online (no necesaria); Wikipedia y webs comerciales (no se usan como fuente).

## 6. Fichas con secciones «Pendiente de verificar» (60)

| Especie | Estatus | Pendiente |
|---|---|---|
| *Agapanthus spp.* | aloctona | Ficha a nivel de género: pendiente de concretar la(s) especie(s) presente(s) en Cantabria. |
| *Agave americana* | invasora | Fenología sin unificar entre fuentes: el Plan de Cantabria indica floración de julio a septiembre; Flora Ibérica indica V-VIII. |
| *Araujia sericifera* | invasora | Fenología sin unificar entre fuentes: el Plan de Cantabria indica floración de mayo a septiembre; Flora Ibérica indica (II)VI-XI. |
| *Azolla spp.* | invasora | Ficha a nivel de género: pendiente de concretar la(s) especie(s) presente(s) en Cantabria. |
| *Carpobrotus spp.* | invasora | Ficha a nivel de género: pendiente de concretar la(s) especie(s) presente(s) en Cantabria. |
| *Euphorbia polygonifolia* | aloctona | Fenología sin unificar entre fuentes: el Plan de Cantabria indica floración de julio a noviembre; Flora Ibérica indica IV-X(XII). |
| *Erigeron spp. (grupo Conyza)* | aloctona | Ficha a nivel de género: pendiente de concretar la(s) especie(s) presente(s) en Cantabria. |
| *Pontederia crassipes* | invasora | Fenología sin unificar entre fuentes: el Plan de Cantabria indica floración de marzo a julio; Flora Ibérica indica VI-XI. |
| *Ipomoea spp.* | aloctona | Ficha a nivel de género: pendiente de concretar la(s) especie(s) presente(s) en Cantabria. |
| *Lonicera japonica* | aloctona | Fenología sin unificar entre fuentes: el Plan de Cantabria indica floración de mayo a septiembre; Flora Ibérica indica IV-XII. |
| *Ludwigia spp.* | invasora | Ficha a nivel de género: pendiente de concretar la(s) especie(s) presente(s) en Cantabria. |
| *Nicotiana glauca* | aloctona | Fenología sin unificar entre fuentes: el Plan de Cantabria indica floración de abril a octubre; Flora Ibérica indica II-XII. |
| *Oenothera spp.* | aloctona | Ficha a nivel de género: pendiente de concretar la(s) especie(s) presente(s) en Cantabria. |
| *Oxalis pes-caprae* | invasora | Fenología sin unificar entre fuentes: el Plan de Cantabria indica floración de septiembre a mayo; Flora Ibérica indica (IX)XI-V. |
| *Tradescantia fluminensis* | invasora | Fenología sin unificar entre fuentes: el Plan de Cantabria indica floración de marzo a septiembre; Flora Ibérica indica (III)IV-V(VI). |
| *Tropaeolum majus* | aloctona | Fenología sin unificar entre fuentes: el Plan de Cantabria indica floración de mayo a septiembre; Flora Ibérica indica III-IX. |
| *Fraxinus excelsior* | autoctona | El tratamiento consultado de Flora Ibérica corresponde a la subsp. excelsior. |
| *Ulex europaeus* | autoctona | Flora Ibérica reconoce dos subespecies (subsp. europaeus y subsp. latebracteatus): subespecie presente en Cantabria pendiente de concretar. · Faltan en la ficha la descripción de hojas, flores y frutos: pendiente de completar con Flora Ibérica. |
| *Cytisus scoparius* | autoctona | Faltan en la ficha la descripción de hojas y frutos: pendiente de completar con Flora Ibérica. |
| *Rubus ulmifolius* | autoctona | Sin nombre común recogido por Flora Ibérica para esta especie. · Diferencias con otras especies de Rubus pendientes de documentar con Flora Ibérica. · Sin nombre común verificado en las fuentes consultadas. |
| *Hedera spp.* | autoctona | El nombre común «hiedra» es de uso general y no figura en el tratamiento consultado de Flora Ibérica: pendiente de contrastar con una fuente. · Flora Ibérica cita en Santander (Cantabria) Hedera hibernica (material revisado) y no cita Hedera helix; las dos especies no se distinguen fácilmente, por eso la ficha es de género. |
| *Crataegus monogyna* | autoctona | Faltan en la ficha la descripción del fruto: pendiente de completar con Flora Ibérica. |
| *Sorbus aucuparia* | autoctona | Faltan en la ficha la descripción del fruto: pendiente de completar con Flora Ibérica. |
| *Daboecia cantabrica* | autoctona | Flora Ibérica no recoge nombres vernáculos: pendiente de contrastar el nombre común con una fuente. · Faltan en la ficha la descripción del fruto: pendiente de completar con Flora Ibérica. · Sin nombre común verificado en las fuentes consultadas. |
| *Genista florida* | autoctona | Faltan en la ficha la descripción del fruto: pendiente de completar con Flora Ibérica. |
| *Frangula alnus* | autoctona | Falta la descripción del fruto y del área de distribución completa: pendiente de completar con Flora Ibérica (tratamiento enlazado en «Fuentes»). |
| *Rosa canina* | autoctona | Flora Ibérica no recoge nombres vernáculos de esta especie en el tratamiento consultado. · Faltan la descripción del fruto y las diferencias con otras especies de Rosa: pendiente de completar con Flora Ibérica. · Sin nombre común verificado en las fuentes consultadas. |
| *Rhamnus alaternus* | autoctona | Faltan la descripción del fruto: pendiente de completar con Flora Ibérica. |
| *Acer pseudoplatanus* | autoctona | Faltan en la ficha la descripción del fruto: pendiente de completar con Flora Ibérica. |
| *Tilia platyphyllos* | autoctona | El tratamiento consultado de Flora Ibérica corresponde a la subsp. platyphyllos. · Faltan la descripción de flores y frutos: pendiente de completar con Flora Ibérica. |
| *Castanea sativa* | aloctona | Faltan la descripción de la floración por separado de la fructificación: pendiente de completar con Flora Ibérica. |
| *Sambucus nigra* | autoctona | Flora Ibérica advierte de que, por haber sido cultivada, en ocasiones es difícil establecer el origen (autóctono o cultivado) de las poblaciones ibéricas. |
| *Viola riviniana* | autoctona | Flora Ibérica no recoge nombres vernáculos de esta especie. · El color de la corola no figura en el extracto consultado: pendiente de completar con Flora Ibérica. · Sin nombre común verificado en las fuentes consultadas. |
| *Digitalis purpurea* | autoctona | Flora Ibérica no recoge nombres vernáculos de esta especie. · Faltan la descripción de las hojas y del fruto: pendiente de completar con Flora Ibérica. · Sin nombre común verificado en las fuentes consultadas. |
| *Primula vulgaris* | autoctona | El tratamiento de Flora Ibérica consultado corresponde a la subsp. vulgaris (subsp. acaulis en la clave); la otra subespecie (subsp. balearica, de flor blanca) es de Mallorca. · Faltan en la ficha la descripción de las hojas y los frutos: pendiente de completar con Flora Ibérica. |
| *Urtica dioica* | autoctona | Flora Ibérica no recoge nombres vernáculos de esta especie. · Sin nombre común verificado en las fuentes consultadas. |
| *Asplenium scolopendrium* | autoctona | Flora Ibérica lo trata con el nombre Phyllitis scolopendrium (L.) Newman; POWO (Kew) acepta Asplenium scolopendrium L. · El tratamiento consultado corresponde a la subsp. scolopendrium. |
| *Blechnum spicant* | autoctona | El tratamiento consultado de Flora Ibérica corresponde a la subsp. spicant. |
| *Polypodium vulgare* | autoctona | Diferencias con Polypodium cambricum (también en el catálogo) pendientes de documentar con Flora Ibérica. |
| *Osmunda regalis* | autoctona | Falta la fenología de las esporas: Flora Ibérica indica III-IX sin distinguir; pendiente de completar. |
| *Iris pseudacorus* | autoctona | Descripción tomada de Flora of North America (el tratamiento de Flora Ibérica no se ha localizado en el PDF del género consultado): pendiente de contrastar la fenología en la Península Ibérica. · Sin nombre común recogido en Flora Ibérica; pendiente. · Sin nombre común verificado en las fuentes consultadas. |
| *Phragmites australis* | autoctona | Descripción tomada de Flora of China (Flora Ibérica no tiene publicado el tratamiento de esta especie (gramíneas)): fenología y datos ibéricos pendientes de contrastar con una fuente peninsular. · Sin nombre común recogido en una fuente botánica: pendiente. · Sin nombre común verificado en las fuentes consultadas. |
| *Cornus sanguinea* | autoctona | El tratamiento consultado de Flora Ibérica corresponde a la subsp. sanguinea. · La distribución general en Europa y la descripción del fruto no se han recogido: pendiente de completar con Flora Ibérica. |
| *Hypericum androsaemum* | autoctona | El color de la flor no figura en el tratamiento consultado de Flora Ibérica: pendiente de completar. |
| *Ulex gallii* | autoctona | El color de la flor no figura en el tratamiento consultado de Flora Ibérica: pendiente de completar. · Flora Ibérica reconoce dos subespecies (una de ellas la subsp. gallii) y comenta que los ejemplares diploides deberían atribuirse a Ulex minor: subespecie presente en Cantabria pendiente de concretar. · Sin fotografías: ninguna de las fotos disponibles en iNaturalist cumplió los criterios de fiabilidad (o dejó dudas sobre la especie). |
| *Acer campestre* | autoctona | Falta en la ficha la descripción del fruto: pendiente de completar con Flora Ibérica. |
| *Smilax aspera* | autoctona | Faltan en la ficha el color y la forma del fruto: pendiente de completar con Flora Ibérica. |
| *Helleborus viridis* | autoctona | El tratamiento de Flora Ibérica consultado corresponde a la subsp. occidentalis; pendiente de confirmar la subespecie presente en Cantabria. |
| *Euphorbia amygdaloides* | autoctona | El tratamiento consultado de Flora Ibérica corresponde a la subsp. amygdaloides; pendiente de confirmar la subespecie en Cantabria. |
| *Arum italicum* | autoctona | Flora Ibérica no recoge nombres vernáculos de esta especie: el nombre común «aro» es de uso general y está pendiente de contrastar con una fuente. |
| *Pinguicula grandiflora* | autoctona | El tratamiento de Flora Ibérica consultado corresponde a la subsp. grandiflora. |
| *Daphne cneorum* | autoctona | Flora Ibérica no recoge nombres vernáculos: pendiente de contrastar el nombre común con una fuente. · Faltan en la ficha la descripción de las hojas y del fruto: pendiente de completar con Flora Ibérica. · Sin nombre común verificado en las fuentes consultadas. |
| *Polystichum setiferum* | autoctona | Diferencias con otros Polystichum (p. ej. P. aculeatum) pendientes de documentar con Flora Ibérica. |
| *Woodwardia radicans* | autoctona | Flora Ibérica no recoge nombres vernáculos: pendiente de contrastar el nombre común con una fuente. · Sin nombre común verificado en las fuentes consultadas. |
| *Polypodium cambricum* | autoctona | Diferencias con Polypodium vulgare (también en el catálogo) pendientes de documentar con Flora Ibérica. · Faltan la descripción del limbo y la época de fructificación: pendiente de completar con Flora Ibérica. |
| *Veronica persica* | aloctona | Faltan en la ficha la descripción del fruto y detalles del hábitat: pendiente de completar con Flora Ibérica. |
| *Pinus radiata* | aloctona | Sin fotografías: ninguna de las fotos disponibles en iNaturalist cumplió los criterios de fiabilidad (o dejó dudas sobre la especie). |
| *Quercus ilex* | autoctona | Flora Ibérica reconoce dos subespecies (subsp. ilex y subsp. ballota, esta última la encina del interior peninsular): en Cantabria consta la subsp. ilex. · Faltan la descripción de flores y frutos: pendiente de completar con Flora Ibérica. |
| *Primula veris* | autoctona | Flora Ibérica reconoce dos subespecies: subsp. columnae (citada en Santander) y subsp. veris (cita dudosa en Santander, «S?»): subespecie presente en Cantabria pendiente de concretar. |
| *Cymbalaria muralis* | aloctona | El tratamiento consultado de Flora Ibérica corresponde a la subsp. muralis. · Faltan la descripción del fruto: pendiente de completar con Flora Ibérica. |

## 7. Especies sin foto o con menos de 3 fotos

- *Viburnum lantana*: 2 foto(s)
- *Ulex gallii*: 0 foto(s)
- *Ulmus glabra*: 1 foto(s)
- *Acer campestre*: 2 foto(s)
- *Geranium robertianum*: 2 foto(s)
- *Euphorbia amygdaloides*: 1 foto(s)
- *Lythrum salicaria*: 1 foto(s)
- *Pinguicula grandiflora*: 2 foto(s)
- *Tofieldia calyculata*: 2 foto(s)
- *Prunus laurocerasus*: 2 foto(s)
- *Pinus radiata*: 0 foto(s)
- *Primula veris*: 2 foto(s)

## 8. Tabla de comprobación por especie

| Especie | Estatus | POWO (aceptado · familia · España) | Flora Ibérica (S) | LPES nativa | GBIF Cantabria / Ramales | Descripción de | Fotos |
|---|---|---|---|---|---|---|---|
| *Abutilon theophrasti* | alóctona | Abutilon theophrasti · Malvaceae · Introduced | naturalizada | no consta | 33 / 0 | Plan Cantabria | 5 |
| *Acacia dealbata* | invasora | Acacia dealbata · Fabaceae · Introduced | ausente | no consta | 65 / 1 | Plan Cantabria | 5 |
| *Acacia melanoxylon* | invasora | Acacia melanoxylon · Fabaceae · Introduced | naturalizada | no consta | 45 / 9 | Plan Cantabria | 5 |
| *Acanthus mollis* | alóctona | Acanthus mollis · Acanthaceae · Introduced | naturalizada | — | 98 / 10 | Plan Cantabria | 5 |
| *Agapanthus spp.* | alóctona | género | sin tratamiento | — | 6 / 0 | Plan Cantabria | 5 |
| *Agave americana* | invasora | Agave americana · Asparagaceae · Introduced | ausente | no consta | 27 / 0 | Plan Cantabria | 5 |
| *Ailanthus altissima* | invasora | Ailanthus altissima · Simaroubaceae · Introduced | naturalizada | — | 37 / 0 | Plan Cantabria | 5 |
| *Amaranthus deflexus* | alóctona | Amaranthus deflexus · Amaranthaceae · Introduced | material revisado | — | 7 / 0 | Plan Cantabria | 5 |
| *Ambrosia artemisiifolia* | invasora | Ambrosia artemisiifolia · Asteraceae · Introduced | sin tratamiento | no consta | 15 / 0 | Plan Cantabria | 5 |
| *Araujia sericifera* | invasora | Araujia sericifera · Apocynaceae · Introduced | naturalizada | — | 25 / 0 | Plan Cantabria | 5 |
| *Arctotheca calendula* | alóctona | Arctotheca calendula · Asteraceae · Introduced | sin tratamiento | — | 459 / 0 | Plan Cantabria | 5 |
| *Artemisia verlotiorum* | alóctona | Artemisia verlotiorum · Asteraceae · Introduced | sin tratamiento | no consta | 14 / 0 | Plan Cantabria | 5 |
| *Arundo donax* | alóctona | Arundo donax · Poaceae · Introduced | sin tratamiento | — | 20 / 1 | Plan Cantabria | 5 |
| *Symphyotrichum squamatum* | alóctona | Symphyotrichum squamatum · Asteraceae · Introduced | sin tratamiento | no consta | 25 / 0 | Plan Cantabria | 5 |
| *Azolla spp.* | invasora | género | sin tratamiento | — | 4 / 0 | Plan Cantabria | 5 |
| *Baccharis halimifolia* | invasora | Baccharis halimifolia · Asteraceae · Introduced | sin tratamiento | no consta | 272 / 0 | Plan Cantabria | 5 |
| *Bidens aurea* | alóctona | Bidens aurea · Asteraceae · Introduced | sin tratamiento | no consta | 250 / 3 | Plan Cantabria | 5 |
| *Bidens frondosa* | alóctona | Bidens frondosa · Asteraceae · Introduced | sin tratamiento | no consta | 1 / 0 | Plan Cantabria | 5 |
| *Bromus catharticus* | alóctona | Bromus catharticus · Poaceae · Introduced | sin tratamiento | no consta | 17 / 3 | Plan Cantabria | 5 |
| *Buddleja davidii* | invasora | Buddleja davidii · Scrophulariaceae · Introduced | naturalizada | no consta | 70 / 13 | Plan Cantabria | 5 |
| *Canna indica* | alóctona | Canna indica · Cannaceae · Introduced | ausente | no consta | 14 / 0 | Plan Cantabria | 5 |
| *Carpobrotus spp.* | invasora | género | ausente | no consta | 69 / 0 | Plan Cantabria | 5 |
| *Euphorbia polygonifolia* | alóctona | Euphorbia polygonifolia · Euphorbiaceae · Introduced | cita fiable | no consta | 6 / 0 | Plan Cantabria | 5 |
| *Erigeron spp. (grupo Conyza)* | alóctona | género | sin tratamiento | no consta | 127 / 11 | Plan Cantabria | 5 |
| *Lepidium didymum* | alóctona | Lepidium didymum · Brassicaceae · Introduced | material revisado | no consta | 33 / 2 | Plan Cantabria | 5 |
| *Cortaderia selloana* | invasora | Cortaderia selloana · Poaceae · Introduced | sin tratamiento | — | 235 / 9 | Plan Cantabria | 4 |
| *Cotula coronopifolia* | alóctona | Cotula coronopifolia · Asteraceae · Introduced | sin tratamiento | no consta | 70 / 0 | Plan Cantabria | 5 |
| *Crocosmia × crocosmiiflora* | alóctona | Crocosmia × crocosmiiflora · Iridaceae · Introduced | sin tratamiento | no consta | 87 / 18 | Plan Cantabria | 4 |
| *Cyperus alternifolius* | alóctona | Cyperus alternifolius · Cyperaceae · Introduced | sin tratamiento | no consta | 4 / 0 | Plan Cantabria | 5 |
| *Cyperus eragrostis* | alóctona | Cyperus eragrostis · Cyperaceae · Introduced | naturalizada | no consta | 123 / 10 | Plan Cantabria | 5 |
| *Datura stramonium* | alóctona | Datura stramonium · Solanaceae · Introduced | naturalizada | no consta | 141 / 6 | Plan Cantabria | 5 |
| *Dittrichia viscosa* | dudosa | Dittrichia viscosa · Asteraceae · Native | sin tratamiento | — | 18 / 2 | Plan Cantabria | 5 |
| *Pontederia crassipes* | invasora | Pontederia crassipes · Pontederiaceae · Introduced | ausente | — | 1 / 0 | Plan Cantabria | 5 |
| *Elodea canadensis* | invasora | Elodea canadensis · Hydrocharitaceae · Introduced | ausente | no consta | 1 / 0 | Plan Cantabria | 5 |
| *Erigeron karvinskianus* | alóctona | Erigeron karvinskianus · Asteraceae · Introduced | sin tratamiento | no consta | 209 / 28 | Plan Cantabria | 5 |
| *Fallopia baldschuanica* | invasora | Fallopia baldschuanica · Polygonaceae · Introduced | naturalizada | no consta | 13 / 0 | Plan Cantabria | 5 |
| *Helianthus tuberosus* | invasora | Helianthus tuberosus · Asteraceae · Introduced | sin tratamiento | no consta | 1 / 1 | Plan Cantabria | 5 |
| *Impatiens balfourii* | alóctona | Impatiens balfourii · Balsaminaceae · Introduced | naturalizada | no consta | 41 / 15 | Plan Cantabria | 5 |
| *Ipomoea spp.* | alóctona | género | sin tratamiento | no consta | 132 / 2 | Plan Cantabria | 5 |
| *Juncus tenuis* | alóctona | Juncus tenuis · Juncaceae · Introduced | naturalizada | no consta | 2 / 0 | Plan Cantabria | 5 |
| *Ligustrum ovalifolium* | alóctona | Ligustrum ovalifolium · Oleaceae · Introduced | naturalizada | no consta | 15 / 0 | Plan Cantabria | 5 |
| *Lonicera japonica* | alóctona | Lonicera japonica · Caprifoliaceae · Introduced | naturalizada | no consta | 54 / 6 | Plan Cantabria | 5 |
| *Ludwigia spp.* | invasora | género | sin tratamiento | — | 17 / 0 | Plan Cantabria | 5 |
| *Matthiola incana* | alóctona | Matthiola incana · Brassicaceae · Native | naturalizada | — | 41 / 0 | Plan Cantabria | 5 |
| *Mirabilis jalapa* | alóctona | Mirabilis jalapa · Nyctaginaceae · Introduced | ausente | — | 80 / 12 | Plan Cantabria | 5 |
| *Myriophyllum aquaticum* | invasora | Myriophyllum aquaticum · Haloragaceae · Introduced |  | no consta | 0 / 0 | Plan Cantabria | 5 |
| *Narcissus tazetta* | alóctona | Narcissus tazetta · Amaryllidaceae · Native | naturalizada | — | 20 / 0 | Plan Cantabria | 5 |
| *Nicotiana glauca* | alóctona | Nicotiana glauca · Solanaceae · Introduced | ausente | no consta | 2 / 0 | Plan Cantabria | 5 |
| *Oenothera spp.* | alóctona | género | sin tratamiento | no consta | 326 / 5 | Plan Cantabria | 5 |
| *Oxalis latifolia* | alóctona | Oxalis latifolia · Oxalidaceae · Introduced | naturalizada | no consta | 131 / 18 | Plan Cantabria | 5 |
| *Oxalis pes-caprae* | invasora | Oxalis pes-caprae · Oxalidaceae · Introduced | naturalizada | no consta | 77 / 0 | Plan Cantabria | 5 |
| *Parthenocissus tricuspidata* | alóctona | Parthenocissus tricuspidata · Vitaceae · Introduced | sin tratamiento | no consta | 4 / 0 | Plan Cantabria | 5 |
| *Paspalum dilatatum* | alóctona | Paspalum dilatatum · Poaceae · Introduced | sin tratamiento | no consta | 77 / 28 | Plan Cantabria | 5 |
| *Paspalum distichum* | alóctona | Paspalum distichum · Poaceae · Introduced | sin tratamiento | no consta | 18 / 2 | Plan Cantabria | 5 |
| *Paspalum vaginatum* | alóctona | Paspalum vaginatum · Poaceae · Introduced | sin tratamiento | no consta | 41 / 0 | Plan Cantabria | 5 |
| *Passiflora caerulea* | alóctona | Passiflora caerulea · Passifloraceae · Introduced | sin tratamiento | no consta | 537 / 20 | Plan Cantabria | 5 |
| *Phyllostachys aurea* | alóctona | Phyllostachys aurea · Poaceae · Introduced | sin tratamiento | no consta | 10 / 3 | Plan Cantabria | 5 |
| *Phytolacca americana* | alóctona | Phytolacca americana · Phytolaccaceae · Introduced | naturalizada | no consta | 6 / 0 | Plan Cantabria | 5 |
| *Pittosporum tobira* | alóctona | Pittosporum tobira · Pittosporaceae · Introduced | ausente | no consta | 883 / 6 | Plan Cantabria | 5 |
| *Pyracantha angustifolia* | alóctona | Pyracantha angustifolia · Rosaceae · Introduced | sin tratamiento | no consta | 1 / 0 | Plan Cantabria | 5 |
| *Reynoutria japonica* | invasora | Reynoutria japonica · Polygonaceae · Introduced | naturalizada | no consta | 68 / 33 | Plan Cantabria | 4 |
| *Rhus typhina* | alóctona | Rhus typhina · Anacardiaceae · Introduced | naturalizada | — | 2 / 0 | Plan Cantabria | 5 |
| *Robinia pseudoacacia* | alóctona | Robinia pseudoacacia · Fabaceae · Introduced | naturalizada | — | 102 / 19 | Plan Cantabria | 5 |
| *Senecio inaequidens* | invasora | Senecio inaequidens · Asteraceae · Introduced | sin tratamiento | no consta | 3 / 0 | Plan Cantabria | 5 |
| *Delairea odorata* | alóctona | Delairea odorata · Asteraceae · Introduced | sin tratamiento | — | 108 / 12 | Plan Cantabria | 5 |
| *Sorghum halepense* | alóctona | Sorghum halepense · Poaceae · Introduced | sin tratamiento | no consta | 5 / 0 | Plan Cantabria | 5 |
| *Sporobolus alterniflorus* | invasora | Sporobolus alterniflorus · Poaceae · Introduced | sin tratamiento | no consta | 15 / 0 | Plan Cantabria | 5 |
| *Sporobolus pumilus* | invasora | Sporobolus pumilus · Poaceae · Introduced | sin tratamiento | no consta | 0 / 0 | Plan Cantabria | 5 |
| *Sporobolus indicus* | alóctona | Sporobolus indicus · Poaceae · Introduced | sin tratamiento | no consta | 38 / 5 | Plan Cantabria | 5 |
| *Stenotaphrum secundatum* | alóctona | Stenotaphrum secundatum · Poaceae · Introduced | sin tratamiento | — | 97 / 0 | Plan Cantabria | 5 |
| *Tradescantia fluminensis* | invasora | Tradescantia fluminensis · Commelinaceae · Introduced | naturalizada | no consta | 131 / 12 | Plan Cantabria | 4 |
| *Tropaeolum majus* | alóctona | Tropaeolum majus · Tropaeolaceae · Introduced | naturalizada | — | 159 / 0 | Plan Cantabria | 5 |
| *Vinca major* | alóctona | Vinca major · Apocynaceae · Introduced | naturalizada | no consta | 79 / 2 | Plan Cantabria | 5 |
| *Xanthium strumarium* | autóctona | Xanthium strumarium · Asteraceae · Native | sin tratamiento | sí | 13 / 0 | Plan Cantabria | 5 |
| *Yucca gloriosa* | alóctona | Yucca gloriosa · Asparagaceae · Introduced | naturalizada | no consta | 6 / 0 | Plan Cantabria | 5 |
| *Zantedeschia aethiopica* | alóctona | Zantedeschia aethiopica · Araceae · Introduced | naturalizada | — | 194 / 13 | Plan Cantabria | 5 |
| *Quercus robur* | autóctona | Quercus robur · Fagaceae · Native | material revisado | sí | 837 / 85 | Flora Ibérica | 5 |
| *Quercus pyrenaica* | autóctona | Quercus pyrenaica · Fagaceae · Native | material revisado | sí | 651 / 14 | Flora Ibérica | 5 |
| *Fagus sylvatica* | autóctona | Fagus sylvatica · Fagaceae · Native | material revisado | — | 1276 / 44 | Flora Ibérica | 5 |
| *Betula pubescens* | autóctona | Betula pubescens · Betulaceae · Native | material revisado | — | 122 / 1 | Flora Ibérica | 5 |
| *Corylus avellana* | autóctona | Corylus avellana · Betulaceae · Native | material revisado | — | 1082 / 64 | Flora Ibérica | 5 |
| *Ilex aquifolium* | autóctona | Ilex aquifolium · Aquifoliaceae · Native | material revisado | — | 1045 / 134 | Flora Ibérica | 5 |
| *Taxus baccata* | autóctona | Taxus baccata · Taxaceae · Native | material revisado | — | 89 / 30 | Flora Ibérica | 5 |
| *Alnus glutinosa* | autóctona | Alnus glutinosa · Betulaceae · Native | material revisado | sí | 433 / 31 | Flora Ibérica | 5 |
| *Fraxinus excelsior* | autóctona | Fraxinus excelsior · Oleaceae · Native | material revisado | sí | 297 / 23 | Flora Ibérica | 5 |
| *Salix atrocinerea* | autóctona | Salix atrocinerea · Salicaceae · Native | material revisado | no consta | 327 / 29 | Flora Ibérica | 5 |
| *Arbutus unedo* | autóctona | Arbutus unedo · Ericaceae · Native | material revisado | — | 330 / 34 | Flora Ibérica | 5 |
| *Ulex europaeus* | autóctona | Ulex europaeus · Fabaceae · Native | material revisado | — | 265 / 2 | Flora Ibérica | 5 |
| *Cytisus scoparius* | autóctona | Cytisus scoparius · Fabaceae · Native | material revisado | — | 37 / 1 | Flora Ibérica | 5 |
| *Erica vagans* | autóctona | Erica vagans · Ericaceae · Native | material revisado | no consta | 1281 / 53 | Flora Ibérica | 5 |
| *Erica cinerea* | autóctona | Erica cinerea · Ericaceae · Native | material revisado | no consta | 873 / 53 | Flora Ibérica | 5 |
| *Calluna vulgaris* | autóctona | Calluna vulgaris · Ericaceae · Native | material revisado | — | 599 / 33 | Flora Ibérica | 5 |
| *Rubus ulmifolius* | autóctona | Rubus ulmifolius · Rosaceae · absent | material revisado | sí | 357 / 25 | Flora Ibérica | 5 |
| *Hedera spp.* | autóctona | género | material revisado | — | 398 / 27 | Flora Ibérica | 5 |
| *Pteridium aquilinum* | autóctona | Pteridium aquilinum · Dennstaedtiaceae · Native | material revisado | — | 535 / 36 | Flora Ibérica | 5 |
| *Laurus nobilis* | dudosa | Laurus nobilis · Lauraceae · Introduced | material revisado | — | 636 / 23 | Flora Ibérica | 5 |
| *Prunus spinosa* | autóctona | Prunus spinosa · Rosaceae · Native | material revisado | no consta | 430 / 28 | Flora Ibérica | 5 |
| *Crataegus monogyna* | autóctona | Crataegus monogyna · Rosaceae · Native | material revisado | — | 536 / 41 | Flora Ibérica | 5 |
| *Sorbus aucuparia* | autóctona | Sorbus aucuparia · Rosaceae · Native | material revisado | — | 108 / 0 | Flora Ibérica | 5 |
| *Ruscus aculeatus* | autóctona | Ruscus aculeatus · Asparagaceae · Native | material revisado | — | 745 / 69 | Flora Ibérica | 5 |
| *Daboecia cantabrica* | autóctona | Daboecia cantabrica · Ericaceae · Native | material revisado | — | 1520 / 93 | Flora Ibérica | 5 |
| *Genista florida* | autóctona | Genista florida · Fabaceae · Native | material revisado | — | 216 / 0 | Flora Ibérica | 5 |
| *Eucalyptus globulus* | alóctona | Eucalyptus globulus · Myrtaceae · Introduced | naturalizada | — | 366 / 32 | Flora Ibérica | 5 |
| *Platanus × hispanica* | alóctona | Platanus × hispanica · Platanaceae · absent | material revisado | — | 14 / 0 | Flora Ibérica | 5 |
| *Populus nigra* | dudosa | Populus nigra · Salicaceae · Native | naturalizada | sí | 69 / 6 | Flora Ibérica | 5 |
| *Salix caprea* | autóctona | Salix caprea · Salicaceae · Native | material revisado | no consta | 35 / 2 | Flora Ibérica | 5 |
| *Viburnum tinus* | autóctona | Viburnum tinus · Viburnaceae · Native | material revisado | — | 70 / 2 | Flora Ibérica | 5 |
| *Frangula alnus* | autóctona | Frangula alnus · Rhamnaceae · Native | material revisado | — | 110 / 7 | Flora Ibérica | 5 |
| *Rosa canina* | autóctona | Rosa canina · Rosaceae · Native | material revisado | sí | 83 / 15 | Flora Ibérica | 5 |
| *Lonicera periclymenum* | autóctona | Lonicera periclymenum · Caprifoliaceae · Native | material revisado | no consta | 280 / 26 | Flora Ibérica | 5 |
| *Vaccinium myrtillus* | autóctona | Vaccinium myrtillus · Ericaceae · Native | material revisado | — | 463 / 7 | Flora Ibérica | 5 |
| *Rhamnus alaternus* | autóctona | Rhamnus alaternus · Rhamnaceae · Native | material revisado | sí | 575 / 21 | Flora Ibérica | 5 |
| *Buxus sempervirens* | dudosa | Buxus sempervirens · Buxaceae · Native | ausente | — | 25 / 2 | Flora Ibérica | 5 |
| *Acer pseudoplatanus* | autóctona | Acer pseudoplatanus · Sapindaceae · Native | material revisado | sí | 147 / 5 | Flora Ibérica | 5 |
| *Tilia platyphyllos* | autóctona | Tilia platyphyllos · Malvaceae · Native | material revisado | — | 34 / 2 | Flora Ibérica | 5 |
| *Castanea sativa* | alóctona | Castanea sativa · Fagaceae · Introduced | naturalizada | no consta | 453 / 44 | Flora Ibérica | 5 |
| *Sambucus nigra* | autóctona | Sambucus nigra · Viburnaceae · Native | material revisado | sí | 291 / 4 | Flora Ibérica | 5 |
| *Viola riviniana* | autóctona | Viola riviniana · Violaceae · Native | material revisado | sí | 126 / 9 | Flora Ibérica | 5 |
| *Digitalis purpurea* | autóctona | Digitalis purpurea · Plantaginaceae · Native | material revisado | — | 180 / 5 | Flora Ibérica | 5 |
| *Primula vulgaris* | autóctona | Primula vulgaris · Primulaceae · Native | material revisado | — | 215 / 9 | Flora Ibérica | 5 |
| *Urtica dioica* | autóctona | Urtica dioica · Urticaceae · Native | material revisado | — | 418 / 16 | Flora Ibérica | 5 |
| *Asplenium scolopendrium* | autóctona | Asplenium scolopendrium · Aspleniaceae · Native | material revisado | — | 264 / 42 | Flora Ibérica | 5 |
| *Blechnum spicant* | autóctona | Blechnum spicant · Aspleniaceae · Native | material revisado | — | 313 / 31 | Flora Ibérica | 5 |
| *Polypodium vulgare* | autóctona | Polypodium vulgare · Polypodiaceae · Native | material revisado | — | 97 / 2 | Flora Ibérica | 5 |
| *Osmunda regalis* | autóctona | Osmunda regalis · Osmundaceae · Native | material revisado | — | 95 / 19 | Flora Ibérica | 5 |
| *Ranunculus repens* | autóctona | Ranunculus repens · Ranunculaceae · Native | material revisado | sí | 169 / 8 | Flora Ibérica | 5 |
| *Iris pseudacorus* | autóctona | Iris pseudacorus · Iridaceae · Native | sin tratamiento | no consta | 126 / 0 | Flora of North America | 5 |
| *Typha latifolia* | autóctona | Typha latifolia · Typhaceae · Native | material revisado | sí | 34 / 0 | Flora Ibérica | 5 |
| *Phragmites australis* | autóctona | Phragmites australis · Poaceae · Native | sin tratamiento | — | 113 / 0 | Flora of China | 5 |
| *Cornus sanguinea* | autóctona | Cornus sanguinea · Cornaceae · Native | material revisado | sí | 396 / 38 | Flora Ibérica | 5 |
| *Euonymus europaeus* | autóctona | Euonymus europaeus · Celastraceae · Native | material revisado | no consta | 210 / 25 | Flora Ibérica | 5 |
| *Rubus idaeus* | autóctona | Rubus idaeus · Rosaceae · Native | material revisado | no consta | 15 / 24 | Flora Ibérica | 5 |
| *Viburnum lantana* | autóctona | Viburnum lantana · Viburnaceae · Native | material revisado | — | 165 / 13 | Flora Ibérica | 2 |
| *Ligustrum vulgare* | autóctona | Ligustrum vulgare · Oleaceae · Native | material revisado | sí | 201 / 11 | Flora Ibérica | 4 |
| *Erica arborea* | autóctona | Erica arborea · Ericaceae · Native | material revisado | no consta | 395 / 30 | Flora Ibérica | 3 |
| *Hypericum androsaemum* | autóctona | Hypericum androsaemum · Hypericaceae · Native | material revisado | sí | 702 / 78 | Flora Ibérica | 4 |
| *Ulex gallii* | autóctona | Ulex gallii · Fabaceae · Native | material revisado | — | 264 / 22 | Flora Ibérica | 0 |
| *Daphne laureola* | autóctona | Daphne laureola · Thymelaeaceae · Native | material revisado | — | 277 / 16 | Flora Ibérica | 4 |
| *Ulmus glabra* | autóctona | Ulmus glabra · Ulmaceae · Native | material revisado | sí | 93 / 6 | Flora Ibérica | 1 |
| *Acer campestre* | autóctona | Acer campestre · Sapindaceae · Native | material revisado | sí | 245 / 25 | Flora Ibérica | 2 |
| *Smilax aspera* | autóctona | Smilax aspera · Smilacaceae · Native | material revisado | — | 775 / 46 | Flora Ibérica | 3 |
| *Clematis vitalba* | autóctona | Clematis vitalba · Ranunculaceae · Native | material revisado | no consta | 396 / 22 | Flora Ibérica | 4 |
| *Dioscorea communis* | autóctona | Dioscorea communis · Dioscoreaceae · Native | material revisado | no consta | 351 / 24 | Flora Ibérica | 4 |
| *Hepatica nobilis* | autóctona | Hepatica nobilis · Ranunculaceae · Native | material revisado | — | 219 / 24 | Flora Ibérica | 4 |
| *Helleborus viridis* | autóctona | Helleborus viridis · Ranunculaceae · Native | material revisado | — | 194 / 23 | Flora Ibérica | 4 |
| *Geranium robertianum* | autóctona | Geranium robertianum · Geraniaceae · Native | material revisado | sí | 355 / 34 | Flora Ibérica | 2 |
| *Teucrium scorodonia* | autóctona | Teucrium scorodonia · Lamiaceae · Native | material revisado | — | 270 / 26 | Flora Ibérica | 4 |
| *Euphorbia amygdaloides* | autóctona | Euphorbia amygdaloides · Euphorbiaceae · Native | material revisado | sí | 190 / 22 | Flora Ibérica | 1 |
| *Mercurialis perennis* | autóctona | Mercurialis perennis · Euphorbiaceae · Native | material revisado | — | 67 / 12 | Flora Ibérica | 4 |
| *Oxalis acetosella* | autóctona | Oxalis acetosella · Oxalidaceae · Native | material revisado | no consta | 185 / 15 | Flora Ibérica | 3 |
| *Lathraea clandestina* | autóctona | Lathraea clandestina · Orobanchaceae · Native | material revisado | — | 206 / 20 | Flora Ibérica | 4 |
| *Arum italicum* | autóctona | Arum italicum · Araceae · Native | material revisado | — | 294 / 26 | Flora Ibérica | 4 |
| *Lythrum salicaria* | autóctona | Lythrum salicaria · Lythraceae · Native | material revisado | no consta | 248 / 9 | Flora Ibérica | 1 |
| *Pinguicula grandiflora* | autóctona | Pinguicula grandiflora · Lentibulariaceae · Native | material revisado | — | 165 / 9 | Flora Ibérica | 2 |
| *Tofieldia calyculata* | autóctona | Tofieldia calyculata · Tofieldiaceae · Native | material revisado | — | 75 / 34 | Flora Ibérica | 2 |
| *Daphne cneorum* | autóctona | Daphne cneorum · Thymelaeaceae · Native | material revisado | — | 164 / 72 | Flora Ibérica | 3 |
| *Polystichum setiferum* | autóctona | Polystichum setiferum · Polypodiaceae · Native | material revisado | — | 322 / 49 | Flora Ibérica | 3 |
| *Woodwardia radicans* | autóctona | Woodwardia radicans · Aspleniaceae · Native | material revisado | — | 151 / 42 | Flora Ibérica | 4 |
| *Dryopteris filix-mas* | autóctona | Dryopteris filix-mas · Polypodiaceae · Native | material revisado | — | 72 / 9 | Flora Ibérica | 5 |
| *Athyrium filix-femina* | autóctona | Athyrium filix-femina · Aspleniaceae · Native | material revisado | — | 142 / 11 | Flora Ibérica | 5 |
| *Adiantum capillus-veneris* | autóctona | Adiantum capillus-veneris · Pteridaceae · Native | material revisado | sí | 152 / 14 | Flora Ibérica | 5 |
| *Polypodium cambricum* | autóctona | Polypodium cambricum · Polypodiaceae · Native | material revisado | — | 191 / 17 | Flora Ibérica | 5 |
| *Equisetum telmateia* | autóctona | Equisetum telmateia · Equisetaceae · Native | material revisado | — | 370 / 10 | Flora Ibérica | 5 |
| *Prunus laurocerasus* | alóctona | Prunus laurocerasus · Rosaceae · Introduced | naturalizada | no consta | 279 / 20 | Flora Ibérica | 2 |
| *Veronica persica* | alóctona | Veronica persica · Plantaginaceae · Introduced | material revisado | no consta | 178 / 20 | Flora Ibérica | 4 |
| *Pinus radiata* | alóctona | Pinus radiata · Pinaceae · Introduced | naturalizada | — | 150 / 19 | Flora Ibérica | 0 |
| *Juglans regia* | alóctona | Juglans regia · Juglandaceae · Introduced | naturalizada | — | 500 / 31 | Flora Ibérica | 3 |
| *Quercus ilex* | autóctona | Quercus ilex · Fagaceae · Native | material revisado | sí | 594 / 50 | Flora Ibérica | 3 |
| *Origanum vulgare* | autóctona | Origanum vulgare · Lamiaceae · Native | material revisado | — | 132 / 21 | Flora Ibérica | 3 |
| *Angelica sylvestris* | autóctona | Angelica sylvestris · Apiaceae · Native | material revisado | sí | 289 / 12 | Flora Ibérica | 3 |
| *Primula veris* | autóctona | Primula veris · Primulaceae · Native | material revisado | — | 134 / 6 | Flora Ibérica | 2 |
| *Cymbalaria muralis* | alóctona | Cymbalaria muralis · Plantaginaceae · Introduced | naturalizada | — | 450 / 56 | Flora Ibérica | 4 |
