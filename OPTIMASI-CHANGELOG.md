# Bricket Charcoal Indonesia — Changelog Optimasi & Tuning

> Sesi tuning: **4 Juli 2026**. Semua perubahan di project `D:\App-AI\ai-charcoal`.
> Brand: **Bricket Charcoal Indonesia** (sebelumnya "Nusantara Charcoal"). Fokus pasar: **Timur Tengah / Gulf** (shisha).

---

## 1. AI Chat (server.ts + widget)

| Item | Perubahan |
|---|---|
| **Model AI** | `gemini-3-flash-preview:cloud` → **`glm-5.2:cloud`** (`.env`). Gemini dijadwalkan dihapus dari Ollama ~15 Juli. |
| **Persona** | Ditulis ulang jadi **hangat & solutif** (pahami dulu kebutuhan → rekomendasi → satu pertanyaan lanjutan), bukan "sales closer" kaku. Meniru gaya AI Takonsik. |
| **Nama asisten** | "NusaBot" → **"PremiumCharcoal Assistant"** (header, sapaan, tooltip, error — id/en/ar + fallback). |
| **Harga** | Semua harga **retail (Rp35k dll.) dihapus** → **ekspor / NEGO per ton/kontainer**. AI tidak boleh mengarang angka; arahkan ke sample gratis + quote resmi. |
| **Katalog di prompt** | Diselaraskan dgn worldthecoco: lini Shisha (Cube, Hexagon, Half Finger, dll.) + BBQ, spec batok kelapa (abu 1.9% putih, karbon 80%+, bakar 60–120 mnt). |
| **Fokus Timur Tengah** | Persona menekankan pembeli Gulf/shisha + **fluent & hangat dalam bahasa Arab**. |
| **Multi-bahasa** | AI auto-detect & balas **bahasa apa pun** (bukan cuma id/en/ar). |
| **Fallback text** | Diperbaiki teks rusak ("tim menteri miring") + fallback harga diganti ke format ekspor/Nego. |

## 2. Widget Chat (AiChatWidget.tsx)

- **Font** disamakan dengan Takonsik: **Plus Jakarta Sans**.
- **Lebar panel**: 410 → 520 → 624 → **750px** (beberapa kali +20%).
- **Backdrop blur** di belakang panel saat kebuka (klik luar = tutup).
- **Typewriter** reveal per kata diperlambat: 62ms → **~90–150ms/kata** + jitter (lebih natural).

## 3. Header / Navbar (Navbar.tsx)

- Tinggi header non-scroll: **h-22 → h-13** (lebih ramping, tidak "memenuhi").
- Flame, logo, teks nav dikecilkan proporsional.
- Jarak icon (search/keranjang/admin): `gap-5 → gap-2.5`.

## 4. Hero (Hero.tsx)

- **Background** diganti ke gambar produk **Premium Block Briquette** (`arang_briket_premium`) + **glow ember** agar tetap terlihat terbakar. Background lama di-backup (lihat §9).
- **Alignment vertikal**: `lg:items-end` (nempel bawah) → **`items-center`** + padding seimbang (rata tengah).
- **Font Hero −20%**: H1 100px → 80px, sub-judul, eyebrow, tombol, badge.
- Background image dibuat imbang kiri-kanan (`object-center`) + gradient gelap kiri dikurangi (65% → 48%, lebih lembut).

## 5. Our Products (Products.tsx)

- Diisi **katalog lengkap worldthecoco.com/our-product** (perusahaan yang sama): **12 produk** (10 Shisha + 2 BBQ).
- Tiap kartu: gambar asli + badge kategori + nama + ukuran + **spec lengkap** (abu 1.9% putih, air maks 6%, bakar 60–120 mnt, karbon 80%+, batok kelapa) + kapasitas kontainer.
- **7 gambar produk** diunduh dari situs (aset perusahaan sendiri) → dikompres ke WebP.
- Teks spec **mengikuti setting bahasa web** (id/en/ar); nama & ukuran produk universal.

