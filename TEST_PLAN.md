# TEST PLAN — Smart Parking System

**Versi** : 1.0
**Tanggal** : 26 Agustus 2026
**Total Test Case** : 58
**Coverage** : Backend API (47 endpoints), Frontend (27 komponen), AI Vision (1 endpoint), WebSocket

---

## 1. PERSIAPAN TESTING

### 1.1 Prerequisites

```bash
# Semua container harus running
docker compose up -d

# Pastikan semua service healthy
docker compose ps
# Expected: 6 containers running (db, redis, backend, reverb, ai_service, frontend)

# Seed data master (slots, node, edge)
docker compose exec backend php artisan migrate:fresh --seed
```

### 1.2 Data Master yang Harus Ada

| Data | Jumlah | Keterangan |
|------|--------|------------|
| Parking Slots | 35 | S1–S35 dengan koordinat (x, y) |
| Graph Nodes | 35+ | Satu per slot + exit nodes |
| Graph Edges | Minimal 40 | Menghubungkan antar node |
| Revenue Config | 1 | Tarif per jam aktif |
| Admin akun | 1 | admin@admin.com / password |
| Staff akun | 1 | staff@staff.com / password |
| Customer akun | 1 | customer@customer.com / password |

### 1.3 Tools

- Browser (Chrome/Firefox) — buka 3 tab (admin, staff, customer)
- Terminal — untuk curl testing API
- Docker Desktop — monitor logs

### 1.4 Konvensi

- **PASS** = Actual result sesuai expected result
- **FAIL** = Actual result TIDAK sesuai expected result
- Test dilakukan secara **berurutan** dalam satu modul (ada dependensi antar test case)
- Tanda `[BLOCKED]` = test case sebelumnya harus PASS dulu

---

## 2. MODUL AUTENTIKASI

### TC-AUTH-01: Admin Register

| | |
|---|---|
| **Endpoint** | `POST /api/admin/auth/register` |
| **Component** | `RegisterAdmin.jsx` |
| **Priority** | High |

**Prerequisites:** Belum ada admin dengan email tersebut.

**Steps:**
1. Buka halaman registrasi admin
2. Isi name: `Admin Test`, email: `admin_test@test.com`, password: `password123`
3. Klik tombol Register

**Expected Result:**
- Response 200 dengan token `admin_token`
- User dibuat di DB dengan `role = 'admin'` dan `is_active = true`
- Redirect ke halaman login
v
---

### TC-AUTH-02: Admin Login

| | |
|---|---|
| **Endpoint** | `POST /api/admin/auth/login` |
| **Component** | `LoginAdmin.jsx` |
| **Priority** | High |

**Prerequisites:** Akun admin sudah ada (dari TC-AUTH-01 atau seed).

**Steps:**
1. Buka halaman login admin
2. Isi email: `admin@admin.com`, password: `password`
3. Klik Login

**Expected Result:**
- Response 200 dengan `admin_token`
- Redirect ke `admin_dashboard`
- `localStorage.admin_token` terisi
v
**Negative Test:**
4. Logout, lalu login dengan password salah
v
**Expected Result:**
- Response 401: `Kredensial tidak valid`
v
---

### TC-AUTH-03: Staff Login

| | |
|---|---|
| **Endpoint** | `POST /api/staff/login` (via auth controller) |
| **Component** | `LoginStaff.jsx` |
| **Priority** | High |

**Prerequisites:** Akun staff sudah ada di DB.

**Steps:**
1. Klik "Portal Petugas" di navbar
2. Isi email dan password staff
3. Klik Login

**Expected Result:**
- Response 200 dengan `staff_token`
- Redirect ke `StaffLayout`
- `localStorage.staff_token` terisi
v
---

### TC-AUTH-04: Customer Register + Login

| | |
|---|---|
| **Endpoint** | `POST /api/customer/register`, `POST /api/customer/login` |
| **Component** | `RegisterCustomer.jsx`, `LoginCustomer.jsx` |
| **Priority** | High |

**Steps:**
1. Klik "Portal Pelanggan" di navbar
2. Klik "Register", isi name, email, password, phone, registered_plate_number
3. Submit registrasi
4. Login dengan email & password yang sama

**Expected Result:**
- Register: Response 200, user dibuat dengan `role = 'customer'`
- Login: Response 200 dengan `customer_token`
- Redirect ke `CustomerDashboard`
v
---

### TC-AUTH-05: Akses Endpoint Tanpa Token

| | |
|---|---|
| **Endpoint** | Semua endpoint `auth:sanctum` |
| **Priority** | High |

**Steps:**
```bash
curl -s http://localhost:8000/api/parking/slots
curl -s http://localhost:8000/api/staff/dashboard
curl -s http://localhost:8000/api/admin/notifications
```

**Expected Result:**
- Semua return 401: `Unauthenticated`

---

### TC-AUTH-06: Akses Endpoint dengan Role Salah

| | |
|---|---|
| **Endpoint** | `/api/admin/*` dengan staff token |
| **Priority** | High |

**Steps:**
```bash
# Login sebagai staff, dapatkan staff_token
curl -s -X POST http://localhost:8000/api/admin/notifications \
  -H "Authorization: Bearer STAFF_TOKEN_HERE"
```

