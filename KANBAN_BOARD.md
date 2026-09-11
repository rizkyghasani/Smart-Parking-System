# KANBAN BOARD — Smart Parking System

Dokumen ini menyajikan struktur Kanban Board yang digunakan dalam penelitian Smart Parking System. Berisi deskripsi naratif setiap kolom, konfigurasi Work In Progress (WIP) Limit, serta daftar Kanban Backlog Item beserta prioritasnya.

---

## A. Struktur Kanban Board (5 Kolom)

| # | Kolom | Fungsi | WIP Limit |
|---|-------|--------|-----------|
| 1 | **Backlog** | Menampung seluruh ide & fitur yang direncanakan (belum diprioritaskan) | Tanpa batas |
| 2 | **To Do** | Fitur yang telah diprioritaskan dan siap dikerjakan | Tanpa batas |
| 3 | **In Progress** | Fitur yang sedang dikerjakan secara aktif | **2 kartu** |
| 4 | **Review / Testing** | Fitur yang menunggu verifikasi dan pengujian | **2 kartu** |
| 5 | **Done** | Fitur yang telah selesai, teruji, dan dapat dipertanggungjawabkan | Tanpa batas |

> Penerapan **WIP Limit** pada kolom *In Progress* dan *Review/Testing* bertujuan mencegah pengerjaan banyak item sekaligus (multitasking berlebihan) sehingga fokus dan kualitas pengembangan terjaga — prinsip inti pendekatan Kanban.

---

## B. Deskripsi Naratif per Kolom

### 1. Backlog
Kanban Backlog menampung seluruh ide dan fitur yang direncanakan dalam penelitian. Seluruh item dikategorikan berdasarkan **Kanban Backlog Item** (nama fitur) disertai **ID berformat KB-xx**, **deskripsi**, dan **prioritas** (High/Medium/Low). Item pada kolom ini belum memiliki batasan pengerjaan (WIP) karena masih menunggu penetapan prioritas dan urutan pengerjaan.

### 2. To Do
Fitur-fitur yang telah diambil dari Backlog, diprioritaskan, dan siap untuk dikerjakan. Kolom ini menjadi jembatan antara Backlog dan proses pengerjaan aktif. Item To Do baru boleh berpindah ke kolom In Progress ketika kapasitas pengerjaan (WIP) masih tersedia.

### 3. In Progress (WIP)
Fitur yang sedang dikerjakan secara aktif. Sesuai prinsip Kanban, kolom ini diberi **Work In Progress Limit (WIP Limit) sebanyak 2 kartu**, sehingga pengerjaan difokuskan maksimal dua fitur dalam satu waktu untuk menjaga kualitas dan menghindari multitasking berlebihan.

### 4. Review / Testing
Fitur yang telah selesai dikerjakan dan menunggu proses verifikasi serta pengujian sebelum dinyatakan final. Pengujian dilakukan melalui serangkaian skenario test dan uji fungsional pada aplikasi. WIP Limit pada kolom ini juga dibatasi 2 kartu.

### 5. Done
Fitur yang telah lolos pengujian, berfungsi sesuai spesifikasi, dan dinyatakan selesai. Item yang masuk ke kolom ini dapat dipertanggungjawabkan dan dijelaskan sebagai hasil yang telah dicapai dalam penelitian.

---

## C. Kanban Backlog Item

### C.1 Backend — Autentikasi & Pengguna

| ID | Kanban Backlog Item | Deskripsi | Priority |
|----|--------------------|-----------|----------|
| KB-01 | Auth multi-role | Login & registrasi admin, staff, dan customer berbasis token menggunakan Laravel Sanctum beserta pengecekan role | High |
| KB-02 | Manajemen akun staff | Admin membuat akun petugas lapangan serta mengaktifkan/menonaktifkan statusnya | Medium |
| KB-03 | Manajemen member & customer | Admin melihat daftar, detail, aktivasi/deaktivasi membership, serta penghapusan akun customer | Medium |

### C.2 Backend — Parking Core

