# DEPLOY.md — Panduan Deploy ke VPS (Production)

Panduan ini menjelaskan cara menjalankan **Smart Parking System** di VPS produksi
menggunakan Docker Compose, **tanpa mengubah** alur development lokal.

- **Dev lokal** tetap: `docker compose up -d` (pakai `docker-compose.yml`, hot reload).
- **Produksi** di VPS: `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`.

Kode pada kedua lingkungan **identik** (satu repo, satu branch `main`); yang berbeda
hanya file konfigurasi.

---

## Arsitektur produksi

```
Internet ──(80/443)──> Caddy ──┬─ /            -> frontend (nginx, hasil build Vite)
                               ├─ /api/*       -> backend (Laravel :8000)
                               ├─ /app/*, /apps/* -> reverb (WebSocket :8080)
                               └─ /ai/*        -> ai_service (FastAPI :8001)
       backend/reverb/ai_service <-> db (PostgreSQL), redis
```

- Hanya **Caddy** yang membuka port publik. Service lain internal-only.
- HTTPS otomatis via Caddy + Let's Encrypt.

---

## Prasyarat VPS (sudah diselesaikan)

- Ubuntu 24.04, user `deploy` (sudo, grup `docker`), login SSH pakai kunci.
- `PasswordAuthentication no`, `PermitRootLogin no`.
- UFW: OpenSSH, 80/tcp, 443/tcp, 443/udp.
- Swap 3 GB aktif, fail2ban aktif, Docker + Compose terpasang.
- Domain (`DOMAIN`) A record-nya mengarah ke IP VPS.

> Catatan AI Vision: image memakai **PyTorch CPU-only**. VPS 4 GB + swap cukup,
> namun build pertama (unduh torch + EasyOCR) bisa memakan waktu. Pantau `free -h`.

---

## 1. DNS

Pastikan domain mengarah ke IP VPS:

```bash
nslookup dijkstraparking.my.id
# Address harus = IP VPS (mis. 103.123.62.63)
```

Jika memakai Cloudflare, atur **DNS-only (awan abu-abu)** agar Let's Encrypt lancar.

---

## 2. Clone repo di VPS

Repo bersifat privat, jadi gunakan **deploy key** (SSH key read-only).

Di **VPS** (user `deploy`):

```bash
# Buat SSH key khusus deploy (tanpa passphrase agar bisa dipakai git)
ssh-keygen -t ed25519 -C "deploy-key" -f ~/.ssh/github_deploy -N ""

# Tampilkan public key
cat ~/.ssh/github_deploy.pub
```

Tambahkan isi public key tersebut ke repo GitHub: **Settings → Deploy keys → Add deploy key**
(centang *Allow write access* tidak perlu).

Lalu buat alias host & clone:

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF

sudo mkdir -p /opt/smart-parking
sudo chown deploy:deploy /opt/smart-parking
git clone git@github.com:<USERNAME>/<REPO>.git /opt/smart-parking
cd /opt/smart-parking
```

---

## 3. Buat file `.env.production`

```bash
cd /opt/smart-parking
cp .env.production.example .env.production
```

Sesuaikan nilai berikut di `.env.production`:

- `DOMAIN` → domain Anda
- `DB_PASSWORD` → password kuat
- `REVERB_APP_SECRET` → string acak rahasia (ganti dari contoh)
- `APP_KEY` → isi pada langkah berikut

Generate `APP_KEY`:

```bash
echo "base64:$(openssl rand -base64 32)"
```

Tempelkan hasilnya ke baris `APP_KEY=` (tanpa tanda kutip).

> Nilai `VITE_*` di file ini juga dipakai saat build frontend.

---

## 4. (Opsional) Migrasi data dari lokal

Untuk membawa data dari laptop, ekspor DB lokal lalu impor di VPS.

Di **laptop** (dari root repo):

```bash
docker compose exec -T db pg_dump -U admin -d parking_db --clean --if-exists > backup.sql
scp backup.sql deploy@103.123.62.63:~/backup.sql
```

Di **VPS** (setelah langkah 5 di bawah / container db sudah jalan), impor dump.

> Jika ingin data bersih, lewati langkah ini dan cukup jalankan `migrate --seed`.

---

## 5. Deploy pertama

```bash
cd /opt/smart-parking
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Jalankan migrasi:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T backend php artisan migrate --force
```

Jika memilih migrasi data dari lokal (langkah 4):

```bash
# Impor dump (mengganti isi DB produksi)
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db \
  psql -U admin -d parking_db < backup.sql
```

Cek status & log:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f caddy
```

Akses: `https://dijkstraparking.my.id`

---

## 6. Deploy otomatis (GitHub Action)

Workflow `.github/workflows/deploy.yml` akan jalan tiap push ke `main`.

Tambahkan **Secrets** di GitHub repo: **Settings → Secrets and variables → Actions**:

| Secret        | Nilai                              |
| ------------- | ---------------------------------- |
| `VPS_HOST`    | IP VPS (mis. `103.123.62.63`)      |
| `VPS_USER`    | `deploy`                           |
| `VPS_SSH_KEY` | isi **private key** SSH user `deploy` (dari laptop: `cat ~/.ssh/dijkstra_vps`) |

Setiap `git push origin main` akan otomatis: `git pull` → build → `migrate --force`.

> Pastikan `.env.production` **sudah ada** di `/opt/smart-parking` (tidak dikomit).

---

## Update & rollback

Update manual:

```bash
cd /opt/smart-parking
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T backend php artisan migrate --force
```

Rollback: `git checkout <commit-lama>` lalu jalankan perintah `up -d --build` di atas.

---

## Backup

Backup database:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db \
  pg_dump -U admin -d parking_db > backup-$(date +%F).sql
```

Volume yang perlu dipertahankan: `db_data` (database), `caddy_data` (sertifikat TLS),
`easyocr_cache` (model OCR).

---

## Troubleshooting

| Gejala | Kemungkinan penyebab / solusi |
| --- | --- |
| HTTPS tidak aktif | DNS belum propagasi / port 80 tertutup. Cek `docker compose ... logs caddy`. |
| CORS error di browser | `CORS_ALLOWED_ORIGINS` belum memuat domain; rebuild/restart backend. |
| WebSocket tidak konek | Pastikan `/app/*` ter-proxy ke `reverb:8080` dan `VITE_REVERB_HOST` = domain, port 443, scheme `https`. |
| Kamera tidak muncul | `getUserMedia` butuh HTTPS. Pastikan akses via `https://`. |
| Build AI gagal (memori) | Tambah swap atau build image di laptop lalu push ke registry. |
| Data tidak muncul | Jalankan `migrate --force`, atau impor dump (langkah 4). |
| `exec` gagal ("No such service") | Perintah harus menyertakan `--env-file .env.production -f docker-compose.prod.yml`. |