**Expected Result:**
- Response 403: `Forbidden` (middleware role menolak)

---

## 3. MODUL PARKING CORE

### TC-PARK-01: GET /parking/slots

| | |
|---|---|
| **Endpoint** | `GET /api/parking/slots` |
| **Component** | `SpatialParkingLayout.jsx` |
| **Priority** | High |

**Steps:**
```bash
curl -s http://localhost:8000/api/parking/slots | python3 -m json.tool
```

**Expected Result:**
- Response 200
- `data` berisi array parking slots (35 slot)
- Setiap slot punya field: `id`, `slot_code`, `status`, `x_coord`, `y_coord`, `active_violation_count`
- `candidates` berisi array hasil Dijkstra (slot available + path)
- Slot `available` punya `active_violation_count = 0`

---

### TC-PARK-02: Tap-In

| | |
|---|---|
| **Endpoint** | `POST /api/parking/tap-in` |
| **Component** | `App.jsx` (`handleTapIn`), `CustomerParking.jsx` (`handleTapIn`) |
| **Priority** | High |

**Steps:**
```bash
curl -s -X POST http://localhost:8000/api/parking/tap-in \
  -H "Content-Type: application/json" \
  -d '{"plate_number": "B1234XYZ"}'
```

**Expected Result:**
- Response 200: `status: 'success'`, `message: 'Akses gerbang terbuka.'`
- `data.transaction` berisi transaksi baru dengan `exit_time = null`
- `data.allocated_slot` berisi slot_code (misal `S1`)
- Slot di DB berubah dari `available` → `occupied`
- WebSocket `SlotUpdated` terkirim ke semua client

---

### TC-PARK-03: Tap-Out Normal

| | |
|---|---|
| **Endpoint** | `POST /api/parking/tap-out` |
| **Priority** | High |

**Prerequisites:** TC-PARK-02 sudah selesai (ada transaksi aktif di slot tertentu).

**Steps:**
```bash
# Asumsi slot_id = 1 (S1) punya transaksi aktif
curl -s -X POST http://localhost:8000/api/parking/tap-out \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 1}'
```

**Expected Result:**
- Response 200: `status: 'success'`
- `plate_number` = plat yang benar (bukan "Tidak diketahui")
- `exit_time`, `duration`, `total_fee`, `is_member` terisi
- Slot di DB berubah dari `occupied` → `available`
- Transaksi di DB punya `exit_time` yang terisi

---

### TC-PARK-04: Tap-Out Slot Kosong

| | |
|---|---|
| **Endpoint** | `POST /api/parking/tap-out` |
| **Priority** | High |

**Steps:**
```bash
# Slot yang statusnya 'available' (tidak ada transaksi)
curl -s -X POST http://localhost:8000/api/parking/tap-out \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 1}'
```

**Expected Result:**
- Response 400: `Slot tidak ditemukan atau sudah kosong`

---

### TC-PARK-05: Simulate Sensor — Slot Benar

| | |
|---|---|
| **Endpoint** | `POST /api/parking/simulate-sensor` |
| **Component** | `CustomerParking.jsx` (`handleSimulateParking`) |
| **Priority** | High |

**Prerequisites:** Ada transaksi aktif di slot X. User klik slot X (sesuai alokasi).

**Steps:**
```bash
# Asumsi transaction_id=1, allocated di slot 1, klik slot 1 (benar)
curl -s -X POST http://localhost:8000/api/parking/simulate-sensor \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": 1, "detected_slot_id": 1}'
```

**Expected Result:**
- Response 200: `message: 'Terima kasih, posisi parkir Anda sesuai.'`
- `is_violation = false` pada transaksi
- Tidak ada notifikasi baru dibuat
- Slot tetap `occupied`

---

### TC-PARK-06: Simulate Sensor — Slot Salah (VIOLATION)

| | |
|---|---|
| **Endpoint** | `POST /api/parking/simulate-sensor` |
| **Component** | `CustomerParking.jsx` (`handleSimulateParking`) |
| **Priority** | High |

**Prerequisites:** Ada transaksi aktif di slot X. User klik slot Y (berbeda).

**Steps:**
```bash
# Asumsi transaction_id=1 di slot 1, klik slot 5 (salah)
curl -s -X POST http://localhost:8000/api/parking/simulate-sensor \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": 1, "detected_slot_id": 5}'
```

**Expected Result:**
- Response 200: `message: 'PERINGATAN: Anda menempati slot yang salah!'`
- Slot 5 (Y) berubah: `status = 'violation'`
- Transaksi: `is_violation = true`, `detected_slot_id = 5`
- Notifikasi dibuat: `type = 'violation'`, `to_user_id = null`, `transaction_id = 1`
- WebSocket `SlotUpdated` terkirim untuk slot 5
- `active_violation_count` slot 5 = 1
- `active_violation_count` slot 1 = 1 (karena transaksinya is_violation=true)

---

### TC-PARK-07: Request Manual Tap-Out

| | |
|---|---|
| **Endpoint** | `POST /api/parking/request-manual-tapout` |
| **Component** | `App.jsx` (`handleRequestManualTapOut`), `SpatialParkingLayout.jsx` |
| **Priority** | Medium |

