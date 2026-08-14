# AI Router — Portal Arsip Topobad

Router AI lokal yang mendistribusikan tugas ke beberapa model berdasarkan jenis
tugas. Dipakai untuk bantuan harian project ini, tanpa membuka API ke publik.

## Model pool

| id | model | provider | prioritas |
|---|---|---|---|
| `glm` | `zai/glm-4.5-flash` | Maia | teks 1, kode 2, kompleks 2 |
| `deepseek` | `deepseek/deepseek-v4-flash` | Maia | kode 1, kompleks 1, teks 2 |
| `gemini` | `gemini-3.5-flash` | Google | multimodal 1, teks/kode/kompleks 3 |
| `gemini-fallback` | `gemini-3-flash-preview` | Google | multimodal 2, sisanya 4 |

Prioritas dikonfigurasi di `src/config.mjs` (baca key dari `.env` root project).
Saat model kena rate limit (429), router otomatis beralih ke kandidat berikutnya.

## Penggunaan

```sh
node ai-router/src/cli.mjs "ringkas teks ini: ..."
node ai-router/src/cli.mjs "perbaiki bug di kode ini: ..." --model=deepseek
node ai-router/src/cli.mjs "lanjutkan dari yang tadi" --session=topobad
```

Flag:

- `--model=id` — paksa model tertentu
- `--max-tokens=N` — batas token output (GLM reasoning butuh ≥ 2000)
- `--session=nama` — sesi percakapan dengan memori (default: `default`)
- `--multimodal` — paksa klasifikasi multimodal

## Memori percakapan

- Tersimpan per sesi di `ai-router/memories/<nama>.json` (tidak ikut git).
- Sliding window: 10 pesan terakhir disimpan utuh.
- Auto-summary: saat pesan mentah melebihi 20, pesan tertua diringkas dengan
  GLM menjadi ringkasan konteks — ukuran memori tetap konvergen, tidak membengkak.

## Test

```sh
node ai-router/scripts/test-gemini.mjs
node ai-router/scripts/test-maia-glm.mjs
node ai-router/scripts/test-all-models.mjs
```
