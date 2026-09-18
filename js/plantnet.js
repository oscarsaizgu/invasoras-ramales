import { PLANTNET_API_KEY } from './identificar-config.js';

// ================================================================
// Llamada a Pl@ntNet — ÚNICA función de identificación del proyecto.
// La usan tanto identificar.html (identificar.js) como el paso de foto
// del asistente de reporte (fotos.js), para no duplicar esta lógica en
// dos sitios. Sigue siendo una llamada directa desde el navegador (sin
// backend/intermediario), exactamente como ya funcionaba.
// ================================================================

const PLANTNET_ENDPOINT = 'https://my-api.plantnet.org/v2/identify/all';

/**
 * @param {File[]} fotos
 * @return {Promise<{
 *   resultados: Array<{scientificName:string, score:number|null, commonNames:string[]}>,
 *   error: null | 'sin-clave' | 'limite-diario' | 'http' | 'red',
 *   detalle?: string,
 *   status?: number,
 * }>}
 */
export async function identificarEspecie(fotos) {
  if (!PLANTNET_API_KEY) {
    return { resultados: [], error: 'sin-clave' };
  }
  if (!fotos || !fotos.length) {
    return { resultados: [], error: null };
  }

  try {
    const formData = new FormData();
    fotos.forEach(file => {
      formData.append('images', file, file.name || 'foto.jpg');
      formData.append('organs', 'auto');
    });

    const url = new URL(PLANTNET_ENDPOINT);
    url.searchParams.set('api-key', PLANTNET_API_KEY);
    url.searchParams.set('lang', 'es');
    url.searchParams.set('nb-results', '3');
    url.searchParams.set('include-related-images', 'false');

    const resp = await fetch(url.toString(), { method: 'POST', body: formData });

    if (resp.status === 429) {
      return { resultados: [], error: 'limite-diario', status: 429 };
    }
    if (!resp.ok) {
      let cuerpo = '';
      try { cuerpo = (await resp.text()).slice(0, 200); } catch (e) { /* sin cuerpo legible */ }
      return { resultados: [], error: 'http', status: resp.status, detalle: cuerpo };
    }

    const data = await resp.json();
    const resultados = (data.results || []).slice(0, 3).map(r => ({
      scientificName: r.species?.scientificNameWithoutAuthor || null,
      score: typeof r.score === 'number' ? r.score : null,
      commonNames: Array.isArray(r.species?.commonNames) ? r.species.commonNames.slice(0, 3) : [],
    })).filter(r => r.scientificName);

    return { resultados, error: null };
  } catch (err) {
    return { resultados: [], error: 'red', detalle: err && err.message ? err.message : String(err) };
  }
}

/** Resumen legible ("Especie (85%) · Especie2 (40%)..."), usado en ambos flujos. */
export function resumenResultadosPlantNet(resultados) {
  return resultados
    .map(r => `${r.scientificName} (${r.score != null ? Math.round(r.score * 100) + '%' : '?%'})`)
    .join(' · ');
}
