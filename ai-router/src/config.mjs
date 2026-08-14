// Konfigurasi: membaca .env di root project dan mendefinisikan model pool.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '..', '.env');

function loadEnvFile(file) {
  const out = {};
  try {
    const raw = readFileSync(file, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // .env belum ada → biarkan kosong, error jelas muncul saat dipanggil
  }
  return out;
}

export const env = loadEnvFile(envPath);

export const config = {
  gemini: {
    apiKey: env.GEMINI_API_KEY,
    models: [
      env.GEMINI_MODEL || 'gemini-3.5-flash',
      env.GEMINI_MODEL_FALLBACK || 'gemini-3-flash-preview',
    ],
  },
  maia: {
    apiKey: env.MAIA_API_KEY,
    baseUrl: env.MAIA_BASE_URL || 'https://api.maiarouter.ai/v1',
  },
  // Model pool.
  // prio: prioritas per peran tugas (1 = dicoba lebih dulu, 99 = tidak dipakai untuk peran itu)
  models: [
    {
      id: 'glm',
      name: env.MAIA_MODEL_GLM || 'zai/glm-4.5-flash',
      provider: 'maia',
      prio: { text: 1, code: 2, complex: 2, multimodal: 99 },
    },
    {
      id: 'deepseek',
      name: env.MAIA_MODEL_DEEPSEEK || 'deepseek/deepseek-v4-flash',
      provider: 'maia',
      prio: { text: 2, code: 1, complex: 1, multimodal: 99 },
    },
    {
      id: 'gemini',
      name: env.GEMINI_MODEL || 'gemini-3.5-flash',
      provider: 'gemini',
      prio: { text: 3, code: 3, complex: 3, multimodal: 1 },
    },
    {
      id: 'gemini-fallback',
      name: env.GEMINI_MODEL_FALLBACK || 'gemini-3-flash-preview',
      provider: 'gemini',
      prio: { text: 4, code: 4, complex: 4, multimodal: 2 },
    },
  ],
};