**Prerequisites:** Slot occupied tanpa violation.

**Steps:**
```bash
curl -s -X POST http://localhost:8000/api/parking/request-manual-tapout \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 1}'
```

**Expected Result:**
- Response 200: `message: 'Permintaan terkirim ke petugas...'`
- Notifikasi dibuat: `type = 'manual_tapout_request'`, `to_user_id = null`

---

### TC-PARK-08: AI Validate Slot

| | |
|---|---|
| **Endpoint** | `POST /api/parking/validate` |
| **Priority** | Medium |

**Prerequisites:** Slot occupied dengan plat `B1234XYZ`.

**Steps:**
```bash
# Plat sesuai
curl -s -X POST http://localhost:8000/api/parking/validate \
  -H "Content-Type: application/json" \
  -d '{"slot_code": "S1", "detected_plate": "B1234XYZ"}'

# Plat tidak sesuai
curl -s -X POST http://localhost:8000/api/parking/validate \
  -H "Content-Type: application/json" \
  -d '{"slot_code": "S1", "detected_plate": "B9999ZZZ"}'
```

**Expected Result:**
- Plat sesuai: Response 200 `{ status: 'valid' }`
- Plat tidak sesuai: Response 200 `{ status: 'mismatch' }`, transaksi `is_violation = true`, broadcast `SlotUpdated`

---

## 4. MODUL VIOLATION & OVERRIDE (REGRESI FIX)

### TC-VIO-01: Slot Violation Tidak Bisa Di-Tap-Out (Backend)

| | |
|---|---|
| **Endpoint** | `POST /api/parking/tap-out` |
| **Priority** | High |

**Prerequisites:** Slot dalam status `violation` (dari TC-PARK-06).

**Steps:**
```bash
# Coba tap-out slot yang statusnya 'violation'
curl -s -X POST http://localhost:8000/api/parking/tap-out \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 5}'
```

**Expected Result:**
- Response 403: `message: 'Slot ini dalam status pelanggaran. Menunggu override petugas.'`
- Slot tetap `violation` (tidak berubah)
- Tidak ada transaksi yang ter-modifikasi

---

### TC-VIO-02: Slot Occupied + Violation Tidak Bisa Di-Tap-Out (Backend)

| | |
|---|---|
| **Endpoint** | `POST /api/parking/tap-out` |
| **Priority** | High |

**Prerequisites:** Transaksi di slot X punya `is_violation = true`.

**Steps:**
```bash
# Coba tap-out slot alokasi (occupied, tapi transaksinya is_violation=true)
curl -s -X POST http://localhost:8000/api/parking/tap-out \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 1}'
```

**Expected Result:**
- Response 403: `message: 'Transaksi ini dalam status pelanggaran. Menunggu override petugas.'`
- Slot tetap `occupied`
- Transaksi tidak diubah

---

### TC-VIO-03: Slot Violation Tidak Bisa Request Manual Tap-Out

| | |
|---|---|
| **Endpoint** | `POST /api/parking/request-manual-tapout` |
| **Priority** | High |

**Steps:**
```bash
curl -s -X POST http://localhost:8000/api/parking/request-manual-tapout \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 5}'
```

**Expected Result:**
- Response 403: `message: 'Slot ini dalam status pelanggaran. Silakan tunggu override dari petugas.'`

---

### TC-VIO-04: UI Panel Terkunci — Slot Violation (Merah)

| | |
|---|---|
| **Component** | `SpatialParkingLayout.jsx` |
| **Priority** | High |

**Prerequisites:** Slot dalam status `violation`. Login sebagai staff atau buka guest view.

**Steps:**
1. Buka denah parkir
2. Klik slot yang berwarna merah pulsing (violation)

**Expected Result:**
- Panel bawah menampilkan:
  - Ikon `Lock` (merah)
  - Teks: **"Slot Terkunci — Menunggu Override Petugas"**
  - Deskripsi: "Slot ini dalam status pelanggaran..."
  - **TIDAK ADA** tombol "Proses Keluar"
  - **TIDAK ADA** tombol "Butuh Bantuan Petugas"

---

### TC-VIO-05: UI Panel Terkunci — Slot Occupied + Violation (Amber)

| | |
|---|---|
| **Component** | `SpatialParkingLayout.jsx` |
| **Priority** | High |

**Prerequisites:** Slot `occupied` dengan transaksi `is_violation = true` (slot alokasi).

**Steps:**
1. Buka denah parkir
2. Klik slot alokasi (occupied, tapi transaksinya bermasalah)

**Expected Result:**
- Panel bawah menampilkan:
  - Ikon `Lock` (amber/kuning)
  - Teks: **"Transaksi Terkunci — Menunggu Override Petugas"**
  - Deskripsi: "Kendaraan di slot ini dalam status pelanggaran..."
  - **TIDAK ADA** tombol aksi apapun

---

### TC-VIO-06: Override Berhasil → is_violation Reset + Slot Unlocked

| | |
|---|---|
| **Endpoint** | `POST /api/staff/override-slot` |
| **Component** | `LiveSlotMonitor.jsx` |
| **Priority** | High |

**Prerequisites:** Transaksi di slot X dengan `is_violation = true`. Slot Y (violation) tersedia.

