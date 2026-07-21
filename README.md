<div align="center">

# 💰 Kas Kantin Lontong
### *Aplikasi Pencatat Keuangan Usaha Kantin/Lontong*

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://www.android.com)

> Aplikasi pencatat keuangan offline untuk usaha kecil (lontong/kantin) — mencatat pendapatan, pengeluaran, tabungan, dan rekap otomatis. **Semua data tersimpan hanya di HP**, tanpa login, tanpa internet.

### 🌐 [Coba Demo →](GANTI_DENGAN_LINK_DEMO_ANDA)

</div>

---

## ✨ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 💵 **Pendapatan** | Catat uang masuk dari jualan, bisa dirinci per item |
| 🧾 **Pengeluaran** | Catat uang keluar untuk belanja bahan, dll |
| 🏦 **Ditabung** | Catat uang yang disisihkan untuk tabungan |
| 👨‍👩‍👧 **Kiriman ke Anak** | Catat uang yang dikirim ke anak |
| 🏛️ **Bantuan Pemerintah** | Catat uang bantuan yang diterima |
| 📊 **Rekap Harian/Bulanan/Tahunan** | Lihat ringkasan keuangan per periode |
| 📈 **Statistik Penjualan** | Ranking item terlaris berdasarkan omzet |
| 💾 **Backup & Restore** | Simpan/pulihkan data lewat teks, tanpa server |

---

## 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| React Native | Framework aplikasi mobile |
| Expo | Tooling development & build APK |
| AsyncStorage | Penyimpanan data lokal di HP |
| JavaScript | Bahasa pemrograman utama |

---

## 📁 Struktur File

```
kantin-app/
├── App.js                        # Navigasi utama aplikasi
├── app.json                      # Konfigurasi nama app, ikon, dll
├── package.json                  # Daftar library yang dipakai
└── src/
    ├── context/DataContext.js    # State management data transaksi
    ├── utils/storage.js          # Penyimpanan lokal (AsyncStorage)
    ├── utils/kalkulasi.js        # Semua rumus rekap & statistik
    ├── components/               # Komponen UI yang dipakai berulang
    └── screens/
        ├── BerandaScreen.js
        ├── TambahTransaksiScreen.js
        ├── RekapScreen.js
        ├── StatistikScreen.js
        ├── RiwayatScreen.js
        └── PengaturanScreen.js
```

---

## 🚀 Cara Menjalankan

```bash
npm install
npx expo start
```

Scan QR code yang muncul memakai aplikasi **Expo Go** (Android) — aplikasi
langsung terbuka di HP tanpa perlu build APK dulu.

Ingin build jadi file APK yang bisa diinstall langsung, atau belum familiar
dengan Node.js/Terminal sama sekali? Lihat panduan lengkap langkah demi
langkah di bawah 👇

---

## 📖 Panduan Instalasi Lengkap (Untuk Pemula)

<details>
<summary>Klik untuk membuka panduan lengkap</summary>

### Langkah 1 — Install Node.js

1. Buka https://nodejs.org
2. Download & install versi **LTS** (yang direkomendasikan)
3. Cek berhasil dengan buka Command Prompt / Terminal, ketik:
   ```
   node -v
   ```
   Kalau muncul angka versi (misal `v20.x.x`), berarti berhasil.

### Langkah 2 — Buka Folder Project

Ekstrak/pindahkan folder `kantin-app` ini ke laptop Anda, lalu buka
Terminal / Command Prompt di dalam folder tersebut.

### Langkah 3 — Install Semua Kebutuhan Aplikasi

```
npm install
```
Tunggu sampai selesai (tergantung koneksi internet, biasanya 2-5 menit).

### Langkah 4 — Coba Dulu di HP Anda

1. Install aplikasi **Expo Go** dari Play Store di HP Android Anda.
2. Di laptop, jalankan:
   ```
   npx expo start
   ```
3. Scan QR Code yang muncul dengan app **Expo Go** di HP.
4. Aplikasi langsung terbuka di HP untuk dicoba — gratis dan tanpa
   batas, cocok dipakai berulang kali selama masa uji coba.

### Langkah 5 — Build Menjadi File APK

Pakai layanan resmi **EAS Build** dari Expo (gratis 15 build/bulan,
hanya perlu daftar akun Expo — akun ini cuma untuk proses build,
BUKAN login di dalam aplikasinya).

```
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

Proses build berjalan di server Expo, biasanya 10-20 menit. Setelah
selesai, muncul **link download APK** di terminal — download, kirim
ke HP, lalu install (aktifkan "Izinkan sumber tidak dikenal" jika
diminta).

### Langkah 6 — Membuat Link Demo Web (Opsional)

```
npx expo export --platform web
eas deploy
```

Setelah selesai, akan muncul URL seperti `https://nama-project.expo.app`.
Salin URL tersebut, lalu tempel menggantikan `GANTI_DENGAN_LINK_DEMO_ANDA`
di bagian atas README ini.

</details>

---

## 💾 Backup Data

Buka tab **Pengaturan** → **Bagikan / Backup Data** untuk menyimpan
salinan data (kirim ke WhatsApp/email pribadi). Jika ganti HP atau
install ulang, gunakan **Pulihkan Data (Import)** dan tempel teks
backup tersebut.

## 🎨 Mengganti Nama & Ikon Aplikasi

- Nama aplikasi: ubah `"name"` di file `app.json`.
- Ikon aplikasi: ganti file di folder `assets/` (gambar persegi
  1024x1024 piksel, format PNG, nama `icon.png` dan
  `adaptive-icon.png`), sesuaikan path di `app.json` bila perlu.

---

<div align="center">

© 2026 Kas Kantin Lontong · Dibuat untuk membantu pencatatan usaha kecil

Made by [hayqalbanihakim212-crypto](https://github.com/hayqalbanihakim212-crypto)

</div>
