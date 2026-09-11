// ================================================================
// Catálogo Español de Especies Exóticas Invasoras (CEEEI) — Flora
// Fuente oficial: MITECO (Ministerio para la Transición Ecológica
// y el Reto Demográfico).
// https://www.miteco.gob.es/es/biodiversidad/temas/conservacion-de-especies/especies-exoticas-invasoras/ce_eei_flora.html
//
// Los campos cientifico / autoridad / comunes / ambito / ficha están
// tomados literalmente de la tabla oficial publicada por el MITECO
// (consultada en septiembre de 2026). No se ha añadido ninguna
// descripción inventada: cuando el MITECO no publica más datos que
// el nombre y el enlace a la ficha, esta lista tampoco los inventa.
//
// El campo `acuatica` no es una categoría oficial del MITECO: es una
// clasificación editorial de esta aplicación basada en el hábitat
// acuático bien conocido de esos géneros (varios de ellos lo indican
// en su propio nombre común oficial: "de agua", "acuática"...), para
// facilitar el filtrado. No afecta a ningún otro dato de la ficha.
// ================================================================
export const CATALOGO_FLORA = [
  { id: 'acacia-dealbata', cientifico: 'Acacia dealbata', autoridad: 'Link', comunes: ['Mimosa', 'acacia', 'acacia francesa'], ambito: 'Excepto Canarias y Baleares', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/acaciadealbatalink_tcm30-439582.pdf', acuatica: false },
  { id: 'acacia-farnesiana', cientifico: 'Acacia farnesiana', autoridad: '(L.) Willd', comunes: ['Acacia', 'aromo', 'carambuco', 'mimosa'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/acaciafarnesianalwilld_tcm30-439601.pdf', acuatica: false },
  { id: 'acacia-melanoxylon', cientifico: 'Acacia melanoxylon', autoridad: 'Robert Brown, 1813', comunes: ['Acacia negra'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/mtjacaciamelanoxylon_tcm30-201334.pdf', acuatica: false },
  { id: 'acacia-salicina', cientifico: 'Acacia salicina', autoridad: 'Lindl', comunes: ['Acacia de hoja de sauce'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/acaciasalicinalindl_tcm30-439566.pdf', acuatica: false },
  { id: 'agave-americana', cientifico: 'Agave americana', autoridad: 'L', comunes: ['Pitera común'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/agaveamericanal_tcm30-439602.pdf', acuatica: false },
  { id: 'ageratina-adenophora', cientifico: 'Ageratina adenophora', autoridad: '(Spreng.) King & H. Rob', comunes: ['Matoespuma'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/ageratinaadenophorasprengkinghrob_tcm30-439604.pdf', acuatica: false },
  { id: 'ageratina-riparia', cientifico: 'Ageratina riparia', autoridad: '(Regel) R.M.King & H.Rob.,', comunes: ['Matoespuma fino'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/ageratinaripariaregelrmkinghrob_tcm30-439606.pdf', acuatica: false },
  { id: 'ailanthus-altissima', cientifico: 'Ailanthus altissima', autoridad: '(Miller) Swingle', comunes: ['Ailanto', 'árbol del cielo', 'zumaque falso'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/ailanthusaltissimamillswingle_tcm30-439565.pdf', acuatica: false },
  { id: 'alternanthera-philoxeroides', cientifico: 'Alternanthera philoxeroides', autoridad: '(Mart.) Griseb.,', comunes: ['Lagunilla', 'hierba del lagarto', 'huiro verde'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/alternantheraphiloxeroidesmartgriseb_tcm30-439619.pdf', acuatica: false },
  { id: 'ambrosia-artemisiifolia', cientifico: 'Ambrosia artemisiifolia', autoridad: 'L', comunes: ['Ambrosia'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/ambrosiaartemisiifolial_tcm30-439620.pdf', acuatica: false },
  { id: 'araujia-sericifera', cientifico: 'Araujia sericifera', autoridad: 'Brot', comunes: ['Planta cruel', 'miraguano'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/araujiasericiferabrot_tcm30-439622.pdf', acuatica: false },
  { id: 'arbutus-unedo', cientifico: 'Arbutus unedo', autoridad: 'L', comunes: ['Madroño'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/arbutusunedol_tcm30-439624.pdf', acuatica: false },
  { id: 'arundo-donax', cientifico: 'Arundo donax', autoridad: 'L', comunes: ['Caña', 'cañavera', 'bardiza', 'caña silvestre'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/arundodonaxl_tcm30-439625.pdf', acuatica: false },
  { id: 'asparagus-asparagoides', cientifico: 'Asparagus asparagoides', autoridad: '(L.) Druce', comunes: ['Esparraguera africana'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/asparagusasparagoidesldruce_tcm30-439628.pdf', acuatica: false },
  { id: 'atriplex-semilunaris', cientifico: 'Atriplex semilunaris', autoridad: 'Aellen', comunes: ['Amuelle'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/atriplexsemilunarisaellen_tcm30-439629.pdf', acuatica: false },
  { id: 'azolla-spp', cientifico: 'Azolla spp.', autoridad: '', comunes: ['Azolla'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/azollaspp_tcm30-439630.pdf', acuatica: true },
  { id: 'baccharis-halimifolia', cientifico: 'Baccharis halimifolia', autoridad: 'L', comunes: ['Bácaris', 'chilca', 'chilca de hoja de orzaga', 'carqueja'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/baccharishalimifolial_tcm30-439632.pdf', acuatica: false },
  { id: 'buddleja-davidii', cientifico: 'Buddleja davidii', autoridad: 'Franchet', comunes: ['Budleya', 'baileya', 'arbusto de las mariposas'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/buddlejadavidiifranchet_tcm30-439567.pdf', acuatica: false },
  { id: 'cabomba-caroliniana', cientifico: 'Cabomba caroliniana', autoridad: 'Gray', comunes: ['Ortiga acuática'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/cabombacarolinianagray_tcm30-439568.pdf', acuatica: true },
  { id: 'calotropis-procera', cientifico: 'Calotropis procera', autoridad: '(Aiton) W.T.Aiton', comunes: ['Algodón de seda'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/calotropisproceraaitonwtaiton_tcm30-439651.pdf', acuatica: false },
  { id: 'carpobrotus-acinaciformis', cientifico: 'Carpobrotus acinaciformis', autoridad: '(L.) L. Bolus', comunes: ['Hierba del cuchillo', 'uña de gato', 'uña de león'], ambito: 'Excepto Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/carpobrotusacinaciformisllbolus_tcm30-439652.pdf', acuatica: false },
  { id: 'carpobrotus-edulis', cientifico: 'Carpobrotus edulis', autoridad: '(L.) N.E. Br', comunes: ['Hierba del cuchillo', 'uña de gato', 'uña de león'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/carpobrotusedulislnebr_tcm30-439569.pdf', acuatica: false },
  { id: 'cenchrus-setaceus', cientifico: 'Cenchrus setaceus', autoridad: '(Forssk.) Morrone (=Pennisetum setaceum (Forssk) Chiov.)', comunes: ['Plumero', 'rabogato', 'pasto de elefante'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/pennisetumsetaceumforsskchiov_tcm30-439715.pdf', acuatica: false },
  { id: 'centranthus-ruber', cientifico: 'Centranthus ruber', autoridad: '(L.) DC', comunes: ['Hierba de San Jorge'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/Centranthus_ruber_2013_tcm30-69819.pdf', acuatica: false },
  { id: 'cortaderia-spp', cientifico: 'Cortaderia spp.', autoridad: '', comunes: ['Hierba de la pampa', 'plumero'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/cortaderiaspp_tcm30-439658.pdf', acuatica: false },
  { id: 'cotula-coronopifolia', cientifico: 'Cotula coronopifolia', autoridad: 'L', comunes: ['Cotula'], ambito: 'Baleares', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/cotulacoronopifolial_tcm30-439659.pdf', acuatica: false },
  { id: 'crassula-helmsii', cientifico: 'Crassula helmsii', autoridad: '(Kirk) Cockayne', comunes: [], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/crassulahelmsiikirkcockayne_tcm30-439570.pdf', acuatica: true },
  { id: 'cylindropuntia-spp', cientifico: 'Cylindropuntia spp.', autoridad: '', comunes: ['Cylindropuntia'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/cylindropuntiasppengelmfmknuth_tcm30-439572.pdf', acuatica: false },
  { id: 'cyrtomium-falcatum', cientifico: 'Cyrtomium falcatum', autoridad: '(L. f.) C. Presl', comunes: ['Helecho acebo'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/cyrtomiumfalcatumlfcpresl_tcm30-439681.pdf', acuatica: false },
  { id: 'cytisus-scoparius', cientifico: 'Cytisus scoparius', autoridad: '(L.) Link', comunes: ['Escoba negra'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/cytisusscopariusllink_tcm30-439683.pdf', acuatica: false },
  { id: 'egeria-densa', cientifico: 'Egeria densa', autoridad: 'Planch', comunes: ['Elodea densa'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/fichadescriptivaegeriadensa_tcm30-439684.pdf', acuatica: true },
  { id: 'eichhornia-crassipes', cientifico: 'Eichhornia crassipes', autoridad: '(Mart.) Solms. (= Pontederia crassipes Mart.)', comunes: ['Jacinto de agua', 'camalote'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/eichhorniacrassipesmartsolms_tcm30-439685.pdf', acuatica: true },
  { id: 'elodea-canadensis', cientifico: 'Elodea canadensis', autoridad: 'Michx', comunes: ['Broza del Canadá', 'peste de agua'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/elodeacanadensismichx_tcm30-439571.pdf', acuatica: true },
  { id: 'elodea-nuttallii', cientifico: 'Elodea nuttallii', autoridad: '(Planch.) H. St. John', comunes: ['Broza del Canadá', 'peste de agua'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/elodeanuttalliiplanchhstjohn_tcm30-439574.pdf', acuatica: true },
  { id: 'eschscholzia-californica', cientifico: 'Eschscholzia californica', autoridad: 'Champ', comunes: ['Amapola de California', 'Dedal de oro'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/eschscholziacalifornicachamp_tcm30-439687.pdf', acuatica: false },
  { id: 'fallopia-baldschuanica', cientifico: 'Fallopia baldschuanica', autoridad: '(Regel) Holub. (= Reynoutria baldschuanica Houtt.)', comunes: ['Viña del Tíbet'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/fallopiabaldschuanicaregeljholub_tcm30-439573.pdf', acuatica: false },
  { id: 'fallopia-japonica', cientifico: 'Fallopia japonica', autoridad: '(Houtt.) (= Reynoutria japonica Houtt.)', comunes: ['Hierba nudosa japonesa'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/fallopiajaponicahoutt_tcm30-439576.pdf', acuatica: false },
  { id: 'furcraea-foetida', cientifico: 'Furcraea foetida', autoridad: '(L.) Haw', comunes: ['Pitera abierta'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/furcraeafoetidalhaw_tcm30-439691.pdf', acuatica: false },
  { id: 'hedychium-gardnerianum', cientifico: 'Hedychium gardnerianum', autoridad: 'Shepard ex Ker Gawl', comunes: ['Jengibre blanco'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/hedychiumgardnerianumsheppardexkergawl1824_tcm30-439575.pdf', acuatica: false },
  { id: 'helianthus-tuberosus', cientifico: 'Helianthus tuberosus', autoridad: 'L', comunes: ['Pataca', 'tupinabo'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/mtjhelianthustuberosus_tcm30-201382.pdf', acuatica: false },
  { id: 'heracleum-mantegazzianum', cientifico: 'Heracleum mantegazzianum', autoridad: 'Somm. & Lev', comunes: ['Perejil gigante'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/heracleummantegazzianumsommlev_tcm30-439692.pdf', acuatica: false },
  { id: 'hydrocotyle-ranunculoides', cientifico: 'Hydrocotyle ranunculoides', autoridad: 'L. f', comunes: ['Redondita de agua'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/hydrocotyleranunculoideslf_tcm30-439694.pdf', acuatica: true },
  { id: 'ipomoea-indica', cientifico: 'Ipomoea indica', autoridad: '(Burn)', comunes: ['Campanilla morada', 'batatilla de Indias'], ambito: 'Baleares y Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/ipomoeaindicaburn_tcm30-439695.pdf', acuatica: false },
  { id: 'leucaena-leucocephala', cientifico: 'Leucaena leucocephala', autoridad: '(Lam.) De wit', comunes: ['Aromo blanco'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/leucaenaleucocephalalamdewit_tcm30-439696.pdf', acuatica: false },
  { id: 'ludwigia-spp', cientifico: 'Ludwigia spp.', autoridad: '(Excepto L. palustris (L.) Elliott)', comunes: ['Duraznillo de agua'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/ludwigiaspp_tcm30-439699.pdf', acuatica: true },
  { id: 'maireana-brevifolia', cientifico: 'Maireana brevifolia', autoridad: '(R.Br.) P.G. Wilson', comunes: ['Mato azul'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/maireanabrevifoliarbrpgwilson_tcm30-439577.pdf', acuatica: false },
  { id: 'myoporum-laetum', cientifico: 'Myoporum laetum', autoridad: 'G. Forst', comunes: ['Mioporo', 'siempreverde', 'gandul'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/especies-exoticas-invasoras/flora/mtj-myoporumlaetum-09012025.pdf', acuatica: false },
  { id: 'myriophyllum-aquaticum', cientifico: 'Myriophyllum aquaticum', autoridad: '(Vell.) Verdc', comunes: [], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/myriophyllumaquaticumvellverdc_tcm30-439579.pdf', acuatica: true },
  { id: 'nassella-neesiana', cientifico: 'Nassella neesiana', autoridad: '(Trin, & Rupr.) Barkworth', comunes: ['Flechilla'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/nassellaneesianatrinruprbarkworth_tcm30-439700.pdf', acuatica: false },
  { id: 'nicotiana-glauca', cientifico: 'Nicotiana glauca', autoridad: 'Graham', comunes: ['Tabaco moruno'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/mtjnicotianaglauca_tcm30-69843.pdf', acuatica: false },
  { id: 'nymphaea-mexicana', cientifico: 'Nymphaea mexicana', autoridad: 'Zucc', comunes: ['Lirio amarillo'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/nymphaeamexicanazucc_tcm30-439704.pdf', acuatica: true },
  { id: 'opuntia-dillenii', cientifico: 'Opuntia dillenii', autoridad: '(Ker-Gawler) Haw', comunes: ['Tunera india'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/opuntiadilleniiker-gawlerhaw_tcm30-439705.pdf', acuatica: false },
  { id: 'opuntia-maxima', cientifico: 'Opuntia maxima', autoridad: 'Miller', comunes: ['Tunera común'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/opuntiamaximamiller_tcm30-439708.pdf', acuatica: false },
  { id: 'opuntia-stricta', cientifico: 'Opuntia stricta', autoridad: '(Haw.)', comunes: ['Chumbera'], ambito: 'Excepto Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/opuntiastrictahaw_tcm30-439710.pdf', acuatica: false },
  { id: 'oxalis-pes-caprae', cientifico: 'Oxalis pes-caprae', autoridad: 'L', comunes: ['Agrio', 'agrios', 'vinagrera', 'vinagreras'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/oxalispes-caprael_tcm30-439711.pdf', acuatica: false },
  { id: 'pennisetum-clandestinum', cientifico: 'Pennisetum clandestinum', autoridad: 'Hochst. ex Chiov. (= Cenchrus clandestinus (Hochst. ex Chiov.) Morrone)', comunes: ['Quicuyo'], ambito: 'Canarias y Baleares', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/pennisetumclandestinumhochstexchiov_tcm30-439714.pdf', acuatica: false },
  { id: 'pennisetum-purpureum', cientifico: 'Pennisetum purpureum', autoridad: 'Schum. (= Cenchrus purpureus (Schumach.) Morrone)', comunes: ['Pasto de elefante'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/pennisetumpurpureumschum_tcm30-439578.pdf', acuatica: false },
  { id: 'pennisetum-villosum', cientifico: 'Pennisetum villosum', autoridad: 'R. Br. ex Fresen (= Cenchrus longisetus M.C. Johnst.)', comunes: ['Rabogato albino'], ambito: 'Baleares', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/pennisetumvillosumrbrexfresen_tcm30-439717.pdf', acuatica: false },
  { id: 'phoenix-dactylifera', cientifico: 'Phoenix dactylifera', autoridad: 'L', comunes: ['Palmera datilera'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/phoenixdactyliferal_tcm30-439718.pdf', acuatica: false },
  { id: 'pistia-stratiotes', cientifico: 'Pistia stratiotes', autoridad: 'L. Royle', comunes: ['Lechuga de agua'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/pistiastratioteslroyle_tcm30-439719.pdf', acuatica: true },
  { id: 'ricinus-communis', cientifico: 'Ricinus communis', autoridad: 'L', comunes: ['Tartaguero'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/ricinuscommunisl_tcm30-439720.pdf', acuatica: false },
  { id: 'salvinia-spp', cientifico: 'Salvinia spp.', autoridad: '', comunes: ['Salvinia'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/salviniaspp_tcm30-439722.pdf', acuatica: true },
  { id: 'senecio-inaequidens', cientifico: 'Senecio inaequidens', autoridad: 'DC', comunes: ['Senecio del Cabo'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/senecioinaequidensdc_tcm30-439723.pdf', acuatica: false },
  { id: 'spartina-alterniflora', cientifico: 'Spartina alterniflora', autoridad: 'Loisel', comunes: ['Borraza'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/spartinaalternifloraloisel_tcm30-439580.pdf', acuatica: false },
  { id: 'spartina-densiflora', cientifico: 'Spartina densiflora', autoridad: 'Brongn', comunes: ['Espartillo'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/spartinadensiflorabrongn_tcm30-439730.pdf', acuatica: false },
  { id: 'spartina-patens', cientifico: 'Spartina patens', autoridad: '(Ait.) Muhl', comunes: [], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/spartinapatensaitmuhl_tcm30-439731.pdf', acuatica: false },
  { id: 'spartium-junceum', cientifico: 'Spartium junceum', autoridad: 'L', comunes: ['Retama de olor'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/spartiumjunceuml_tcm30-439735.pdf', acuatica: false },
  { id: 'tradescantia-fluminensis', cientifico: 'Tradescantia fluminensis', autoridad: 'Velloso', comunes: ['Amor de hombre', 'oreja de gato'], ambito: '', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/tradescantiafluminensisvelloso_tcm30-439581.pdf', acuatica: false },
  { id: 'ulex-europaeus', cientifico: 'Ulex europaeus', autoridad: 'L', comunes: ['Tojo'], ambito: 'Canarias', ficha: 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/ulexeuropaeusl_tcm30-439738.pdf', acuatica: false },
];

// ----------------------------------------------------------------
// Resúmenes ampliados — SOLO para las especies con foto propia.
// Son un resumen (no una copia literal) de la ficha oficial del
// MITECO enlazada en cada caso; el botón "Consultar ficha oficial"
// de cada especie lleva siempre al PDF original del MITECO.
// El resto del catálogo no incluye descripción propia: se enlaza
// directamente a su ficha oficial para no inventar contenido.
// ----------------------------------------------------------------
export const FICHAS_AMPLIADAS = {
  'cortaderia-spp': {
    descripcion: 'Gramínea perenne de gran tamaño (hasta 4 m), formada por matas robustas de hojas largas y cortantes, muy conocida por su vistosa inflorescencia plumosa, blanca o rosada.',
    impacto: 'Desplaza a la vegetación autóctona de riberas, dunas y marismas e impide su regeneración; sus hojas cortantes pueden dañar a la fauna. Cada planta puede producir más de un millón de semillas capaces de dispersarse a grandes distancias.',
    distribucionNativa: 'América del Sur.',
  },
  'fallopia-japonica': {
    descripcion: 'Planta herbácea perenne y rizomatosa, de hasta 3 m de altura, con tallos huecos de aspecto similar al bambú y hojas anchas, ovaladas y de base truncada.',
    impacto: 'Su crecimiento muy rápido y sus sustancias alelopáticas desplazan a la flora nativa impidiendo su regeneración; sus rizomas pueden dañar construcciones y reducir la capacidad de desagüe de ríos y canales.',
    distribucionNativa: 'Japón, Corea y China.',
  },
  'tradescantia-fluminensis': {
    descripcion: 'Planta herbácea rastrera de tallos carnosos muy ramificados, enraizantes en los nudos, con hojas ovaladas de color verde oscuro brillante y flores pequeñas de tres pétalos blancos.',
    impacto: 'Forma tapices densos y continuos en zonas húmedas y umbrías que desplazan a la vegetación autóctona e impiden su regeneración. Un fragmento de tallo de solo 1 cm puede enraizar y originar una nueva planta.',
    distribucionNativa: 'América del Sur (sureste de Brasil hasta Argentina).',
  },
};

// ----------------------------------------------------------------
// Especies relevantes en Ramales — las 4 especies que ya usa el
// flujo de reporte de esta aplicación (ver js/config.js). Cada una
// enlaza, cuando existe, con su entrada en el catálogo oficial de
// arriba mediante catalogoId.
//
// AVISO SOBRE "VARA DE SAN JOSÉ": Crocosmia x crocosmiiflora es una
// especie invasora bien documentada en zonas húmedas de Cantabria y
// otras regiones de España, pero NO figura en el Catálogo Español de
// Especies Exóticas Invasoras (CEEEI) de ámbito estatal publicado
// por el MITECO. Por eso no tiene catalogoId ni enlace a una ficha
// oficial: no se inventa ninguno.
// ----------------------------------------------------------------
export const ESPECIES_RAMALES = [
  {
    id: 'plumero',
    nombre: 'Plumero',
    cientifico: 'Cortaderia selloana',
    imagen: 'images/plumero.jpg',
    catalogoId: 'cortaderia-spp',
    notaCatalogo: 'Incluida en el catálogo bajo la entrada de género Cortaderia spp.',
  },
  {
    id: 'bambu',
    nombre: 'Bambú japonés',
    cientifico: 'Fallopia japonica',
    imagen: 'images/bambu.jpg',
    catalogoId: 'fallopia-japonica',
    notaCatalogo: null,
  },
  {
    id: 'amor',
    nombre: 'Amor de hombre',
    cientifico: 'Tradescantia fluminensis',
    imagen: 'images/amor.jpg',
    catalogoId: 'tradescantia-fluminensis',
    notaCatalogo: null,
  },
  {
    id: 'vara',
    nombre: 'Vara de San José',
    cientifico: 'Crocosmia x crocosmiiflora',
    imagen: 'images/vara.jpeg',
    catalogoId: null,
    notaCatalogo: 'Especie invasora documentada en zonas húmedas de Cantabria y otras regiones de España, pero no incluida actualmente en el Catálogo Español de Especies Exóticas Invasoras (CEEEI) de ámbito estatal.',
  },
];