**Steps:**
1. Login sebagai staff
2. Buka Live Slot Monitoring
3. Klik "Selesaikan (Override)" pada transaksi bermasalah
4. Pilih slot tujuan (slot Y yang violation)
5. Isi alasan, klik "Terapkan Override"

**Expected Result (Backend):**
- Response 200: `message: 'Berhasil memindahkan slot.'`
- Transaksi: `parking_slot_id` = slot Y, `is_violation = false`, `detected_slot_id = null`
- Slot X: `status = 'available'`
- Slot Y: `status = 'occupied'`
- Record di tabel `slot_overrides` dibuat
- Notifikasi `type = 'info'` dibuat dengan `resolved_by` terisi
- Notifikasi lama (violation) di-resolve

**Expected Result (Frontend):**
- Denah update: slot X hijau, slot Y merah (occupied, bukan violation)
- `active_violation_count` slot X = 0, slot Y = 0
- Panel terkunci tidak muncul lagi untuk kedua slot

---

### TC-VIO-07: Admin Notif Pelanggaran Resolved Setelah Override

| | |
|---|---|
| **Endpoint** | `GET /api/admin/notifications` |
| **Component** | `AdminNotificationPage.jsx` |
| **Priority** | High |

**Prerequisites:** Override sudah dilakukan (TC-VIO-06).

**Steps:**
1. Login sebagai admin
2. Buka halaman Notifikasi
3. Cari notifikasi pelanggaran yang sudah di-override

**Expected Result:**
- Notifikasi pelanggaran menampilkan status "Sudah ditangani" (bukan "Menunggu petugas")
- `resolved_by` terisi nama staff yang override
- `resolved_at` terisi timestamp
- Notifikasi override (type=info) juga tampil sebagai "Log aktivitas"

---

### TC-VIO-08: Override — Slot Lama Available, Slot Baru Occupied

| | |
|---|---|
| **Endpoint** | `POST /api/staff/override-slot` |
| **Priority** | High |

**Steps:**
1. Sebelum override, catat status kedua slot
2. Lakukan override
3. Cek status setelah override

**Expected Result:**
| Field | Sebelum | Sesudah |
|-------|---------|---------|
| Slot lama (X) status | occupied | available |
| Slot baru (Y) status | violation | occupied |
| Transaksi parking_slot_id | X | Y |
| Transaksi is_violation | true | false |
| Transaksi detected_slot_id | Y | null |

---

## 5. MODUL NOTIFIKASI

### TC-NOTIF-01: Staff Poll Notif — Muncul Notif Pelanggaran Baru

| | |
|---|---|
| **Endpoint** | `GET /api/staff/notifications` |
| **Component** | `StaffLayout.jsx` (polling 8 detik), `NotificationCenter.jsx` |
| **Priority** | High |

**Prerequisites:** Pelanggaran baru saja terjadi (TC-PARK-06).

**Steps:**
1. Login sebagai staff, buka portal staff
2. Tunggu maksimal 8 detik (siklus polling)

**Expected Result:**
- Notifikasi pelanggaran muncul di daftar
- `type = 'violation'`, `resolved_by = null`
- Badge counter bertambah

---

### TC-NOTIF-02: Staff Mark Notif Read

| | |
|---|---|
| **Endpoint** | `PATCH /api/staff/notifications/{id}/read` |
| **Priority** | Medium |

**Steps:**
1. Klik notifikasi yang belum dibaca
2. Tandai sudah dibaca

**Expected Result:**
- `read_at` terisi timestamp
- Jika type = 'info', otomatis resolved (`resolved_by` terisi)
- Jika type = 'violation', HANYA `read_at` yang terisi (tidak resolved)

---

### TC-NOTIF-03: Staff Clear All Notifications

| | |
|---|---|
| **Endpoint** | `PATCH /api/staff/notifications/clear-all` |
| **Priority** | Medium |

**Steps:**
1. Klik "Tandai Semua Dibaca" atau tombol clear

**Expected Result:**
- Type `info`: resolved (`resolved_by` + `resolved_at` terisi)
- Type `violation`/`manual_tapout`: hanya `read_at` terisi (TIDAK resolved)

---

### TC-NOTIF-04: Admin Fetch Notif

| | |
|---|---|
| **Endpoint** | `GET /api/admin/notifications` |
| **Component** | `AdminNotificationPage.jsx` |
| **Priority** | High |

**Steps:**
1. Login sebagai admin, buka halaman Notifikasi
2. Klik "Refresh Data"

**Expected Result:**
- Daftar notifikasi muncul (limit 100, terbaru di atas)
- Setiap notif punya: `resolver_name` (jika resolved), `resolved_at`
- Filter "Belum Ditangani" berfungsi

---

### TC-NOTIF-05: Admin Retrigger → Eskalasi ke Staff

| | |
|---|---|
| **Endpoint** | `POST /api/admin/notifications/{id}/retrigger` |
| **Component** | `AdminNotificationPage.jsx` |
| **Priority** | High |

**Prerequisites:** Ada notifikasi pelanggaran yang belum resolved.

**Steps:**
1. Klik "Eskalasi" pada notifikasi yang belum ditangani
2. Konfirmasi eskalasi

