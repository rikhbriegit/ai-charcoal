# Deploy Guide — Bricket Charcoal Indonesia (ai-charcoal)

> **Untuk Claude Code / operator di VPS.** Dokumen ini instruksi deploy lengkap.
> Baca §0 dulu (yang harus ditanya ke user), lalu jalankan step berurutan.
> Domain: **bricketcharcoal.com** (non-www canonical). App jalan di **port 3001** di belakang Nginx.

---

## 0. Yang WAJIB dipastikan dulu (tanya user bila belum ada)

1. **`OLLAMA_API_KEY`** — kunci Ollama Cloud (rahasia, JANGAN commit). Ambil dari user atau dari file `.env` lama.
2. **Akses domain/DNS** `bricketcharcoal.com` (untuk arahkan A record ke IP VPS).
3. **IP publik VPS** & akses `sudo`.
4. Cara ambil kode: `git clone <remote>` **atau** transfer folder (`rsync`/`scp`). Konfirmasi remote-nya.

> ⚠️ **Jangan** menaruh `OLLAMA_API_KEY` asli di file yang di-commit. Simpan hanya di `.env` server (mode 600).

---

## 1. Stack & cara kerja (ringkas)

- **Express.js** (server.ts → `build/server.cjs`) + **React/Vite SPA** (`dist/`).
- Server serve `dist/` statis **hanya jika `NODE_ENV=production`** (kalau tidak, ia jalan mode dev vite).
- AI chat memanggil **Ollama Cloud** (`glm-5.2:cloud`) → butuh **koneksi keluar ke `https://ollama.com`**.
- **SEO prerender**: setelah build, `dist/index.html` root-nya kosong (SPA). Prerender headless Chromium mengisinya dgn konten (lihat §4). **Wajib jalan tiap habis build.**

---

## 2. Prasyarat sistem (Ubuntu/Debian)

```bash
# Node.js 20 LTS (atau 22)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# Process manager
sudo npm i -g pm2

# Nginx + SSL
sudo apt-get install -y certbot python3-certbot-nginx

# Untuk PRERENDER (headless Chromium via Python Playwright)
sudo apt-get install -y python3 python3-pip
pip3 install playwright
python3 -m playwright install --with-deps chromium
```

Cek: `node -v` (≥20), `python3 -m playwright --version`.

---

## 3. Ambil kode + konfigurasi `.env`

```bash
# lokasi contoh
cd /var/www
git clone <REMOTE_REPO> bricketcharcoal   # atau rsync/scp folder project ke sini
cd bricketcharcoal

npm ci        # install dependencies (pakai npm install kalau tidak ada package-lock)
```

Buat `.env` (mode 600, JANGAN commit):

```bash
cat > .env <<'EOF'
OLLAMA_API_KEY=__ISI_DENGAN_KEY_RAHASIA__
OLLAMA_BASE_URL=https://ollama.com
OLLAMA_MODEL=glm-5.2:cloud
PORT=3001

# Keamanan (produksi)
TRUST_PROXY=1                                                        # WAJIB kalau di belakang Nginx (agar rate-limit pakai IP asli, bukan XFF spoof)
ALLOWED_ORIGINS=https://bricketcharcoal.com,https://www.bricketcharcoal.com
VITE_ADMIN_PASSWORD=__PASSWORD_ADMIN_KUAT__                          # gate panel admin; dibaca saat `npm run build`
EOF
chmod 600 .env
```

> **Penting:**
> - `TRUST_PROXY=1` hanya bila benar-benar di belakang Nginx/proxy tepercaya. Kalau app langsung exposed ke internet, **jangan** set (biar XFF tidak dipercaya).
> - `VITE_ADMIN_PASSWORD` di-*embed* ke bundle client saat build (gate ringan, bukan rahasia server) — panel admin hanya menulis localStorage. Set sebelum `npm run build`.
> - Kalau `OLLAMA_API_KEY` pernah tampil di log/laporan, **rotasi key**-nya.

---

## 4. Build + Prerender + Jalankan

Prerender butuh server yang sudah hidup (ia me-render `http://localhost:3001`). Urutannya penting:

```bash
# 1) build (client + server bundle)
npm run build

# 2) start/registrasi ke pm2 (production)
NODE_ENV=production pm2 start build/server.cjs --name bricketcharcoal --update-env
# kalau sudah pernah start: NODE_ENV=production pm2 restart bricketcharcoal --update-env

# 3) tunggu port siap, lalu PRERENDER (mengisi dist/index.html dgn konten utk SEO)
sleep 3
npm run prerender      # = python3 scripts/prerender.py

# 4) simpan konfigurasi pm2 + auto-start saat reboot
pm2 save
pm2 startup systemd -u $USER --hp $HOME   # jalankan perintah yang dicetaknya
```