| ID | Kanban Backlog Item | Deskripsi | Priority |
|----|--------------------|-----------|----------|
| KB-04 | Manajemen slot parkir | CRUD (tambah, lihat, ubah, hapus) slot parkir beserta pengaturan status dan soft-delete | High |
| KB-05 | Alokasi slot Dijkstra | Perhitungan rute terpendek dari titik exit menggunakan algoritma Dijkstra pada graf node-edge untuk alokasi slot cerdas | High |
| KB-06 | Tap-in kendaraan | Pencatatan kendaraan masuk, alokasi otomatis slot, dan penguncian status slot menjadi occupied | High |
| KB-07 | Tap-out & perhitungan tarif | Pencatatan kendaraan keluar, perhitungan durasi dan biaya berdasarkan tarif aktif, lalu pelepasan slot | High |
| KB-08 | Manajemen tarif | Pengelolaan tarif parkir per jam beserta masa berlaku konfigurasi | High |
| KB-09 | Simulasi sensor | Pengujian sinkronisasi posisi kendaraan dan deteksi ketidaksesuaian slot (basis pelanggaran) | Medium |

### C.3 Violation & Override

| ID | Kanban Backlog Item | Deskripsi | Priority |
|----|--------------------|-----------|----------|
| KB-10 | Deteksi pelanggaran slot | Validasi posisi kendaraan dari AI sehingga slot berstatus violation dengan penanda `is_violation` dan `detected_slot_id` | High |
| KB-11 | Override pelanggaran oleh petugas | Petugas mengoreksi alokasi slot yang salah dan mereset status pelanggaran ke kondisi normal | High |
| KB-12 | Proteksi tap-out pada slot violation | Mencegah proses tap-out pada slot berstatus pelanggaran sampai dilakukan override (respon 403) | High |

### C.4 Notifikasi & Real-time

| ID | Kanban Backlog Item | Deskripsi | Priority |
|----|--------------------|-----------|----------|
| KB-13 | Notifikasi real-time WebSocket | Penyiaran (broadcast) perubahan status slot secara real-time ke antarmuka melalui Reverb/WebSocket | High |
| KB-14 | Pusat notifikasi | Inbox notifikasi untuk staff dan admin; tandai-dibaca, hapus semua, serta eskalasi/retrigger | Medium |
| KB-15 | Permintaan tap-out manual | Customer/guest meminta bantuan petugas untuk tap-out manual yang terkirim sebagai notifikasi | Medium |
| KB-16 | Verifikasi tap-out manual | Petugas memverifikasi identitas kendaraan dan memproses tap-out manual | Medium |

### C.5 Admin Dashboard & Laporan

| ID | Kanban Backlog Item | Deskripsi | Priority |
|----|--------------------|-----------|----------|
| KB-17 | Dashboard statistik admin | Ringkasan dan statistik kondisi sistem parkir untuk tampilan admin | Medium |
| KB-18 | Riwayat transaksi admin | Daftar dan pencarian riwayat transaksi parkir oleh admin | Medium |

### C.6 AI Vision

| ID | Kanban Backlog Item | Deskripsi | Priority |
|----|--------------------|-----------|----------|
| KB-19 | Deteksi kendaraan YOLOv8 | Deteksi objek kendaraan pada frame dari kamera laptop menggunakan model YOLOv8 | High |
| KB-20 | OCR plat EasyOCR | Pengenalan karakter plat nomor dengan EasyOCR dan filter format plat Indonesia | High |
| KB-21 | Integrasi AI ke backend | Pengiriman hasil deteksi dan plat nomor ke endpoint validasi Laravel | High |
| KB-22 | Optimasi inference & caching model | Optimalisasi runtime torch untuk arsitektur ARM64 beserta caching model EasyOCR | Medium |

### C.7 Frontend

| ID | Kanban Backlog Item | Deskripsi | Priority |
|----|--------------------|-----------|----------|
| KB-23 | Dashboard real-time | Aplikasi SPA React dengan denah parkir interaktif dan pembaruan data real-time | High |
| KB-24 | Panel Admin | Antarmuka pengelolaan slot, staff, member, tarif, dan notifikasi | High |
| KB-25 | Panel Staff | Denah operasional, tap-out manual, override, notifikasi, dan verifikasi | High |
| KB-26 | Panel Customer | Halaman dashboard serta tap-in/tap-out mobile untuk pelanggan | Medium |

---

## D. Ringkasan Prioritas

| Priority | Jumlah Kartu | ID Kartu |
|----------|--------------|----------|
| High | 16 | KB-01, 04, 05, 06, 07, 08, 10, 11, 12, 13, 19, 20, 21, 23, 24, 25 |
| Medium | 10 | KB-02, 03, 09, 14, 15, 16, 17, 18, 22, 26 |
| **Total** | **26** | KB-01 s/d KB-26 |