## 6. SEO (index.html)

- `<html lang>` `en` → **`id`**.
- **Title**: "My Google AI Studio App" → **"Bricket Charcoal Indonesia — Eksportir Arang Premium Indonesia"**.
- Ditambah: **meta description, keywords** (termasuk kata kunci Arab/شيشة), robots, theme-color, author.
- **Open Graph + Twitter Card** (preview share WA/FB) — `og:locale` utama **ar_SA**, alternate id/en.
- **JSON-LD structured data**: Organization + WebSite + Product (spec batok kelapa) → rich result Google.
- **hreflang** id/en/ar/x-default + **canonical** + `og:url`. LanguageContext sekarang baca **`?lang=`** dari URL (deep-link bahasa).
- **`public/favicon.svg`** (flame), **`public/robots.txt`**, **`public/sitemap.xml`** (dengan alternate bahasa).
- ⚠️ Domain masih **placeholder `bricketcharcoal.com`** di canonical/og:url/hreflang/sitemap/robots — **GANTI ke domain final saat deploy**.

## 7. Rebrand

- **"Nusantara Charcoal" → "Bricket Charcoal Indonesia"** di seluruh project (server.ts, widget, Footer, LanguageContext, admin, meta) — termasuk teks Arab.

## 8. Performa ⚡ (win terbesar)

| Optimasi | Hasil |
|---|---|
| **Gambar → WebP** (resize + q80) | **9.5MB → 712KB** (~13× lebih kecil). Contoh: coco_cube 2.2MB → 125KB, hero bg 630KB → 81KB. |
| **Lazy-load gambar produk** | `loading="lazy"` — gambar below-fold load saat di-scroll. |
| **Lazy-load 3D (three.js)** | `CharcoalCanvas3D` di-`React.lazy` → jadi **chunk terpisah 554KB (gzip 144KB)**, cuma load saat modal 3D dibuka. Main bundle bebas three.js. |
| **Production build** | Dari dev (`npm run dev`) → **production** (minified, tree-shake, static serve). |

## 9. Backup (folder `/backups`)

- `premium_charcoal_bg_1781161967608.png` — background Hero original (revert: ganti import di `Hero.tsx`, ada komentar caranya).
- 8 gambar original (.png/.jpeg 2MB) yang sudah diganti versi WebP.

## 10. Cara menjalankan (Production)

**Cara termudah (build + prerender + jalan) — 1 perintah:**
```powershell
.\build-prod.ps1        # build → start server → prerender SEO → live di :3001
```

Manual:
```bash
npm run build                                # build dist/ (client) + dist/server.cjs
NODE_ENV=production node dist/server.cjs     # jalankan (PORT dari .env = 3001)
npm run prerender                            # WAJIB setelah build (server harus running)
```
- Dev mode (ngoding): `npm run dev` (vite + HMR).
- Setelah edit source, **wajib build ulang** (prod serve dari `dist/`, tidak hot-reload) — pakai `build-prod.ps1` biar prerender ikut jalan.
- ⚠️ **`npm run build` me-reset `dist/index.html` jadi root kosong** → prerender HARUS dijalankan lagi setelahnya (`build-prod.ps1` sudah otomatis).

## 10b. SSR / Prerender (SEO) ✅

- Situs SPA di-**prerender** pakai **headless Chromium** (`scripts/prerender.py`, Python Playwright) → HTML akhir yang sudah terisi konten disimpan ke `dist/index.html`.
- **Hasil:** crawler & bot share yang tidak menjalankan JS (Facebook/WhatsApp/Bing) sekarang melihat **konten penuh + semua meta**; user tetap dapat SPA (React hydrate). Verified: raw HTML `/` berisi teks produk/hero, bukan `<div id="root">` kosong.
- Script tetap ada di HTML → hydrate normal.

## 10c. Security hardening (dari pentest) ✅

