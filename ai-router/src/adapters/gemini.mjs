// Adapter Gemini (Google REST API) — mendukung input multimodal (gambar).

/**
 * @param {string} modelName  mis. 'gemini-3.5-flash'
 * @param {object} config     config global (dari config.mjs)
 * @param {{ parts?: any[], maxTokens?: number }} [opts]
 *   parts: [{ text }, { inline_data: { mime_type, data } }]
 */
export async function callGemini(modelName, config, { parts = [], maxTokens = 4096 } = {}) {
  if (!config.gemini.apiKey) throw new Error('GEMINI_API_KEY belum diisi di .env');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.gemini.apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      `Gemini ${modelName}: HTTP ${res.status} ${data?.error?.message ?? ''}`
    );
    err.status = res.status;
    err.provider = 'gemini';
    err.model = modelName;
    throw err;
  }

  const content =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('') || '';

  return {
    content,
    reasoning: '',
    usage: data?.usageMetadata ?? null,
    model: modelName,
    provider: 'gemini',
  };
}
