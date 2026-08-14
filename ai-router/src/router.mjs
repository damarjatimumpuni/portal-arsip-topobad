// Router utama: klasifikasi → pilih model → panggil → fallback saat gagal/429.
import { config } from './config.mjs';
import { classifyTask } from './classify.mjs';
import { callMaia } from './adapters/maia.mjs';
import { callGemini } from './adapters/gemini.mjs';

// --- Rate-limit tracker sederhana (in-memory, per proses) ---
const cooldown = new Map(); // modelId -> timestamp (ms) kapan boleh dicoba lagi

function markRateLimited(modelId, retryAfterSeconds = 60) {
  cooldown.set(modelId, Date.now() + retryAfterSeconds * 1000);
}

function isRateLimited(modelId) {
  const until = cooldown.get(modelId);
  return until ? Date.now() < until : false;
}

function parseRetryAfter(err) {
  const m = (err?.message || '').match(/retry in (\d+(?:\.\d+)?)s/i);
  return m ? Math.ceil(Number(m[1])) : 60;
}

// --- Pemilihan kandidat model ---
function pickCandidates(classification, opts = {}) {
  if (opts.modelId) {
    return config.models.filter(
      (m) => m.id === opts.modelId || m.name === opts.modelId
    );
  }
  const role =
    classification.modality === 'multimodal'
      ? 'multimodal'
      : classification.domain === 'code'
        ? 'code'
        : classification.complexity === 'complex'
          ? 'complex'
          : 'text';

  return [...config.models]
    .filter((m) => m.prio[role] !== undefined && m.prio[role] < 99)
    .sort((a, b) => a.prio[role] - b.prio[role]);
}

// Gemini tidak punya array messages seperti OpenAI — riwayat digabung jadi teks.
function buildGeminiParts(history, prompt, parts) {
  if (history.length === 0) return parts;

  const lines = history.map((m) => {
    const who =
      m.role === 'system' ? 'Ringkasan' : m.role === 'assistant' ? 'AI' : 'User';
    return `${who}: ${m.content}`;
  });
  const text = `Riwayat percakapan:\n${lines.join('\n')}\n\nPertanyaan: ${prompt}`;

  const imagePart = parts.find((p) => p.inline_data);
  return imagePart ? [{ text }, imagePart] : [{ text }];
}

/**
 * @param {string} prompt
 * @param {{ modelId?: string, imageData?: string, imageMime?: string, maxTokens?: number, multimodal?: boolean, history?: {role: string, content: string}[] }} [opts]
 */
export async function routeTask(prompt, opts = {}) {
  const classification = classifyTask(prompt, opts);
  const candidates = pickCandidates(classification, opts);
  const history = Array.isArray(opts.history) ? opts.history : [];

  const parts = opts.imageData
    ? [
        { text: prompt },
        {
          inline_data: {
            mime_type: opts.imageMime || 'image/png',
            data: opts.imageData,
          },
        },
      ]
    : [{ text: prompt }];

  const attempts = [];

  for (const model of candidates) {
    if (isRateLimited(model.id)) continue;

    try {
      const result =
        model.provider === 'maia'
          ? await callMaia(model.name, config, {
              messages: [...history, { role: 'user', content: prompt }],
              maxTokens: opts.maxTokens ?? 4096,
            })
          : await callGemini(model.name, config, {
              parts: buildGeminiParts(history, prompt, parts),
              maxTokens: opts.maxTokens ?? 4096,
            });

      return { ...result, modelId: model.id, classification, attempts };
    } catch (err) {
      attempts.push({ modelId: model.id, status: err.status, error: err.message });
      if (err.status === 429) markRateLimited(model.id, parseRetryAfter(err));
      // 429 / 5xx / 4xx → lanjut ke kandidat berikutnya
    }
  }

  throw new Error(
    'Semua model gagal. Detail: ' + JSON.stringify(attempts, null, 2)
  );
}