**Expected Result (Admin):**
- Notifikasi baru muncul di daftar dengan judul `[ESKALASI ADMIN] ...`
- Notifikasi lama tetap utuh (audit trail)

**Expected Result (Staff):**
- Dalam ≤8 detik, notifikasi eskalasi muncul di NotificationCenter staff
- Judul: `[ESKALASI ADMIN] Pelanggaran Lokasi!`

---

### TC-NOTIF-06: Admin Delete Notif

| | |
|---|---|
| **Endpoint** | `DELETE /api/admin/notifications/{id}` |
| **Priority** | Medium |

**Steps:**
1. Coba hapus notifikasi yang belum resolved
2. Coba hapus notifikasi yang sudah resolved

**Expected Result:**
- Belum resolved: Response 403: `Gagal: Hanya notifikasi yang sudah selesai ditangani yang boleh dihapus.`
- Sudah resolved: Response 200, notifikasi terhapus permanen

---

### TC-NOTIF-07: Notifikasi Override Langsung Resolved

| | |
|---|---|
| **Endpoint** | `POST /api/staff/override-slot` |
| **Priority** | High |

**Steps:**
1. Lakukan override
2. Cek notifikasi yang baru dibuat (type = 'info', judul "Slot Overriden")

**Expected Result:**
- Notifikasi sudah punya `resolved_by` dan `resolved_at` (langsung resolved)
- Di admin page, tampil sebagai "Log aktivitas" (bukan "Menunggu petugas")

---

## 6. MODUL STAFF OPERATIONS

### TC-STAFF-01: Dashboard Stats

| | |
|---|---|
| **Endpoint** | `GET /api/staff/dashboard` |
| **Priority** | Medium |

**Steps:**
```bash
# Login sebagai staff dulu, dapatkan token
curl -s http://localhost:8000/api/staff/dashboard \
  -H "Authorization: Bearer STAFF_TOKEN"
```

**Expected Result:**
- `slots.available`, `slots.occupied`, `slots.violation` terisi angka
- `active_transactions_count` = jumlah transaksi tanpa `exit_time`

---

### TC-STAFF-02: Active Transactions List

| | |
|---|---|
| **Endpoint** | `GET /api/staff/active-transactions` |
| **Component** | `LiveSlotMonitor.jsx` |
| **Priority** | High |

**Steps:**
```bash
curl -s http://localhost:8000/api/staff/active-transactions \
  -H "Authorization: Bearer STAFF_TOKEN"
```

**Expected Result:**
- Array transaksi dengan `exit_time = null`
- Setiap transaksi punya relasi `slot` dan `customer.user`

---

### TC-STAFF-03: Manual Tap-Out by Slot

| | |
|---|---|
| **Endpoint** | `POST /api/staff/tap-out/{slotId}` |
| **Priority** | Medium |

**Steps:**
```bash
curl -s -X POST http://localhost:8000/api/staff/tap-out/1 \
  -H "Authorization: Bearer STAFF_TOKEN"
```

**Expected Result:**
- Memanggil `ParkingController@tapOut` dengan `slot_id = {slotId}`
- Sama dengan tap-out normal

---

### TC-STAFF-04: Manual Tap-Out by Plate

| | |
|---|---|
| **Endpoint** | `POST /api/staff/tap-out-by-plate` |
| **Priority** | Medium |

**Steps:**
```bash
curl -s -X POST http://localhost:8000/api/staff/tap-out-by-plate \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plate_number": "B1234XYZ"}'
```

**Expected Result:**
- Mencari transaksi aktif dengan plat yang cocok (case-insensitive)
- Jika ditemukan: proses tap-out
- Jika tidak: Response 404

---

### TC-STAFF-05: Manual Verification Tap-Out (STNK)

| | |
|---|---|
| **Endpoint** | `POST /api/staff/verify-tap-out` |
| **Component** | `ManualVerificationModal.jsx` |
| **Priority** | High |

**Prerequisites:** Ada transaksi aktif dengan permintaan manual tap-out.

**Steps:**
```bash
curl -s -X POST http://localhost:8000/api/staff/verify-tap-out \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": 1,
    "verified_plate": "B1234XYZ",
    "vehicle_model": "Toyota Avanza",
    "vehicle_color": "Silver",
    "driver_name": "Budi Santoso"
  }'
```

**Expected Result:**
- Record `manual_verifications` dibuat dengan `staff_id` terisi
- `plate_number` transaksi di-update ke `verified_plate`
- SEMUA notifikasi terkait transaksi ini di-resolve
- Transaksi di-tap-out (exit_time terisi)
- Slot = `available`

---

## 7. MODUL ADMIN MANAGEMENT

### TC-ADM-01: Revenue Config CRUD

| | |
|---|---|
| **Endpoint** | `POST /api/admin/revenue-config`, `GET /api/admin/revenue-config` |
| **Priority** | Medium |