Fix atas laporan pentest (`D:\pentest-live\charcoal\logs\`):
- **H-1 (Kritis) — DoS crash:** `/api/chat` sekarang **validasi tipe input** (`message` wajib string ≤4000 char, `history` di-sanitize jadi item {role,text} valid saja), **seluruh handler dibungkus try/catch**, plus `process.on('unhandledRejection'|'uncaughtException')` sebagai jaring pengaman. Satu request malformed tidak lagi mematikan server.
- **M-1 (Medium) — rate limit:** limiter in-memory **20 req/menit/IP** di `/api/chat` (kembalikan 429). Lindungi biaya API LLM.
- **L-1 (Low) — security headers:** ditambah `Content-Security-Policy` (permisif untuk Google Ads/GTM/Analytics, tapi `frame-ancestors 'self'` + `object-src 'none'` + `base-uri 'self'`), `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, dan `HSTS` (saat via HTTPS).
- **L-2 (Low):** `X-Powered-By` dimatikan (`app.disable('x-powered-by')`).
- Positif (tidak perlu aksi): chatbot tahan prompt-injection & tak bocorkan system prompt; tak ada file sensitif/source map ter-expose.
- ⚠️ Produksi sebaiknya tetap di bawah **pm2/systemd** (auto-restart) sebagai lapis tambahan.

**Putaran 2 — audit kode (fix tambahan):**
- **#2 Admin panel tanpa auth (HIGH):** ditambah **gate password** (`navigateTo('admin')` di `App.tsx`). Password dari `VITE_ADMIN_PASSWORD` (build-time), default `bricket-admin`. Proporsional karena admin hanya menulis localStorage (tanpa privilege server).
- **#3 XSS via innerHTML (HIGH):** `SeoAdsContext.tsx` — JSON-LD pakai `textContent` (bukan `innerHTML`); `conversionId` gtag disanitasi (`[A-Za-z0-9_-]`) + `remarketing` di-boolean sebelum di-inject ke `<script>`.
- **#4 Rate-limit bypass X-Forwarded-For (HIGH):** `app.set('trust proxy', TRUST_PROXY===1)` + limiter pakai `req.ip`. XFF hanya dipercaya bila `TRUST_PROXY=1` (di belakang Nginx); jika langsung exposed, spoofing diabaikan. Limit diturunkan **20 → 10 req/mnt**.
- **#8 CORS/origin (MEDIUM):** `/api/chat` menolak `Origin` di luar allowlist (`ALLOWED_ORIGINS`, default bricketcharcoal.com + www + localhost) → **403**. Cegah situs lain membakar kuota LLM.
- **#6 Prompt injection (MEDIUM):** instruksi anti-ekstraksi diperkuat di system prompt.
- **#9 Memory limiter (LOW):** cleanup berkala `setInterval` (5 mnt, `.unref()`).
- **False-positive / by-design (tidak diubah):** #1 API key di `.env` (praktik benar, gitignored — cukup `chmod 600` + rotasi bila perlu); #7 error Ollama TIDAK bocor ke client (`fallbackReason` tak dikirim, outer-catch generic); #10 contact form client-only (tak ada endpoint server → tak perlu CSRF); #11 HSTS memang hanya boleh via HTTPS (perilaku benar).
- Env baru (produksi): `TRUST_PROXY=1`, `ALLOWED_ORIGINS=https://bricketcharcoal.com,https://www.bricketcharcoal.com`, `VITE_ADMIN_PASSWORD=<kuat>`.

**Putaran 3 — hardening dari re-audit:**
- **Admin password default (HIGH):** default hard-coded `bricket-admin` DIHAPUS. Kalau `VITE_ADMIN_PASSWORD` tak di-set saat build, **panel admin dinonaktifkan total** (tak ada default yang bisa dibaca di bundle JS).
- **Admin session (Low):** flag `admin_ok` diganti `admin_ok_until` dengan **expiry 30 menit** (re-prompt setelahnya).
- **Error Ollama (Med):** `lib/ollama.ts` sekarang **log detail di server, throw pesan generic** (`Ollama request failed (status)`) — tak ada detail infra ke client.
- **CSP frame-src (Low):** dari `https:` → allowlist spesifik (doubleclick, googletagmanager, google.com, youtube).
- **Accepted-risk (terdokumentasi, TIDAK diubah — keputusan sadar):**
  - CSP `script-src`/`connect-src 'unsafe-inline' https:` — **wajib** untuk Google Ads/GTM/Analytics (beacon ke puluhan domain Google; allowlist ketat = conversion tracking diam-diam mati). Risiko XSS-nya rendah karena sumber XSS sudah ditutup (markdown escape HTML, sink `innerHTML` sudah diganti `textContent`). Nonce/hash tidak kompatibel dengan gtag yang inject inline dinamis.
  - Prompt injection — prompt sudah diperkuat & bot menolak; system prompt **tak berisi rahasia** (offer publik, harga "nego").
  - Contact form CSRF — form **client-only** (tak ada endpoint server → tak ada yang perlu di-CSRF).
  - HSTS conditional — memang **hanya boleh** dikirim via HTTPS (perilaku benar).

**Putaran 4 — hardening DDoS/DoS + kejujuran UI:**
- **Rate-limit `/api/health`** (60 req/mnt/IP) — cegah flood endpoint murah.
- **Connection timeout** — `server.requestTimeout/headersTimeout/setTimeout(30s)` → cegah slowloris / koneksi menggantung.
- **N-3 (Info):** label UI admin "enkripsi LocalStorage" (menyesatkan) → dikoreksi jadi "disimpan di LocalStorage browser ini (tidak dikirim ke server)".
- **`.env.example`** dilengkapi env keamanan (`TRUST_PROXY`, `ALLOWED_ORIGINS`, `VITE_ADMIN_PASSWORD`) + model diperbaiki ke `glm-5.2:cloud`.
- **DDoS volumetric** = di luar scope app (Express tak bisa handle) → **wajib andalkan Nginx/Cloudflare** di depan (sudah di `deploy.md`).

**Putaran 5 — white-box (kebocoran source):**
- **W-1 (Medium) — `server.cjs` + `.map` tersaji publik:** build lama menaruh server bundle di `dist/` yang di-`express.static` → seluruh **source backend + system prompt** bisa di-`curl /server.cjs`. **Fixed:** (a) build server pindah ke **`build/server.cjs`** (di luar `dist/`), (b) guard middleware **404-kan `*.cjs`/`*.map`** di static serving, (c) bundle lama dihapus dari `dist/`. Terverifikasi: `/server.cjs` & `/server.cjs.map` → **404**. Semua path run diupdate (`package.json`, `build-prod.ps1`, `deploy.md`).
- **W-2 (Low, laten) — `VITE_ADMIN_PASSWORD` ter-embed di bundle client:** by-design gate client-side. **Sudah aman**: default kosong → admin dinonaktifkan (Putaran 3). Kalau panel admin benar-benar dibutuhkan di produksi, idealnya pindah ke auth server-side. Sudah didokumentasikan di komentar kode + `.env.example`.

## 11. Catatan / opsional lanjutan

- ✅ SSR/prerender — **selesai** (§10b). ✅ Domain `bricketcharcoal.com` terpasang. ✅ `og:image` ada.
- Saat deploy: pastikan **redirect 301 `www` → non-www**, lalu **submit `sitemap.xml` ke Google Search Console**.
- (Opsional) **Prerender per-bahasa path-based** (`/en/`, `/ar/`) untuk crawler no-JS versi Arab/Inggris — perlu tambah route server + deteksi bahasa dari path. Sekarang default (id) yang di-prerender; Google (jalanin JS) tetap dapat semua bahasa via hreflang + `?lang=`.
- (Opsional) Default **bahasa Arab (RTL)** untuk pasar Timur Tengah — perlu cek layout RTL.
- (Opsional) `og:image` per-bahasa / gambar OG berbranding (sekarang pakai foto produk hexagon).
