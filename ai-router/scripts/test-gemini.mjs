// Script tes sederhana untuk memverifikasi API key & model Gemini.
// Membaca key dari .env di root project (parent folder).
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
const KEY = env.GEMINI_API_KEY;
const MODEL = env.GEMINI_MODEL || 'gemini-3.5-flash';

if (!KEY) {
  console.error('GEMINI_API_KEY tidak ditemukan di .env');
  process.exit(1);
}

console.log('Model yang akan dites:', MODEL);

// 1. Cek daftar model yang tersedia
const listRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`
);
console.log('--- List models: HTTP', listRes.status);
if (listRes.ok) {
  const data = await listRes.json();
  const names = (data.models || [])
    .map((m) => m.name)
    .filter((n) => n.toLowerCase().includes('gemini'));
  console.log('Model Gemini yang tersedia (contoh):');
  console.log(names.slice(0, 15).join('\n'));
} else {
  const text = await listRes.text();
  console.log('Error:', text.slice(0, 500));
  process.exit(1);
}

// 2. Tes generateContent dengan prompt kecil
const genRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Balas hanya dengan satu kata: halo' }] }],
    }),
  }
);
console.log('--- generateContent: HTTP', genRes.status);
const genData = await genRes.json();
if (genRes.ok) {
  const text = genData?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .join('');
  console.log('Respons:', JSON.stringify(text));
  const meta = genData.usageMetadata;
  if (meta) {
    console.log(
      `Token: ${meta.promptTokenCount} in / ${meta.candidatesTokenCount} out`
    );
  }
} else {
  console.log('Error:', JSON.stringify(genData).slice(0, 500));
  process.exit(1);
}