**Steps:**
```bash
# Create
curl -s -X POST http://localhost:8000/api/admin/revenue-config \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rate_per_hour": 5000, "effective_from": "2026-08-26"}'

# Read
curl -s http://localhost:8000/api/admin/revenue-config \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Result:**
- Config baru dibuat
- `GET` mengembalikan list config, termasuk yang terbaru

---

### TC-ADM-02: Staff Management

| | |
|---|---|
| **Endpoint** | `GET /api/admin/staff`, `POST /api/admin/staff`, `PATCH /api/admin/staff/{id}/toggle-status` |
| **Priority** | Medium |

**Steps:**
1. List staff
2. Create staff baru
3. Toggle status staff (active → inactive)

**Expected Result:**
- Staff baru bisa login setelah dibuat
- Staff inactive tidak bisa login (`403: Akun Anda tidak aktif`)

---

### TC-ADM-03: Slot Management CRUD

| | |
|---|---|
| **Endpoint** | `GET/POST/PUT/DELETE /api/admin/slots` |
| **Component** | `SlotControl.jsx` |
| **Priority** | Medium |

**Steps:**
1. List semua slot
2. Buat slot baru (S36)
3. Update koordinat slot S36
4. Hapus slot S36

**Expected Result:**
- Slot baru otomatis punya Graph Node + Edge terdekat
- Slot occupied tidak bisa dihapus
- Slot di-soft-delete (ada `deleted_at`)

---

### TC-ADM-04: Admin updateStatus Slot

| | |
|---|---|
| **Endpoint** | `PATCH /api/admin/slots/{id}/status` |
| **Priority** | Medium |

**Steps:**
```bash
curl -s -X PATCH http://localhost:8000/api/admin/slots/1/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "maintenance"}'
```

**Expected Result:**
- Slot berubah ke status baru
- **TIDAK** ada WebSocket broadcast
- **TIDAK** ada notifikasi dibuat
- **Catatan (Known Gap):** Ini berbeda dengan `StaffController@overrideSlot` yang selalu broadcast + notif

---

### TC-ADM-05: Member Management

| | |
|---|---|
| **Endpoint** | `GET /api/admin/members/customers`, `POST /api/admin/members/customers/{id}/toggle` |
| **Priority** | Medium |

**Steps:**
1. List customers
2. Toggle membership customer
3. Cek status member

**Expected Result:**
- Membership aktif → tap-out fee = Rp 0
- Membership non-aktif → tap-out fee = rate_per_hour × duration

---

### TC-ADM-06: Transaction History

| | |
|---|---|
| **Endpoint** | `GET /api/admin/transactions` |
| **Component** | `AdminParkingHistory.jsx` |
| **Priority** | Medium |

**Steps:**
```bash
curl -s http://localhost:8000/api/admin/transactions \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Result:**
- Daftar semua transaksi (sudah dan belum tap-out)
- Setiap transaksi punya: plate, slot, entry_time, exit_time, fee, is_violation

---

### TC-ADM-07: Dashboard Stats

| | |
|---|---|
| **Endpoint** | `GET /api/admin/dashboard-stats` |
| **Component** | `AdminParkingOverview.jsx` |
| **Priority** | Medium |

**Steps:**
```bash
curl -s http://localhost:8000/api/admin/dashboard-stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Result:**
- Statistik: total slot, occupied, available, violation, maintenance
- Total transaksi aktif
- Revenue hari ini

---

### TC-ADM-08: Manual Verification History

| | |
|---|---|
| **Endpoint** | `GET /api/admin/manual-verifications` |
| **Component** | `AdminManualTapOutHistory.jsx` |
| **Priority** | Low |

**Steps:**
```bash
curl -s http://localhost:8000/api/admin/manual-verifications \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Result:**
- Daftar verifikasi manual dengan relasi `transaction.slot`
- Field: verified_plate, vehicle_model, vehicle_color, driver_name, staff name

---

## 8. MODUL CUSTOMER

### TC-CUST-01: Customer Dashboard

| | |
|---|---|
| **Endpoint** | `GET /api/customer/dashboard` |
| **Component** | `CustomerDashboard.jsx` |
| **Priority** | High |

**Steps:**
1. Login sebagai customer
2. Buka dashboard

**Expected Result:**
- Profil: name, email, phone, registered_plate_number
- `active_transaction`: null (belum parkir) atau transaksi aktif
- `membership`: status keanggotaan
- `history`: daftar transaksi sebelumnya

---

### TC-CUST-02: Mobile Tap-In

| | |
|---|---|
| **Endpoint** | `POST /api/customer/tap-in` |
| **Component** | `CustomerParking.jsx` (`handleTapIn`) |
| **Priority** | High |

**Steps:**
1. Klik "Tap In Masuk" di CustomerParking

**Expected Result:**
- Transaksi baru dibuat
- Slot dialokasikan via Dijkstra
- `active_transaction` terisi di dashboard
- Denah update: slot berubah jadi occupied

---

### TC-CUST-03: Mobile Tap-Out

| | |
|---|---|
| **Endpoint** | `POST /api/customer/tap-out` |
| **Component** | `CustomerParking.jsx` (`handleTapOut`) |
| **Priority** | High |

**Prerequisites:** Customer punya active transaction.

**Steps:**
1. Klik "Tap Out Keluar" di CustomerParking

**Expected Result:**
- Transaksi selesai (exit_time terisi)
- Fee dihitung (0 untuk member, rate × jam untuk non-member)
- Slot = `available`
- Modal kuitansi muncul

