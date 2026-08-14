// Menjalankan perintah yang sama ke semua model & menghitung total token.
// Model: GLM 4.5 Flash (Maia), Gemini 3.5 Flash (Google), deepseek-v4-flash (Maia)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '..', '.env');

function loadEnv(file) {
  const out = {};
  const raw = readFileSync(file, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv(envPath);
const PROMPT = 'Buatkan teks "hello world!" dan jangan tambahkan apa pun selain teks itu.';

function format(input, output) {
  return (input / 1000).toFixed(1) + 'k in / ' + (output / 1000).toFixed(1) + 'k out';
}

async function callMaia(model, key, base) {
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: PROMPT }], max_tokens: 2000 }),
  });
  const data = await res.json();
  const msg = data?.choices?.[0]?.message ?? {};
  const content = msg.content || msg.reasoning_content || '';
  return { ok: res.ok, content, usage: data?.usage, model: data?.model };
}

async function callGemini(model, key) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: PROMPT }] }] }),
    }
  );
  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  return { ok: res.ok, content: text, usage: data?.usageMetadata, model };
}

const results = {};
let totalIn = 0;
let totalOut = 0;

// 1. GLM 4.5 Flash via Maia
const glm = await callMaia(env.MAIA_MODEL_GLM, env.MAIA_API_KEY, env.MAIA_BASE_URL);
results['GLM 4.5 Flash'] = glm;
if (glm.usage) {
  totalIn += glm.usage.prompt_tokens || 0;
  totalOut += glm.usage.completion_tokens || 0;
}

// 2. Gemini 3.5 Flash
const gemini = await callGemini(env.GEMINI_MODEL || 'gemini-3.5-flash', env.GEMINI_API_KEY);
results['Gemini 3.5 Flash'] = gemini;
if (gemini.usage) {
  totalIn += gemini.usage.promptTokenCount || 0;
  totalOut += gemini.usage.candidatesTokenCount || 0;
}

// 3. deepseek-v4-flash via Maia
const ds = await callMaia(env.MAIA_MODEL_DEEPSEEK, env.MAIA_API_KEY, env.MAIA_BASE_URL);
results['deepseek-v4-flash'] = ds;
if (ds.usage) {
  totalIn += ds.usage.prompt_tokens || 0;
  totalOut += ds.usage.completion_tokens || 0;
}

console.log('=== Hasil per model ===');
for (const [name, r] of Object.entries(results)) {
  const status = r.ok ? 'OK' : 'GAGAL (HTTP ' + (r.status ?? '?') + ')';
  const content = (r.content || '').slice(0, 40).replace(/\n/g, ' ');
  const usage = r.usage
    ? r.usage.prompt_tokens !== undefined
      ? `${r.usage.prompt_tokens} in / ${r.usage.completion_tokens} out (${r.usage.total_tokens} total)`
      : `${r.usage.promptTokenCount} in / ${r.usage.candidatesTokenCount} out (${r.usage.totalTokenCount} total)`
    : 'n/a';
  console.log(`\n[${name}] ${status}`);
  console.log('  Jawaban:', JSON.stringify(content));
  console.log('  Token:  ', usage);
}

console.log('\n=== TOTAL TOKEN SELURUH MODEL ===');
console.log(`Input : ${totalIn} token`);
console.log(`Output: ${totalOut} token`);
console.log(`TOTAL : ${totalIn + totalOut} token`);
