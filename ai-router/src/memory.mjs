// Memori percakapan per sesi: sliding window + auto-summary via GLM.
// File: ai-router/memories/<nama>.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.mjs';
import { callMaia } from './adapters/maia.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEM_DIR = join(__dirname, '..', 'memories');

const MAX_RECENT = 10; // pesan terakhir yang disimpan utuh (sliding window)
const SUMMARY_EVERY = 20; // ringkas otomatis saat pesan mentah melebihi ini

const SUMMARY_MODEL =
  config.models.find((m) => m.id === 'glm')?.name || 'zai/glm-4.5-flash';

/** Nama sesi → path file memori (nama dibersihkan dari karakter berbahaya). */
export function sessionPath(name = 'default') {
  const safe = String(name).replace(/[^a-zA-Z0-9_-]/g, '_');
  return join(MEM_DIR, `${safe}.json`);
}

/** Muat sesi; kembalikan sesi kosong jika file belum ada. */
export function loadSession(name = 'default') {
  const path = sessionPath(name);
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return {
      session: name,
      summary: data.summary || '',
      messages: Array.isArray(data.messages) ? data.messages : [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      path,
    };
  } catch {
    return {
      session: name,
      summary: '',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path,
    };
  }
}

function saveSession(sess) {
  mkdirSync(MEM_DIR, { recursive: true });
  sess.updatedAt = new Date().toISOString();
  writeFileSync(
    sess.path,
    JSON.stringify(
      {
        session: sess.session,
        summary: sess.summary,
        messages: sess.messages,
        createdAt: sess.createdAt,
        updatedAt: sess.updatedAt,
      },
      null,
      2
    )
  );
}

/**
 * Bangun konteks untuk dikirim ke model:
 * ringkasan lama sebagai pesan system (jika ada) + pesan-pesan terakhir.
 */
export function buildContext(sess) {
  const history = sess.messages.map((m) => ({ role: m.role, content: m.content }));
  if (sess.summary) {
    history.unshift({
      role: 'system',
      content: `Ringkasan percakapan sebelumnya:\n${sess.summary}`,
    });
  }
  return history;
}

/** Tambahkan satu giliran (user/assistant) ke sesi dan simpan. */
export function appendTurn(sess, role, content, meta = {}) {
  sess.messages.push({
    role,
    content: String(content),
    ...(meta.model ? { model: meta.model } : {}),
    at: new Date().toISOString(),
  });
  saveSession(sess);
}

/**
 * Auto-summary: jika pesan mentah melebihi SUMMARY_EVERY, pesan tertua
 * (di luar MAX_RECENT terakhir) diringkas dengan GLM dan digabung ke
 * summary lama. Jika ringkasan gagal, pesan tertua dibuang dengan
 * peringatan agar ukuran file tetap terbatas.
 * @returns {Promise<boolean>} true jika ringkasan dijalankan
 */
export async function maybeSummarize(sess) {
  if (sess.messages.length <= SUMMARY_EVERY) return false;

  const keep = sess.messages.slice(-MAX_RECENT);
  const old = sess.messages.slice(0, sess.messages.length - MAX_RECENT);

  try {
    const transcript = old
      .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');
    const prompt = `Ringkas percakapan berikut menjadi poin-poin kunci (keputusan, preferensi, fakta penting) yang berguna untuk percakapan lanjutan. Jangan buang informasi penting.\n\n${
      sess.summary ? `Ringkasan lama:\n${sess.summary}\n\n` : ''
    }Percakapan baru:\n${transcript}`;

    const res = await callMaia(SUMMARY_MODEL, config, {
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah perangkum percakapan yang ringkas dan akurat.',
        },
        { role: 'user', content: prompt },
      ],
      maxTokens: 2000,
    });
    sess.summary = res.content.trim();
  } catch (err) {
    console.error(
      `[memori] Ringkasan gagal (${err.message}) — pesan tertua dibuang tanpa ringkasan.`
    );
  }

  sess.messages = keep;
  saveSession(sess);
  return true;
}