---

### TC-CUST-04: Customer History

| | |
|---|---|
| **Component** | `CustomerHistory.jsx` |
| **Priority** | Low |

**Steps:**
1. Buka riwayat parkir di CustomerDashboard

**Expected Result:**
- Daftar transaksi sebelumnya (entry, exit, duration, fee)
- Status is_violation jika ada

---

## 9. MODUL AI VISION

### TC-AI-01: Process Frame — Ada Kendaraan

| | |
|---|---|
| **Endpoint** | `POST http://localhost:8001/process-frame` |
| **Priority** | Medium |

**Prerequisites:** AI service running, kamera aktif atau siapkan gambar kendaraan.

**Steps:**
```bash
# Kirim gambar yang mengandung kendaraan
curl -s -X POST http://localhost:8001/process-frame \
  -F "file=@vehicle_image.jpg"
```

**Expected Result:**
- Response 200: `status: 'success'`
- `vehicles_found >= 1`
- `detections[0].bbox` berisi koordinat bounding box
- `elapsed_ms` berisi waktu inferensi

---

### TC-AI-02: Process Frame — Tanpa Kendaraan

| | |
|---|---|
| **Endpoint** | `POST http://localhost:8001/process-frame` |
| **Priority** | Medium |

**Steps:**
```bash
# Kirim gambar jalanan kosong
curl -s -X POST http://localhost:8001/process-frame \
  -F "file=@empty_road.jpg"
```

**Expected Result:**
- Response 200: `vehicles_found = 0`
- `detections` kosong atau null

---

### TC-AI-03: OCR Pipeline → POST ke Laravel

| | |
|---|---|
| **Endpoint** | AI vision → `POST /api/parking/validate` |
| **Priority** | Medium |

**Prerequisites:** Backend running, ada transaksi aktif di slot S1.

**Steps:**
1. Kirim frame berulang ke `/process-frame` (simulasi kamera live)
2. Monitor log backend: `docker compose logs backend -f`

**Expected Result:**
- OCR mendeteksi plat → `filter_plat_indonesia()` validasi format
- AI service POST ke `http://backend:8000/api/parking/validate`
- Backend terima request, validasi slot S1
- Jika plat cocok: response `valid`
- Jika plat beda: response `mismatch`, transaksi `is_violation = true`

**Catatan:** `slot_code` di AI service masih hardcoded `"1A"` — ini known gap.

---

## 10. MODUL REAL-TIME WEBSOCKET

### TC-WS-01: Tap-In → Broadcast SlotUpdated

| | |
|---|---|
| **Endpoint** | WebSocket `parking-channel` |
| **Priority** | High |

**Prerequisites:** Buka 2 browser tab (atau tab guest + staff).

**Steps:**
1. Tab 1: Buka guest view, monitor denah
2. Tab 2: Lakukan tap-in

**Expected Result:**
- Tab 1: Slot berubah dari hijau → merah (occupied) secara instan
- Tidak ada delay polling

---

### TC-WS-02: Override → Broadcast 2 Slot

| | |
|---|---|
| **Endpoint** | WebSocket `parking-channel` |
| **Priority** | High |

**Steps:**
1. Tab 1: Buka guest/staff view
2. Tab 2: Lakukan override dari slot X → slot Y

**Expected Result:**
- Tab 1: Slot X berubah occupied → hijau (available)
- Tab 1: Slot Y berubah violation → merah (occupied)
- Kedua update muncul secara instan

---

### TC-WS-03: Tap-Out → Broadcast SlotUpdated

| | |
|---|---|
| **Endpoint** | WebSocket `parking-channel` |
| **Priority** | High |

**Steps:**
1. Tab 1: Buka guest view
2. Tab 2: Lakukan tap-out

**Expected Result:**
- Tab 1: Slot berubah dari merah → hijau (available) secara instan

---

## 11. END-TO-END FLOW

### E2E-01: Happy Path

```
Tap-In → Parkir Sesuai → Tap-Out
```

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | Customer tap-in | Slot dialokasikan (occupied), notif ke staff: 0 |
| 2 | Customer klik slot YANG BENAR di denah | `is_violation = false`, pesan sukses |
| 3 | Customer/Staff tap-out | Biaya dihitung, slot = available |
| 4 | Admin cek riwayat | Transaksi lengkap tanpa pelanggaran |

---

### E2E-02: Violation Path (REGRESI UTAMA)

```
Tap-In → Parkir Salah → Override → Tap-Out
```

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | Customer tap-in | Slot X dialokasikan (occupied) |
| 2 | Customer klik slot Y (SALAH) | Slot Y = violation, `is_violation = true`, notif dibuat |
| 3 | Guest coba tap-out slot Y | **DITOLAK** (403) + UI "Slot Terkunci" |
| 4 | Guest coba tap-out slot X | **DITOLAK** (403) + UI "Transaksi Terkunci" |
| 5 | Staff override: slot X → slot Y | `is_violation = false`, slot X = available, slot Y = occupied |
| 6 | Guest coba tap-out slot Y | **BERHASIL** (transaksi normal) |
| 7 | Admin cek notif | Pelanggaran = "Sudah ditangani", override = "Log aktivitas" |

---