Verifikasi lokal:
```bash
curl -s localhost:3001/ | grep -q 'id="root"></div>' && echo "PRERENDER GAGAL (root kosong)" || echo "OK konten ter-render"
curl -s -o /dev/null -w "HTTP %{http_code}\n" localhost:3001/
```

> Kalau `npm run prerender` gagal karena Chromium: pastikan `python3 -m playwright install --with-deps chromium` sudah sukses (butuh dependency sistem; `--with-deps` mengurusnya). Situs tetap jalan tanpa prerender, hanya SEO-nya lemah.

---

## 5. Nginx reverse proxy + SSL + redirect www→non-www

Buat `/etc/nginx/sites-available/bricketcharcoal`:

```nginx
# Redirect www -> non-www (canonical = non-www)
server {
    listen 80;
    server_name www.bricketcharcoal.com;
    return 301 https://bricketcharcoal.com$request_uri;
}

server {
    listen 80;
    server_name bricketcharcoal.com;

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan + SSL:
```bash
sudo ln -s /etc/nginx/sites-available/bricketcharcoal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL Let's Encrypt (untuk kedua host, biar redirect www jg ber-HTTPS)
sudo certbot --nginx -d bricketcharcoal.com -d www.bricketcharcoal.com
# certbot otomatis menambah listen 443 + redirect 80->443
```

---

## 6. DNS

Di panel DNS domain, arahkan ke IP VPS:
```
A     @      <IP_VPS>
A     www    <IP_VPS>      (atau CNAME www -> bricketcharcoal.com)
```
Tunggu propagasi, lalu jalankan certbot (§5) bila belum.

---

## 7. Verifikasi akhir (dari luar)

```bash
curl -sI https://bricketcharcoal.com/            # 200, header ada
curl -s https://www.bricketcharcoal.com/ -o /dev/null -w "%{http_code}\n"   # 301 -> non-www
curl -s https://bricketcharcoal.com/robots.txt   # ada Sitemap:
curl -s https://bricketcharcoal.com/sitemap.xml  # 200
curl -s https://bricketcharcoal.com/ | grep -c "batok\|Hexagon"   # >0 = konten ter-prerender
```
- Tes AI: POST `https://bricketcharcoal.com/api/chat` body `{"message":"halo","history":[]}` → balas teks (bukan mode fallback). Kalau fallback: cek `OLLAMA_API_KEY` & koneksi ke ollama.com.
- **Submit `sitemap.xml` ke Google Search Console** + set International Targeting (biarkan global).

---

## 8. Redeploy (update kode)

```bash
cd /var/www/bricketcharcoal
git pull                                   # atau sync ulang file
npm ci
npm run build
NODE_ENV=production pm2 restart bricketcharcoal --update-env
sleep 3 && npm run prerender               # WAJIB — build me-reset root jadi kosong
pm2 save
```

> **Ingat:** setiap `npm run build` mengosongkan `dist/index.html`. Prerender HARUS dijalankan lagi setelah restart, atau crawler akan melihat halaman kosong.

---

## 9. Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| Halaman blank / CSS aneh | Server jalan tanpa `NODE_ENV=production` → ia mode dev. Pastikan env di pm2 (`--update-env`). |
| AI balas "mode cadangan/fallback" | `OLLAMA_API_KEY` salah/kosong, atau VPS tak bisa akses `ollama.com`. Cek `.env` & `curl https://ollama.com`. |
| `curl /` menunjukkan `<div id="root"></div>` kosong | Prerender belum jalan / gagal. Jalankan `npm run prerender` (server harus hidup). |
| Prerender error Chromium | `python3 -m playwright install --with-deps chromium`. |
| Port 3001 sudah dipakai | `pm2 delete bricketcharcoal` atau ubah `PORT` di `.env` + Nginx `proxy_pass`. |
| 502 Bad Gateway di Nginx | App pm2 mati → `pm2 logs bricketcharcoal`. |
| Log app | `pm2 logs bricketcharcoal` |

---

## 10. Ringkasan file penting

- `.env` — rahasia (OLLAMA_API_KEY dll), mode 600, tidak di-commit.
- `build/server.cjs` — server hasil build. Jalankan dgn `NODE_ENV=production`.
- `dist/index.html` — HTML yang di-serve; diisi konten oleh prerender.
- `scripts/prerender.py` — prerender headless (Python Playwright).
- `public/{robots.txt,sitemap.xml,favicon.svg,og-image.jpg}` — aset SEO (ganti isi domain bila domain berubah).
- `OPTIMASI-CHANGELOG.md` — riwayat semua optimasi & keputusan.
