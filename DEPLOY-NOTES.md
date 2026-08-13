# DEPLOY NOTES — Portal Arsip Topobad

Catatan deploy & troubleshooting Keystatic (GitHub + Vercel).
Diperbarui: 13 Agustus 2026

---

## 1. Bug yang sudah diperbaiki (13/08/2026)

**File:** `astro.config.mjs`

Sebelumnya kunci `integrations` ditulis **dua kali** dalam satu object:

```js
// ❌ SEBELUM (rusak):
integrations: [react(), markdoc(), keystatic()],  // ditimpa
...
integrations: [keystatic()],                      // hanya ini yang aktif
```

Di JavaScript, kunci duplikat membuat yang **terakhir yang menang** — sehingga
`react()` dan `markdoc()` terbuang. UI admin Keystatic butuh integrasi React
(`@astrojs/react`) untuk bisa tampil, akibatnya halaman `/keystatic` tidak muncul.

```js
// ✅ SESUDAH (benar):
integrations: [react(), markdoc(), keystatic()],
```

Verifikasi lokal:
```bash
npm install
npm run build        # harus sukses
npx astro dev --background
# lalu buka http://127.0.0.1:4321/keystatic
```

---

## 2. Setup Keystatic (sudah di konfigurasi)

- File config: `keystatic.config.ts`
- Storage mode:
  - **Lokal** (development): `import.meta.env.MODE === 'development'` → local
  - **Produksi** (Vercel): GitHub storage → repo `damarjatimumpuni/portal-arsip-topobad`
- Halaman admin: `/keystatic` (link "Login Admin" di navbar)

---

## 3. Env Variables yang wajib ada di Vercel

Vercel → Project → **Settings → Environment Variables**:

| Variabel | Keterangan |
|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Client ID dari GitHub App "Admin Arsip Topobad" (saat ini: `Iv23liuIJfXUX5dpnSbs`) |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Client Secret dari GitHub App — **harus cocok dengan yang aktif di GitHub** |
| `KEYSTATIC_SECRET` | String acak panjang untuk enkripsi sesi (bisa dibuat sekali, tidak perlu diubah) |

> ⚠️ **PENTING:** env dibaca saat serverless function mulai (cold start). Setiap
> mengubah env → pastikan Vercel sudah **Redeploy** dan status **Ready**.
> Hati-hati spasi/karakter tersembunyi saat menyalin secret (hapus lalu ketik ulang
> jika perlu).

---

## 4. GitHub App "Admin Arsip Topobad"

Bukan OAuth App! App dibuat otomatis oleh alur setup Keystatic (GitHub App).
Lokasi: GitHub → **Settings → Developer settings → GitHub Apps**.

Yang perlu dicek/diatur:

1. **Callback URLs** harus berisi:
   - `https://portal-arsip-topobad-delta.vercel.app/api/keystatic/github/oauth/callback` (produksi)
   - `http://127.0.0.1/api/keystatic/github/oauth/callback` (login lokal)
2. **Permissions** → Contents: **Read and write**
3. **Install App** → ter-install dengan akses ke repo `damarjatimumpuni/portal-arsip-topobad`
   (atau *All repositories*). Kalau belum → login gagal dengan layar "Repo not found".
4. **Generate ulang Client Secret** kalau ragu nilainya tidak cocok:
   - GitHub App → General → *Client secrets* → "Generate a new client secret"
   - Salin → update `KEYSTATIC_GITHUB_CLIENT_SECRET` di Vercel → Redeploy
   - (Tombol "Generate private keys" TIDAK terkait login — aman diabaikan)

---

## 5. Alur login & cara cek kesehatan (dari terminal)

Cek status deploy (harus `200` / `307`):

```bash
# Halaman admin
curl -s -o /dev/null -w "%{http_code}\n" https://portal-arsip-topobad-delta.vercel.app/keystatic
# Endpoint login (kalau env benar → 307 redirect ke GitHub)
curl -s -i https://portal-arsip-topobad-delta.vercel.app/api/keystatic/github/login | grep -i location
# Simulasi error callback (kalau route hidup → teks error muncul)
curl -s "https://portal-arsip-topobad-delta.vercel.app/api/keystatic/github/oauth/callback?error=x&error_description=Test"
```

Diagnosa cepat:
- **500 di `/keystatic`** → kemungkinan salah satu env kosong/salah → cek env di Vercel + status deployment **Ready**.
- **"redirect_uri_mismatch"** → callback URL di GitHub App tidak cocok dengan domain.
- **"Authorization failed"** → Client Secret tidak cocok dengan Client ID.
- **"Repo not found"** → GitHub App belum ter-install di repo.
- Halaman admin muncul tapi login gagal → semua hal di atas (cek satu per satu).

---

## 6. Alur deploy normal ke depan

1. `git add . && git commit -m "..."` di PC mana pun
2. `git push origin main`
3. Vercel otomatis build → tunggu status **Ready** di dashboard
4. Tes `/keystatic` (pakai mode incognito kalau ada cache)