### E2E-03: Manual Verification Path

```
Tap-In → Plat Tak Terbaca → Staff Verifikasi STNK → Tap-Out
```

| Langkah | Aksi | Expected |
|---------|------|----------|
| 1 | Customer tap-in | Slot X dialokasikan |
| 2 | Customer klik "Butuh Bantuan Petugas" | Notif `manual_tapout_request` dibuat |
| 3 | Staff lihat notif di NotificationCenter | Muncul permintaan tap-out manual |
| 4 | Staff klik "Proses Verifikasi" | Modal ManualVerificationModal muncul |
| 5 | Staff isi: plat, model, warna, nama driver | Verifikasi tersimpan |
| 6 | Sistem proses tap-out otomatis | Transaksi selesai, slot = available |
| 7 | Admin cek riwayat verifikasi | Data lengkap: plat, vehicle, staff name |

---

## 12. EDGE CASES & NEGATIVE TESTING

### TC-EDGE-01: Tap-In Saat Slot Penuh

| | |
|---|---|
| **Endpoint** | `POST /api/parking/tap-in` |
| **Priority** | Medium |

**Prerequisites:** Semua slot occupied/maintenance (tidak ada available).

**Steps:**
```bash
curl -s -X POST http://localhost:8000/api/parking/tap-in \
  -H "Content-Type: application/json" \
  -d '{"plate_number": "B9999FULL"}'
```

**Expected Result:**
- Response 400: `message: 'Mohon maaf, area parkir penuh.'`
- Tidak ada transaksi dibuat

---

### TC-EDGE-02: Double Tap-In

| | |
|---|---|
| **Endpoint** | `POST /api/customer/tap-in` |
| **Priority** | Medium |

**Prerequisites:** Customer sudah punya active transaction.

**Steps:**
```bash
# Customer tap-in lagi tanpa tap-out
curl -s -X POST http://localhost:8000/api/customer/tap-in \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

**Expected Result:**
- Response 400 (atau sesuai implementasi): menolak tap-in kedua
- Hanya 1 transaksi aktif per customer

---

### TC-EDGE-03: Tap-Out Transaksi Sudah Selesai

| | |
|---|---|
| **Endpoint** | `POST /api/parking/tap-out` |
| **Priority** | Medium |

**Steps:**
```bash
# Tap-out slot yang sudah available (transaksi sudah selesai)
curl -s -X POST http://localhost:8000/api/parking/tap-out \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 1}'
```

**Expected Result:**
- Response 400: `Slot tidak ditemukan atau sudah kosong`

---

### TC-EDGE-04: Override ke Slot yang Sudah Occupied

| | |
|---|---|
| **Endpoint** | `POST /api/staff/override-slot` |
| **Priority** | Medium |

**Steps:**
```bash
# Coba override ke slot yang sudah occupied (bukan available/violation)
curl -s -X POST http://localhost:8000/api/staff/override-slot \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": 1, "new_slot_id": 3, "reason": "Test"}'
# (slot_id 3 diasumsikan sudah occupied)
```

**Expected Result:**
- Response 400: `message: 'Slot tujuan tidak valid atau sudah terisi sah.'`

---

### TC-EDGE-05: Tap-Out Slot yang Tidak Ada

| | |
|---|---|
| **Endpoint** | `POST /api/parking/tap-out` |
| **Priority** | Low |

**Steps:**
```bash
curl -s -X POST http://localhost:8000/api/parking/tap-out \
  -H "Content-Type: application/json" \
  -d '{"slot_id": 9999}'
```

**Expected Result:**
- Response 400: `Slot tidak ditemukan atau sudah kosong`

---

## RINGKASAN

### Coverage Matrix

| Modul | Test Cases | Backend Endpoints | Frontend Components |
|-------|-----------|-------------------|-------------------|
| Autentikasi | 6 | 4 | 4 |
| Parking Core | 8 | 6 | 3 |
| Violation & Override | 8 | 3 | 2 |
| Notifikasi | 7 | 5 | 2 |
| Staff Operations | 5 | 6 | 3 |
| Admin Management | 8 | 15 | 7 |
| Customer | 4 | 3 | 3 |
| AI Vision | 3 | 1 | 1 |
| WebSocket | 3 | — | 3 |
| E2E Flow | 3 | (kombinasi) | (kombinasi) |
| Edge Cases | 5 | 3 | — |
| **TOTAL** | **60** | **47** | **27** |

### Known Issues / Limitasi

1. **AI Vision `slot_code` hardcoded `"1A"`** — validate selalu untuk slot 1A, bukan slot aktual
2. **`AdminSlotManagementController@updateStatus` tidak broadcast** — perubahan status dari admin tidak terlihat di real-time
3. **`MemberStatusUpdated` event dead code** — tidak ada frontend listener
4. **Admin register terbuka** — tidak ada otorisasi untuk endpoint register admin
5. **Tidak ada rate limiting** pada endpoint login
6. **Frontend `isCustomerView` dikomentari di App.jsx:607** — guest view tidak membedakan customer view

---

*Cara menggunakan: Saat testing, isi kolom `Actual: PASS/FAIL` di setiap test case. Catat bug yang ditemukan di bagian notes masing-masing.*
