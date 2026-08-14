// Klasifikasi tugas sederhana berbasis aturan (tanpa biaya panggilan API).

/**
 * @param {string} prompt
 * @param {{ imageData?: string, multimodal?: boolean }} [opts]
 * @returns {{ modality: 'text'|'multimodal', domain: 'text'|'code', complexity: 'simple'|'complex' }}
 */
export function classifyTask(prompt, opts = {}) {
  const text = String(prompt).toLowerCase();

  const hasImageInput =
    opts.imageData ||
    opts.multimodal ||
    /(analisis (gambar|foto|peta)|baca (gambar|foto|peta)|deskripsi (gambar|foto|peta)|gambar ini|foto ini)/.test(
      text
    );

  const modality = hasImageInput ? 'multimodal' : 'text';

  const domain =
    /(kode|code|script|fungsi|function|debug|refactor|bug|program|implementasi|implement|perbaiki (error|bug)|regex|query sql)/.test(
      text
    )
      ? 'code'
      : 'text';

  const complexity =
    /(rencana|plan|strategi|arsitektur|analisis mendalam|multi-?step|langkah demi langkah|bandingkan|evaluasi|review kode)/.test(
      text
    )
      ? 'complex'
      : 'simple';

  return { modality, domain, complexity };
}
