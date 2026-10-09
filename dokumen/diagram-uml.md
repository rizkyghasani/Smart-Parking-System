# Diagram UML — Smart Parking System

Kumpulan diagram *Activity* dan *Sequence* (format **Mermaid**) untuk skripsi.
Setiap blok dapat disalin langsung ke editor Mermaid (mermaid.live / VS Code) atau
dirender untuk dimasukkan ke dokumen. Semua diagram memakai gaya **hitam-putih**
(isi putih, garis & teks hitam) dan garis penghubung **lurus/patah** (orthogonal).

Hasil render tersedia di folder `dokumen/gambar/` dengan penamaan
`diagram-<no>-<tipe>-<judul>.svg` (vektor) dan `.png` (raster resolusi tinggi).

Daftar diagram:

- [1. Activity — Login & Autentikasi Role](#1-activity--login--autentikasi-role)
- [2. Activity — Transaksi Masuk (Tap-In)](#2-activity--transaksi-masuk-tap-in)
- [3. Activity — Transaksi Keluar (Tap-Out)](#3-activity--transaksi-keluar-tap-out)
- [4. Activity — Simulasi Pelanggaran & Override Slot](#4-activity--simulasi-pelanggaran--override-slot)
- [5. Sequence — Login & Autentikasi Role](#5-sequence--login--autentikasi-role)
- [6. Sequence — Transaksi Masuk & Keluar](#6-sequence--transaksi-masuk--keluar)
- [7. Sequence — Simulasi Pelanggaran & Override Slot](#7-sequence--simulasi-pelanggaran--override-slot)

---

## 1. Activity — Login & Autentikasi Role

Alur autentikasi pengguna berdasarkan peran (Admin / Staff / Customer) beserta
penerbitan token dan pengalihan ke dashboard masing-masing.

```mermaid
%%{
  init: {
    "theme": "neutral",
    "themeCSS": ".node rect,.node circle,.node ellipse,.node polygon,.node path{fill:#ffffff!important;stroke:#000000!important;} .actor{fill:#ffffff!important;stroke:#000000!important;stroke-width:1!important;} .actor-top{fill:#ffffff!important;} .actor-bottom{fill:#ffffff!important;} .actor-line{stroke:#000000!important;} .note{fill:#ffffff!important;stroke:#000000!important;} .noteText{fill:#000000!important;} .messageLine0{stroke:#000000!important;} .messageLine1{stroke:#000000!important;} .messageText{fill:#000000!important;} .labelText{fill:#000000!important;} .loopText{fill:#000000!important;} #sequenceNumber{fill:#000000!important;} .sequenceNumber{fill:#000000!important;} .arrowheadPath{fill:#000000!important;} .error-icon{fill:#000000!important;} .error-text{fill:#000000!important;}",
    "themeVariables": {
      "background": "#ffffff",
      "primaryColor": "#ffffff",
      "primaryBorderColor": "#000000",
      "primaryTextColor": "#000000",
      "secondaryColor": "#ffffff",
      "secondaryBorderColor": "#000000",
      "secondaryTextColor": "#000000",
      "tertiaryColor": "#ffffff",
      "tertiaryBorderColor": "#000000",
      "tertiaryTextColor": "#000000",
      "lineColor": "#000000",
      "textColor": "#000000",
      "edgeLabelBackground": "#ffffff",
      "nodeBorder": "#000000",
      "nodeTextColor": "#000000",
      "clusterBkg": "#ffffff",
      "clusterBorder": "#000000",
      "titleColor": "#000000",
      "actorBkg": "#ffffff",
      "actorBorder": "#000000",
      "actorTextColor": "#000000",
      "actorLineColor": "#000000",
      "signalColor": "#000000",
      "signalTextColor": "#000000",
      "labelBoxBkgColor": "#ffffff",
      "labelBoxBorderColor": "#000000",
      "labelTextColor": "#000000",
      "loopTextColor": "#000000",
      "noteBkgColor": "#ffffff",
      "noteBorderColor": "#000000",
      "noteTextColor": "#000000",
      "activationBkgColor": "#ffffff",
      "activationBorderColor": "#000000",
      "sequenceNumberColor": "#000000"
    },
    "flowchart": { "curve": "linear" }
  }
}%%




flowchart TD
    A([Mulai]) --> B[Pilih portal login Admin / Staff / Customer]
    B --> C[Input email & password]
    C --> D{Kredensial valid?}
    D -- Gagal --> E[Tampilkan pesan email/password salah]
    E --> C
    D -- Berhasil --> F[Terbitkan token Sanctum]
    F --> G{Identifikasi peran}
    G -- Admin --> H[Buka Dashboard Admin]
    G -- Staff --> I[Buka Dashboard Staff]
    G -- Customer --> J[Buka Dashboard Customer]
    H --> K[Lakukan aktivitas sesuai peran]
    I --> K
    J --> K
    K --> L{Mau keluar?}
    L -- Ya --> M[Logout - hapus token]
    L -- Tidak --> K
    M --> N([Selesai])
```

---

## 2. Activity — Transaksi Masuk (Tap-In)

Alur kendaraan masuk ke area parkir: identifikasi plat, pemilihan slot kosong
terbaik, hingga konfirmasi alokasi slot.

```mermaid
%%{
  init: {
    "theme": "neutral",
    "themeCSS": ".node rect,.node circle,.node ellipse,.node polygon,.node path{fill:#ffffff!important;stroke:#000000!important;} .actor{fill:#ffffff!important;stroke:#000000!important;stroke-width:1!important;} .actor-top{fill:#ffffff!important;} .actor-bottom{fill:#ffffff!important;} .actor-line{stroke:#000000!important;} .note{fill:#ffffff!important;stroke:#000000!important;} .noteText{fill:#000000!important;} .messageLine0{stroke:#000000!important;} .messageLine1{stroke:#000000!important;} .messageText{fill:#000000!important;} .labelText{fill:#000000!important;} .loopText{fill:#000000!important;} #sequenceNumber{fill:#000000!important;} .sequenceNumber{fill:#000000!important;} .arrowheadPath{fill:#000000!important;} .error-icon{fill:#000000!important;} .error-text{fill:#000000!important;}",
    "themeVariables": {
      "background": "#ffffff",
      "primaryColor": "#ffffff",
      "primaryBorderColor": "#000000",
      "primaryTextColor": "#000000",
      "secondaryColor": "#ffffff",
      "secondaryBorderColor": "#000000",
      "secondaryTextColor": "#000000",
      "tertiaryColor": "#ffffff",
      "tertiaryBorderColor": "#000000",
      "tertiaryTextColor": "#000000",
      "lineColor": "#000000",
      "textColor": "#000000",
      "edgeLabelBackground": "#ffffff",
      "nodeBorder": "#000000",
      "nodeTextColor": "#000000",
      "clusterBkg": "#ffffff",
      "clusterBorder": "#000000",
      "titleColor": "#000000",
      "actorBkg": "#ffffff",
      "actorBorder": "#000000",
      "actorTextColor": "#000000",
      "actorLineColor": "#000000",
      "signalColor": "#000000",
      "signalTextColor": "#000000",
      "labelBoxBkgColor": "#ffffff",
      "labelBoxBorderColor": "#000000",
      "labelTextColor": "#000000",
      "loopTextColor": "#000000",
      "noteBkgColor": "#ffffff",
      "noteBorderColor": "#000000",
      "noteTextColor": "#000000",
      "activationBkgColor": "#ffffff",
      "activationBorderColor": "#000000",
      "sequenceNumberColor": "#000000"
    },
    "flowchart": { "curve": "linear" }
  }
}%%




flowchart TD
    A([Mulai]) --> B[Kendaraan tiba di gerbang]
    B --> C{Plat nomor terbaca?}
    C -- Terbaca --> D[Plat nomor teridentifikasi]
    C -- Tidak terbaca --> E[Pilih opsi tanpa plat]
    D --> F[Tekan tombol Tap-In]
    E --> F
    F --> G[Kirim POST /parking/tap-in]
    G --> H[Cari slot kosong terbaik]
    H --> I[Alokasi slot menjadi occupied]
    I --> J[Buat transaksi parkir]
    J --> K[Tampilkan modal konfirmasi alokasi]
    K --> L([Selesai])
```

---

## 3. Activity — Transaksi Keluar (Tap-Out)

Alur kendaraan keluar: validasi transaksi aktif, pengecekan status pelanggaran,
penghitungan durasi & biaya, hingga penerbitan kuitansi.

```mermaid
%%{
  init: {
    "theme": "neutral",
    "themeCSS": ".node rect,.node circle,.node ellipse,.node polygon,.node path{fill:#ffffff!important;stroke:#000000!important;} .actor{fill:#ffffff!important;stroke:#000000!important;stroke-width:1!important;} .actor-top{fill:#ffffff!important;} .actor-bottom{fill:#ffffff!important;} .actor-line{stroke:#000000!important;} .note{fill:#ffffff!important;stroke:#000000!important;} .noteText{fill:#000000!important;} .messageLine0{stroke:#000000!important;} .messageLine1{stroke:#000000!important;} .messageText{fill:#000000!important;} .labelText{fill:#000000!important;} .loopText{fill:#000000!important;} #sequenceNumber{fill:#000000!important;} .sequenceNumber{fill:#000000!important;} .arrowheadPath{fill:#000000!important;} .error-icon{fill:#000000!important;} .error-text{fill:#000000!important;}",
    "themeVariables": {
      "background": "#ffffff",
      "primaryColor": "#ffffff",
      "primaryBorderColor": "#000000",
      "primaryTextColor": "#000000",
      "secondaryColor": "#ffffff",
      "secondaryBorderColor": "#000000",
      "secondaryTextColor": "#000000",
      "tertiaryColor": "#ffffff",
      "tertiaryBorderColor": "#000000",
      "tertiaryTextColor": "#000000",
      "lineColor": "#000000",
      "textColor": "#000000",
      "edgeLabelBackground": "#ffffff",
      "nodeBorder": "#000000",
      "nodeTextColor": "#000000",
      "clusterBkg": "#ffffff",
      "clusterBorder": "#000000",
      "titleColor": "#000000",
      "actorBkg": "#ffffff",
      "actorBorder": "#000000",
      "actorTextColor": "#000000",
      "actorLineColor": "#000000",
      "signalColor": "#000000",
      "signalTextColor": "#000000",
      "labelBoxBkgColor": "#ffffff",
      "labelBoxBorderColor": "#000000",
      "labelTextColor": "#000000",
      "loopTextColor": "#000000",
      "noteBkgColor": "#ffffff",
      "noteBorderColor": "#000000",
      "noteTextColor": "#000000",
      "activationBkgColor": "#ffffff",
      "activationBorderColor": "#000000",
      "sequenceNumberColor": "#000000"
    },
    "flowchart": { "curve": "linear" }
  }
}%%




flowchart TD
    A([Mulai]) --> B[Pilih slot kendaraan yang keluar]
    B --> C[Kirim POST /parking/tap-out]
    C --> D{Transaksi aktif ditemukan?}
    D -- Tidak --> E[Tampilkan pesan transaksi tidak ditemukan]
    E --> B
    D -- Ya --> F{Transaksi berstatus pelanggaran?}
    F -- Ya --> G[Tampilkan tap-out terkunci menunggu override]
    G --> H[Staff melakukan override slot]
    H --> I[Hitung durasi & biaya parkir]
    F -- Tidak --> I
    I --> J[Status slot menjadi available]
    J --> K[Tandai transaksi selesai]
    K --> L[Tampilkan kuitansi & total biaya]
    L --> M([Selesai])
```

> Alternatif: Customer dapat mengajukan permintaan tap-out manual
> (`request-manual-tapout`) yang kemudian diverifikasi oleh staff.

---

## 4. Activity — Simulasi Pelanggaran & Override Slot

Alur simulasi pelanggaran lokasi saat kendaraan parkir di luar alokasi, notifikasi
ke staff, penguncian tap-out, hingga unlock setelah override.

```mermaid
%%{
  init: {
    "theme": "neutral",
    "themeCSS": ".node rect,.node circle,.node ellipse,.node polygon,.node path{fill:#ffffff!important;stroke:#000000!important;} .actor{fill:#ffffff!important;stroke:#000000!important;stroke-width:1!important;} .actor-top{fill:#ffffff!important;} .actor-bottom{fill:#ffffff!important;} .actor-line{stroke:#000000!important;} .note{fill:#ffffff!important;stroke:#000000!important;} .noteText{fill:#000000!important;} .messageLine0{stroke:#000000!important;} .messageLine1{stroke:#000000!important;} .messageText{fill:#000000!important;} .labelText{fill:#000000!important;} .loopText{fill:#000000!important;} #sequenceNumber{fill:#000000!important;} .sequenceNumber{fill:#000000!important;} .arrowheadPath{fill:#000000!important;} .error-icon{fill:#000000!important;} .error-text{fill:#000000!important;}",
    "themeVariables": {
      "background": "#ffffff",
      "primaryColor": "#ffffff",
      "primaryBorderColor": "#000000",
      "primaryTextColor": "#000000",
      "secondaryColor": "#ffffff",
      "secondaryBorderColor": "#000000",
      "secondaryTextColor": "#000000",
      "tertiaryColor": "#ffffff",
      "tertiaryBorderColor": "#000000",
      "tertiaryTextColor": "#000000",
      "lineColor": "#000000",
      "textColor": "#000000",
      "edgeLabelBackground": "#ffffff",
      "nodeBorder": "#000000",
      "nodeTextColor": "#000000",
      "clusterBkg": "#ffffff",
      "clusterBorder": "#000000",
      "titleColor": "#000000",
      "actorBkg": "#ffffff",
      "actorBorder": "#000000",
      "actorTextColor": "#000000",
      "actorLineColor": "#000000",
      "signalColor": "#000000",
      "signalTextColor": "#000000",
      "labelBoxBkgColor": "#ffffff",
      "labelBoxBorderColor": "#000000",
      "labelTextColor": "#000000",
      "loopTextColor": "#000000",
      "noteBkgColor": "#ffffff",
      "noteBorderColor": "#000000",
      "noteTextColor": "#000000",
      "activationBkgColor": "#ffffff",
      "activationBorderColor": "#000000",
      "sequenceNumberColor": "#000000"
    },
    "flowchart": { "curve": "linear" }
  }
}%%




flowchart TD
    A([Mulai]) --> B[Tap-in kendaraan selesai]
    B --> C{Aktifkan Mode Pilih Slot Lain?}
    C -- Tidak --> D[Parkir sesuai alokasi - selesai]
    C -- Ya --> E[Aktifkan mode pilih slot lain]
    E --> F[Petugas klik slot kosong lain pada denah]
    F --> G{Slot terpilih = slot alokasi?}
    G -- Sama --> H[Sistem anggap parkir normal]
    H --> U([Selesai])
    G -- Berbeda --> I[Kirim POST /parking/simulate-sensor]
    I --> J[Tandai transaksi is_violation = true]
    J --> K[Status slot terdeteksi menjadi violation]
    K --> L[Broadcast SlotUpdated + notifikasi staff]
    L --> M[Point 1: tampilkan pelanggaran di denah]
    L --> N[Point 2: kunci tap-out transaksi]
    M --> O[Staff menerima notifikasi pelanggaran lokasi]
    N --> O
    O --> P[Staff verifikasi di LiveSlotMonitor]
    P --> Q[Staff klik Override Slot]
    Q --> R[Kirim POST /staff/override-slot]
    R --> S[Alokasi lama menjadi available]
    S --> T[Unlock otomatis - alokasi pindah ke slot terdeteksi]
    T --> V([Selesai])
```

---

## 5. Sequence — Login & Autentikasi Role

Interaksi antarmuka portal, controller autentikasi, dan database untuk masuk
(login) dan keluar (logout) berdasarkan peran.

```mermaid
%%{
  init: {
    "theme": "neutral",
    "themeCSS": ".node rect,.node circle,.node ellipse,.node polygon,.node path{fill:#ffffff!important;stroke:#000000!important;} .actor{fill:#ffffff!important;stroke:#000000!important;stroke-width:1!important;} .actor-top{fill:#ffffff!important;} .actor-bottom{fill:#ffffff!important;} .actor-line{stroke:#000000!important;} .note{fill:#ffffff!important;stroke:#000000!important;} .noteText{fill:#000000!important;} .messageLine0{stroke:#000000!important;} .messageLine1{stroke:#000000!important;} .messageText{fill:#000000!important;} .labelText{fill:#000000!important;} .loopText{fill:#000000!important;} #sequenceNumber{fill:#000000!important;} .sequenceNumber{fill:#000000!important;} .arrowheadPath{fill:#000000!important;} .error-icon{fill:#000000!important;} .error-text{fill:#000000!important;}",
    "themeVariables": {
      "background": "#ffffff",
      "primaryColor": "#ffffff",
      "primaryBorderColor": "#000000",
      "primaryTextColor": "#000000",
      "secondaryColor": "#ffffff",
      "secondaryBorderColor": "#000000",
      "secondaryTextColor": "#000000",
      "tertiaryColor": "#ffffff",
      "tertiaryBorderColor": "#000000",
      "tertiaryTextColor": "#000000",
      "lineColor": "#000000",
      "textColor": "#000000",
      "edgeLabelBackground": "#ffffff",
      "nodeBorder": "#000000",
      "nodeTextColor": "#000000",
      "clusterBkg": "#ffffff",
      "clusterBorder": "#000000",
      "titleColor": "#000000",
      "actorBkg": "#ffffff",
      "actorBorder": "#000000",
      "actorTextColor": "#000000",
      "actorLineColor": "#000000",
      "signalColor": "#000000",
      "signalTextColor": "#000000",
      "labelBoxBkgColor": "#ffffff",
      "labelBoxBorderColor": "#000000",
      "labelTextColor": "#000000",
      "loopTextColor": "#000000",
      "noteBkgColor": "#ffffff",
      "noteBorderColor": "#000000",
      "noteTextColor": "#000000",
      "activationBkgColor": "#ffffff",
      "activationBorderColor": "#000000",
      "sequenceNumberColor": "#000000"
    },
    "flowchart": { "curve": "linear" }
  }
}%%




sequenceDiagram
    actor Pengguna
    participant Portal as Portal Dashboard
    participant Auth as AuthController
    participant DB as Database

    Pengguna->>Portal: Pilih portal Admin / Staff / Customer
    Portal->>Auth: POST /login dengan email & password
    Auth->>DB: Cari user sesuai email
    DB-->>Auth: Data user & hash password

    alt Kredensial tidak valid
        Auth-->>Portal: 401 email/password salah
        Portal-->>Pengguna: Tampilkan pesan error
    else Kredensial valid
        Auth->>Auth: Verifikasi hash & identifikasi peran
        Auth->>Auth: Terbitkan token Sanctum
        Auth-->>Portal: 200 token + data peran
        Portal-->>Pengguna: Buka dashboard sesuai peran
    end

    Pengguna->>Portal: Pilih Logout
    Portal->>Auth: POST /logout
    Auth->>Auth: Hapus token aktif
    Auth-->>Portal: Logout berhasil
```

---

## 6. Sequence — Transaksi Masuk & Keluar

Interaksi petugas dengan konsol gerbang, controller, model transaksi & slot,
database, hingga sinkronisasi real-time ke dashboard staff.

```mermaid
%%{
  init: {
    "theme": "neutral",
    "themeCSS": ".node rect,.node circle,.node ellipse,.node polygon,.node path{fill:#ffffff!important;stroke:#000000!important;} .actor{fill:#ffffff!important;stroke:#000000!important;stroke-width:1!important;} .actor-top{fill:#ffffff!important;} .actor-bottom{fill:#ffffff!important;} .actor-line{stroke:#000000!important;} .note{fill:#ffffff!important;stroke:#000000!important;} .noteText{fill:#000000!important;} .messageLine0{stroke:#000000!important;} .messageLine1{stroke:#000000!important;} .messageText{fill:#000000!important;} .labelText{fill:#000000!important;} .loopText{fill:#000000!important;} #sequenceNumber{fill:#000000!important;} .sequenceNumber{fill:#000000!important;} .arrowheadPath{fill:#000000!important;} .error-icon{fill:#000000!important;} .error-text{fill:#000000!important;}",
    "themeVariables": {
      "background": "#ffffff",
      "primaryColor": "#ffffff",
      "primaryBorderColor": "#000000",
      "primaryTextColor": "#000000",
      "secondaryColor": "#ffffff",
      "secondaryBorderColor": "#000000",
      "secondaryTextColor": "#000000",
      "tertiaryColor": "#ffffff",
      "tertiaryBorderColor": "#000000",
      "tertiaryTextColor": "#000000",
      "lineColor": "#000000",
      "textColor": "#000000",
      "edgeLabelBackground": "#ffffff",
      "nodeBorder": "#000000",
      "nodeTextColor": "#000000",
      "clusterBkg": "#ffffff",
      "clusterBorder": "#000000",
      "titleColor": "#000000",
      "actorBkg": "#ffffff",
      "actorBorder": "#000000",
      "actorTextColor": "#000000",
      "actorLineColor": "#000000",
      "signalColor": "#000000",
      "signalTextColor": "#000000",
      "labelBoxBkgColor": "#ffffff",
      "labelBoxBorderColor": "#000000",
      "labelTextColor": "#000000",
      "loopTextColor": "#000000",
      "noteBkgColor": "#ffffff",
      "noteBorderColor": "#000000",
      "noteTextColor": "#000000",
      "activationBkgColor": "#ffffff",
      "activationBorderColor": "#000000",
      "sequenceNumberColor": "#000000"
    },
    "flowchart": { "curve": "linear" }
  }
}%%




sequenceDiagram
    actor Petugas
    participant Gate as Konsol Gerbang
    participant PC as ParkingController
    participant TX as ParkingTransaction
    participant SL as ParkingSlot
    participant DB as Database
    participant Pusher as Pusher Broadcast
    participant Staff as Dashboard Staff

    Petugas->>Gate: Klik Tap-In (dengan / tanpa plat)
    Gate->>PC: POST /parking/tap-in
    PC->>DB: Cari slot kosong terbaik
    DB-->>PC: Slot tersedia
    PC->>TX: Buat transaksi parkir
    PC->>SL: Status slot menjadi occupied
    PC-->>Gate: Data transaksi + alokasi slot
    Gate-->>Petugas: Tampilkan konfirmasi alokasi
    Gate->>Pusher: Broadcast SlotUpdated
    Pusher-->>Staff: Peta slot diperbarui real-time

    Note over Petugas,Staff: Kendaraan parkir untuk sementara waktu

    Petugas->>Gate: Klik slot untuk Tap-Out
    Gate->>PC: POST /parking/tap-out
    PC->>TX: Cek status transaksi aktif

    alt Tidak ada pelanggaran
        PC->>PC: Hitung durasi & biaya parkir
        PC->>SL: Status slot menjadi available
        PC->>TX: Tandai transaksi selesai
        PC-->>Gate: Data kuitansi plat, durasi, biaya
        Gate-->>Petugas: Tampilkan kuitansi lengkap
    else Transaksi berstatus pelanggaran terkunci
        PC-->>Gate: Tolak tap-out menunggu override
        Note over Gate,Staff: Dialihkan ke alur override pada Diagram 7
    end

    Gate->>Pusher: Broadcast SlotUpdated
    Pusher-->>Staff: Peta slot diperbarui real-time
```

---

## 7. Sequence — Simulasi Pelanggaran & Override Slot

Interaksi simulasi pelanggaran lokasi dari konsol gerbang, pencatatan violation,
pengiriman notifikasi ke staff, hingga proses override dan unlock otomatis.

```mermaid
%%{
  init: {
    "theme": "neutral",
    "themeCSS": ".node rect,.node circle,.node ellipse,.node polygon,.node path{fill:#ffffff!important;stroke:#000000!important;} .actor{fill:#ffffff!important;stroke:#000000!important;stroke-width:1!important;} .actor-top{fill:#ffffff!important;} .actor-bottom{fill:#ffffff!important;} .actor-line{stroke:#000000!important;} .note{fill:#ffffff!important;stroke:#000000!important;} .noteText{fill:#000000!important;} .messageLine0{stroke:#000000!important;} .messageLine1{stroke:#000000!important;} .messageText{fill:#000000!important;} .labelText{fill:#000000!important;} .loopText{fill:#000000!important;} #sequenceNumber{fill:#000000!important;} .sequenceNumber{fill:#000000!important;} .arrowheadPath{fill:#000000!important;} .error-icon{fill:#000000!important;} .error-text{fill:#000000!important;}",
    "themeVariables": {
      "background": "#ffffff",
      "primaryColor": "#ffffff",
      "primaryBorderColor": "#000000",
      "primaryTextColor": "#000000",
      "secondaryColor": "#ffffff",
      "secondaryBorderColor": "#000000",
      "secondaryTextColor": "#000000",
      "tertiaryColor": "#ffffff",
      "tertiaryBorderColor": "#000000",
      "tertiaryTextColor": "#000000",
      "lineColor": "#000000",
      "textColor": "#000000",
      "edgeLabelBackground": "#ffffff",
      "nodeBorder": "#000000",
      "nodeTextColor": "#000000",
      "clusterBkg": "#ffffff",
      "clusterBorder": "#000000",
      "titleColor": "#000000",
      "actorBkg": "#ffffff",
      "actorBorder": "#000000",
      "actorTextColor": "#000000",
      "actorLineColor": "#000000",
      "signalColor": "#000000",
      "signalTextColor": "#000000",
      "labelBoxBkgColor": "#ffffff",
      "labelBoxBorderColor": "#000000",
      "labelTextColor": "#000000",
      "loopTextColor": "#000000",
      "noteBkgColor": "#ffffff",
      "noteBorderColor": "#000000",
      "noteTextColor": "#000000",
      "activationBkgColor": "#ffffff",
      "activationBorderColor": "#000000",
      "sequenceNumberColor": "#000000"
    },
    "flowchart": { "curve": "linear" }
  }
}%%




sequenceDiagram
    actor Petugas
    participant Gate as Konsol Gerbang
    participant PC as ParkingController
    participant TX as ParkingTransaction
    participant SL as ParkingSlot
    participant DB as Database
    participant Pusher as Pusher Broadcast
    participant Staff as Dashboard Staff

    Petugas->>Gate: Aktifkan Mode Pilih Slot Lain
    Gate-->>Petugas: Klik slot kosong lain pada denah
    Petugas->>Gate: Pilih slot tujuan
    Gate->>PC: POST /parking/simulate-sensor dengan transaction_id & detected_slot_id
    PC->>DB: Ambil data transaksi & slot tujuan
    DB-->>PC: Data valid

    alt Slot terpilih sama dengan alokasi
        PC-->>Gate: Tidak ada pelanggaran - parkir normal
    else Slot terpilih berbeda dengan alokasi
        PC->>TX: Tandai is_violation = true
        PC->>SL: Status slot terdeteksi menjadi violation
        PC-->>Gate: Pelanggaran lokasi tercatat
        Gate->>Pusher: Broadcast update slot + notifikasi
        Pusher-->>Staff: Notifikasi Pelanggaran Lokasi
        Pusher-->>Gate: Denah menampilkan slot violation
        Gate-->>Petugas: Tap-out terkunci menunggu override
        Staff->>Staff: Verifikasi di LiveSlotMonitor
        Staff->>PC: POST /staff/override-slot
        PC->>TX: Pindahkan alokasi ke slot terdeteksi
        PC->>SL: Alokasi lama menjadi available
        PC-->>Staff: Override berhasil
        PC-->>Gate: Unlock otomatis transaksi
        Gate->>Pusher: Broadcast update slot terbaru
        Pusher-->>Staff: Status slot diperbarui
    end
```