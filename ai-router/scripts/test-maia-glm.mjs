// Script tes sederhana untuk Maia Router (OpenAI-compatible) → GLM 4.5 Flash.
// Membaca key dari .env di root project.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '..', '.env');

function loadEnv(file) {
  const out = {};
  try {
    const raw = readFileSync(file, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    console.error('Gagal membaca .env:', e.message);
    process.exit(1);
  }
  return out;
}

const env = loadEnv(envPath);
const KEY = env.MAIA_API_KEY;
const BASE = env.MAIA_BASE_URL || 'https://api.maiarouter.ai/v1';
const MODEL = env.MAIA_MODEL_GLM || 'zai/glm-4.5-flash';

if (!KEY) {
  console.error('MAIA_API_KEY tidak ditemukan di .env');
  process.exit(1);
}

console.log('Endpoint:', BASE);
console.log('Model:', MODEL);

const res = await fetch(`${BASE}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${KEY}`,
  },
  body: JSON.stringify({
    model: MODEL,
    messages: [{ role: 'user', content: 'Balas hanya dengan satu kata: halo' }],
    max_tokens: 50,
  }),
});

console.log('HTTP', res.status);
const data = await res.json();
if (res.ok) {
  const text = data?.choices?.[0]?.message?.content;
  console.log('Respons:', JSON.stringify(text));
  console.log('Model yang dipakai:', data?.model);
  if (data?.usage) {
    console.log(
      `Token: ${data.usage.prompt_tokens} in / ${data.usage.completion_tokens} out`
    );
  }
} else {
  console.log('Error:', JSON.stringify(data).slice(0, 500));
  process.exit(1);
}
