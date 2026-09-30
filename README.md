# Kasir Warung UMKM

Implementasi lokal dari `prd.md` menggunakan JavaScript tanpa dependensi eksternal.

## Menjalankan di lokal

Prasyarat: Node.js 18 atau lebih baru.

```bash
npm start
```

Buka `http://localhost:3000` pada browser.

Data transaksi dan perubahan master data lokal disimpan pada `localStorage` browser. Gunakan menu **Pengaturan** untuk menghapus data demo dan memulai ulang.

### Jika muncul error `EADDRINUSE`

Error tersebut berarti port `3000` sedang digunakan, biasanya karena server sudah berjalan pada terminal lain. Jika aplikasi sudah dapat dibuka pada `http://localhost:3000`, tidak perlu menjalankan `npm start` lagi.

Untuk menggunakan port lain pada PowerShell:

```powershell
$env:PORT=3001
npm start
```

Lalu buka `http://localhost:3001`.

## Deploy ke GitHub Pages

Project ini sudah memiliki workflow [deploy-pages.yml](./.github/workflows/deploy-pages.yml). Workflow tersebut membuat site statis dari folder `public`, menyalin `code.js`, lalu melakukan deploy ke GitHub Pages.

### Mengaktifkan deployment

1. Push folder project ke branch `main` atau `master`.
2. Buka repository di GitHub, lalu pilih **Settings > Pages**.
3. Pada **Build and deployment > Source**, pilih **GitHub Actions**.
4. Buka tab **Actions** dan tunggu workflow **Deploy Kasir UMKM to GitHub Pages** selesai.
5. Buka URL Pages yang ditampilkan pada hasil workflow.

Path asset pada `public/index.html` sengaja menggunakan path relatif. Ini diperlukan agar aplikasi bekerja pada project site GitHub Pages, bukan hanya pada domain root.

### Batasan versi GitHub Pages

GitHub Pages hanya menyajikan file statis. Versi ini menggunakan `localStorage`, sehingga data transaksi dan stok hanya tersimpan pada browser/perangkat yang digunakan. Data belum menjadi database bersama antar-kasir.

Untuk penggunaan produksi dengan data terpusat, frontend GitHub Pages perlu dihubungkan ke Google Apps Script Web App atau backend API. File `code.js` menyediakan fungsi Apps Script yang dapat dipindahkan ke `Code.gs`, tetapi GitHub Pages tidak menjalankan Apps Script secara langsung.

## Struktur file

- `server.js`: server static lokal berbasis Node.js bawaan.
- `public/index.html`: struktur halaman aplikasi.
- `public/app.js`: antarmuka, navigasi, form, dan interaksi lokal.
- `public/styles.css`: tampilan responsif.
- `code.js`: logika bisnis dan adapter Google Apps Script. File ini dapat disalin ke Apps Script sebagai `code.gs`.
- `prd.md`: Product Requirements Document.

## Menyalin ke Google Apps Script

1. Buat project Apps Script baru.
2. Buka file `Code.gs`, hapus seluruh isi lama, lalu salin seluruh isi `code.js`.
3. Klik **Save project** atau tekan `Ctrl+S`, kemudian refresh halaman Apps Script.
4. Pada dropdown fungsi di sebelah tombol **Run**, pilih `setupSpreadsheet`.
5. Jalankan `setupSpreadsheet()` sekali untuk membuat header sheet dan berikan izin akses jika diminta.
6. Buat file HTML dengan nama **Index** (huruf `I` besar), lalu salin isi `public/index.html`.
7. File CSS dan JavaScript browser harus dimasukkan ke HTML Apps Script atau dipisahkan sebagai file HTML include. Jangan menyimpan JavaScript browser sebagai file `.gs`; file `.gs` hanya untuk kode server Apps Script.
8. Deploy sebagai Web App dan batasi akses sesuai akun kasir.

Setelah `code.js` diganti, fungsi berikut harus muncul pada dropdown Apps Script:

- `doGet`
- `setupSpreadsheet`
- `getBootstrapData`
- `saveSale`
- `saveProduct`
- `saveCategory`
- `saveCustomer`
- `recordStockMovement`

Jika dropdown masih menampilkan **No functions**, pastikan isi `Code.gs` dimulai dengan deklarasi `var KasirBackend` dan memiliki deklarasi tingkat atas seperti `function setupSpreadsheet()`. Simpan file, refresh editor, dan pastikan tidak ada kode yang hanya ditempel sebagai komentar.

Adapter Apps Script yang tersedia pada `code.js`:

- `doGet()` menggunakan file HTML `Index`
- `setupSpreadsheet()`
- `getBootstrapData()`
- `saveSale(payload)`
- `saveProduct(product)`
- `saveCategory(category)`
- `saveCustomer(customer)`
- `recordStockMovement(payload)`

Versi lokal sengaja menggunakan `localStorage` supaya dapat diuji tanpa kredensial Google dan tanpa spreadsheet. Sebelum produksi, lakukan pengujian konkurensi, backup, hak akses, dan rekonsiliasi pembayaran QRIS.
