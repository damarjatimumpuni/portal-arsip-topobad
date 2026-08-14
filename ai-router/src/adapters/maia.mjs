// Adapter Maia Router (OpenAI-compatible) → GLM / deepseek / dll.

/**
 * @param {string} modelName  mis. 'zai/glm-4.5-flash'
 * @param {object} config     config global (dari config.mjs)
 * @param {{ messages?: any[], maxTokens?: number }} [opts]
 */
export async function callMaia(modelName, config, { messages = [], maxTokens = 4096 } = {}) {
  if (!config.maia.apiKey) throw new Error('MAIA_API_KEY belum diisi di .env');

  const res = await fetch(`${config.maia.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.maia.apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      max_tokens: maxTokens,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      `Maia ${modelName}: HTTP ${res.status} ${data?.error?.message ?? ''}`
    );
    err.status = res.status;
    err.provider = 'maia';
    err.model = modelName;
    throw err;
  }

  const msg = data?.choices?.[0]?.message ?? {};
  // GLM 4.5 Flash adalah model reasoning: content bisa kosong jika token habis
  // untuk berpikir → fallback ke reasoning_content.
  const content = msg.content || msg.reasoning_content || '';

  return {
    content,
    reasoning: msg.reasoning_content || '',
    usage: data?.usage ?? null,
    model: data?.model ?? modelName,
    provider: 'maia',
  };
}
