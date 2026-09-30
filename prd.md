# Product Requirements Document (PRD)

## Aplikasi Kasir Warung UMKM Berbasis Google Spreadsheet dan Google Apps Script

**Versi:** 1.0  
**Tanggal:** 30 September 2026  
**Status:** Draft untuk implementasi  
**Target pengguna:** Warung UMKM menengah, pemilik usaha, kasir, dan supervisor

---

## 1. Ringkasan Produk

Aplikasi ini adalah sistem kasir ringan berbasis **Google Spreadsheet** dan **Google Apps Script** untuk membantu warung UMKM menengah mengelola transaksi penjualan, stok, kategori barang, pelanggan, pembayaran QRIS, dan laporan usaha secara terintegrasi.

Google Spreadsheet digunakan sebagai penyimpanan data dan media administrasi yang mudah dipahami pemilik usaha. Google Apps Script digunakan untuk membangun antarmuka kasir, validasi data, otomatisasi stok, pencetakan struk, pembuatan laporan, notifikasi, dan integrasi pembayaran yang tersedia.

Aplikasi harus tetap mudah digunakan oleh pengguna nonteknis, dapat diakses melalui browser, dan memiliki struktur data yang dapat dikembangkan tanpa migrasi database yang kompleks.

## 2. Tujuan Produk

1. Mempercepat proses transaksi di kasir.
2. Mengurangi kesalahan pencatatan penjualan dan perhitungan stok.
3. Menyediakan satu sumber data untuk barang, pelanggan, transaksi, dan laporan.
4. Membantu pemilik memantau omzet, laba kotor, produk terlaris, dan kondisi stok.
5. Menyediakan opsi pembayaran tunai, transfer, dan QRIS.
6. Menjaga biaya operasional tetap rendah dengan memanfaatkan Google Workspace.
7. Menyediakan fondasi yang dapat dikembangkan menjadi sistem multi-kasir atau multi-cabang.

## 3. Sasaran dan Indikator Keberhasilan

### 3.1 Sasaran

- Kasir baru dapat melakukan transaksi setelah mendapat pelatihan singkat.
- Pemilik dapat melihat ringkasan penjualan harian tanpa merekap manual.
- Stok berkurang otomatis setelah transaksi berhasil.
- Selisih stok dapat ditelusuri melalui riwayat penyesuaian.
- Data transaksi tetap dapat ditemukan berdasarkan nomor transaksi, tanggal, kasir, pelanggan, atau metode pembayaran.

### 3.2 Indikator keberhasilan

- Waktu pembuatan transaksi standar maksimal 60 detik, tidak termasuk antrean pembayaran.
- Kesalahan input harga atau jumlah berkurang karena harga diambil dari master barang.
- 100% transaksi sukses menghasilkan nomor transaksi unik.
- Saldo stok pada sistem diperbarui otomatis untuk setiap penjualan, pembelian/restock, retur, dan penyesuaian.
- Laporan harian dapat dibuat tanpa pengolahan manual.
- Tidak ada transaksi yang dapat disimpan jika stok barang tidak mencukupi, kecuali pengguna berwenang mengaktifkan penjualan stok minus.

## 4. Ruang Lingkup

### 4.1 Dalam ruang lingkup

- Point of Sale (POS).
- Manajemen stok barang.
- Manajemen kategori barang.
- Manajemen pelanggan.
- Laporan usaha lengkap.
- Pembayaran tunai, transfer, dan QRIS melalui QR statis atau integrasi yang tersedia.
- Manajemen pengguna dan hak akses dasar.
- Pengaturan toko dan format struk.
- Audit trail untuk perubahan penting.
- Backup dan pemulihan data berbasis Google Spreadsheet.

### 4.2 Di luar ruang lingkup versi awal

- Integrasi langsung dengan seluruh penyedia payment gateway.
- Akuntansi penuh, jurnal berpasangan, dan rekonsiliasi bank otomatis.
- Manajemen resep/BOM untuk produksi makanan.
- Sinkronisasi marketplace atau layanan pesan-antar.
- Aplikasi native Android/iOS.
- Pengiriman notifikasi WhatsApp berbayar secara otomatis.
- Pengelolaan pajak yang kompleks di luar konfigurasi pajak sederhana.

## 5. Persona dan Hak Akses

### 5.1 Pemilik/Admin

- Mengelola seluruh master data.
- Mengelola pengguna dan hak akses.
- Melihat seluruh transaksi dan laporan.
- Melakukan koreksi, retur, pembatalan, dan penyesuaian stok dengan alasan.
- Mengatur QRIS, toko, pajak, diskon, dan format struk.

### 5.2 Supervisor

- Melihat transaksi dan laporan operasional.
- Mengelola barang, kategori, pelanggan, dan stok.
- Menyetujui pembatalan atau penyesuaian tertentu.
- Tidak dapat mengubah konfigurasi kritis atau menghapus data permanen.

### 5.3 Kasir

- Membuat transaksi penjualan.
- Mencari barang dan pelanggan.
- Menerima pembayaran.
- Mencetak atau membagikan struk.
- Melihat transaksi miliknya sesuai kebijakan toko.
- Tidak dapat mengubah harga master, menghapus transaksi, atau menyesuaikan stok tanpa otorisasi.

## 6. Fitur Utama

## 6.1 Point of Sale (POS)

### Deskripsi

Modul POS digunakan untuk membuat transaksi penjualan di kasir melalui antarmuka web Apps Script.

### Kebutuhan fungsional

1. Kasir dapat mencari barang berdasarkan:
   - Nama barang.
   - SKU/kode barang.
   - Barcode, apabila perangkat pemindai digunakan sebagai input keyboard.
   - Kategori.
2. Kasir dapat menambahkan barang ke keranjang.
3. Sistem menampilkan:
   - Nama barang.
   - Harga jual.
   - Jumlah.
   - Diskon per item jika diizinkan.
   - Subtotal per item.
   - Total transaksi.
4. Kasir dapat mengubah jumlah barang dan menghapus item dari keranjang.
5. Sistem memvalidasi stok sebelum transaksi disimpan dan kembali memvalidasi saat proses finalisasi.
6. Kasir dapat memilih pelanggan terdaftar atau menggunakan pelanggan umum.
7. Sistem mendukung diskon:
   - Diskon nominal.
   - Diskon persentase.
   - Diskon per item atau per transaksi sesuai konfigurasi.
8. Sistem mendukung pajak atau biaya tambahan yang dapat diaktifkan/nonaktifkan.
9. Sistem membuat nomor transaksi unik dengan format yang dapat dikonfigurasi, misalnya `TRX-20260930-0001`.
10. Kasir dapat memilih metode pembayaran:
    - Tunai.
    - Transfer bank.
    - QRIS.
    - Metode lain yang diaktifkan admin.
11. Untuk pembayaran tunai, sistem menghitung uang kembali.
12. Sistem mencatat status pembayaran:
    - Menunggu pembayaran.
    - Lunas.
    - Dibatalkan.
    - Direfund sebagian atau seluruhnya.
13. Transaksi yang berhasil:
    - Mengurangi stok.
    - Mencatat mutasi stok.
    - Menyimpan detail transaksi.
    - Menambah akumulasi pelanggan jika program loyalitas diaktifkan.
    - Menghasilkan struk.
14. Kasir dapat mencetak struk melalui dialog cetak browser atau menyimpan struk sebagai PDF.
15. Kasir dapat memulai transaksi baru setelah transaksi sebelumnya berhasil atau dibatalkan.
16. Sistem mencegah pengiriman formulir ganda dengan mekanisme idempotensi atau kunci transaksi.
17. Sistem menampilkan pesan kesalahan yang jelas jika penyimpanan transaksi gagal.

### Alur transaksi POS

1. Kasir membuka halaman POS.
2. Kasir memilih atau mencari barang.
3. Kasir mengatur jumlah, pelanggan, diskon, dan pajak.
4. Sistem menghitung subtotal dan total.
5. Kasir memilih metode pembayaran.
6. Kasir memasukkan nominal pembayaran atau mengonfirmasi pembayaran non-tunai.
7. Sistem memvalidasi keranjang, harga, stok, dan pembayaran.
8. Sistem menyimpan transaksi secara atomik.
9. Sistem mengurangi stok dan mencatat mutasi.
10. Sistem menampilkan struk dan opsi cetak.

### Aturan bisnis POS

- Harga transaksi disalin ke detail transaksi saat transaksi dibuat agar perubahan harga master tidak mengubah histori.
- Transaksi hanya dihitung sebagai penjualan jika statusnya `LUNAS`.
- Pembatalan setelah transaksi lunas membutuhkan alasan dan hak akses yang sesuai.
- Pembatalan mengembalikan stok sesuai jumlah yang dibatalkan.
- Produk non-stok dapat ditandai sebagai jasa atau barang tanpa pengurangan stok.
- Barang dengan status nonaktif tidak dapat dipilih pada transaksi baru.

## 6.2 Manajemen Stok Barang

### Deskripsi

Modul stok mengelola persediaan, perubahan kuantitas, batas minimum, dan histori mutasi barang.

### Kebutuhan fungsional

1. Admin dapat menambah, mengubah, menonaktifkan, dan melihat barang.
2. Data barang minimal meliputi:
   - ID barang.
   - SKU/kode barang.
   - Barcode.
   - Nama barang.
   - Kategori.
   - Satuan.
   - Harga beli terakhir.
   - Harga jual.
   - Stok saat ini.
   - Stok minimum.
   - Lokasi penyimpanan, jika digunakan.
   - Status aktif/nonaktif.
   - Tipe barang: stok atau non-stok.
3. Sistem menyediakan transaksi stok:
   - Stok awal.
   - Restock/penerimaan barang.
   - Pengeluaran manual.
   - Penyesuaian stok.
   - Retur pembelian.
   - Retur penjualan.
4. Setiap perubahan stok harus membuat catatan mutasi dengan:
   - Nomor mutasi.
   - Tanggal dan waktu.
   - ID barang.
   - Jenis mutasi.
   - Kuantitas masuk.
   - Kuantitas keluar.
   - Saldo sebelum.
   - Saldo sesudah.
   - Referensi transaksi.
   - Alasan.
   - Pengguna.
5. Sistem menghitung stok berjalan berdasarkan saldo terakhir dan mutasi.
6. Admin dapat mengatur apakah penjualan stok minus diperbolehkan.
7. Sistem memberikan indikator stok:
   - Aman.
   - Menipis.
   - Habis.
   - Stok minus, jika diizinkan.
8. Admin dapat mencari dan memfilter stok berdasarkan kategori, status, dan kondisi stok.
9. Sistem dapat menampilkan daftar barang yang perlu direstock.
10. Sistem menyediakan impor barang dari CSV/XLSX melalui format template yang ditentukan.
11. Sistem menyediakan ekspor data barang dan mutasi ke spreadsheet atau CSV.
12. Penghapusan barang dilakukan secara soft delete/nonaktif agar histori transaksi tetap utuh.

### Aturan bisnis stok

- Stok tidak boleh diubah langsung pada master barang setelah stok awal, kecuali melalui penyesuaian dengan alasan.
- Transaksi penjualan lunas mengurangi stok.
- Transaksi dibatalkan atau diretur mengembalikan stok sesuai jumlah yang sah.
- Penyesuaian stok wajib mencatat stok fisik, stok sistem, selisih, dan alasan.
- Barang non-stok tidak memengaruhi saldo persediaan.
- Harga pokok penjualan versi awal dapat menggunakan harga beli terakhir. Metode rata-rata tertimbang dapat menjadi pengembangan berikutnya.

## 6.3 Manajemen Kategori Barang

### Kebutuhan fungsional

1. Admin dapat menambah, mengubah, menonaktifkan, dan melihat kategori.
2. Data kategori minimal:
   - ID kategori.
   - Nama kategori.
   - Deskripsi.
   - Urutan tampilan.
   - Status aktif/nonaktif.
3. Nama kategori harus unik.
4. Kategori yang masih digunakan barang tidak boleh dihapus permanen.
5. Kategori aktif dapat digunakan sebagai filter dan tombol pintas di POS.
6. Sistem menampilkan jumlah barang aktif per kategori.

Contoh kategori:

- Sembako.
- Minuman.
- Makanan ringan.
- Produk rumah tangga.
- Rokok.
- Pulsa atau jasa.

## 6.4 Manajemen Pelanggan

### Kebutuhan fungsional

1. Admin atau kasir dapat menambah pelanggan dari halaman pelanggan atau langsung dari POS.
2. Data pelanggan minimal:
   - ID pelanggan.
   - Nama.
   - Nomor telepon.
   - Alamat.
   - Email opsional.
   - Tanggal bergabung.
   - Total transaksi.
   - Total nilai pembelian.
   - Saldo poin, jika fitur poin diaktifkan.
   - Status aktif/nonaktif.
3. Sistem menyediakan pelanggan default `Pelanggan Umum`.
4. Kasir dapat mencari pelanggan berdasarkan nama atau nomor telepon.
5. Sistem menyimpan pelanggan pada transaksi tanpa menimpa histori pelanggan.
6. Admin dapat melihat riwayat transaksi pelanggan.
7. Admin dapat mengekspor daftar pelanggan.
8. Data sensitif pelanggan hanya ditampilkan kepada pengguna yang berhak.
9. Versi awal tidak menyediakan utang/piutang kecuali diaktifkan melalui konfigurasi terpisah.

## 6.5 Laporan Usaha

### Deskripsi

Laporan harus dapat difilter berdasarkan rentang tanggal, kasir, kategori, barang, pelanggan, dan metode pembayaran jika relevan.

### Laporan penjualan

- Ringkasan omzet kotor.
- Diskon.
- Pajak dan biaya tambahan.
- Retur.
- Omzet bersih.
- Jumlah transaksi.
- Rata-rata nilai transaksi.
- Produk terlaris berdasarkan kuantitas.
- Produk terlaris berdasarkan nilai penjualan.
- Penjualan per jam atau per hari.
- Penjualan per kategori.
- Penjualan per kasir.
- Penjualan per pelanggan.
- Penjualan berdasarkan metode pembayaran.

### Laporan stok

- Posisi stok saat ini.
- Nilai persediaan.
- Barang stok menipis.
- Barang habis.
- Barang tidak bergerak berdasarkan periode.
- Kartu stok/mutasi per barang.
- Rekap stok masuk dan keluar.
- Riwayat penyesuaian stok.

### Laporan keuangan operasional

- Estimasi harga pokok penjualan.
- Laba kotor.
- Margin kotor.
- Rekap penerimaan per metode pembayaran.
- Rekap diskon, pajak, dan biaya tambahan.
- Rekap retur dan pembatalan.
- Rekap setoran kas, jika fitur kas shift diaktifkan.

### Laporan pelanggan

- Pelanggan dengan transaksi terbanyak.
- Pelanggan dengan nilai pembelian terbesar.
- Pelanggan baru per periode.
- Riwayat transaksi pelanggan.

### Kebutuhan laporan

1. Dashboard menampilkan KPI utama dalam satu halaman.
2. Pengguna dapat menentukan periode laporan.
3. Pengguna dapat mencetak atau mengekspor laporan ke PDF/XLSX.
4. Laporan hanya memasukkan transaksi sesuai status yang dipilih, dengan default `LUNAS`.
5. Waktu pembuatan laporan standar maksimal 30 detik untuk dataset operasional normal.
6. Laporan yang dihasilkan menyertakan waktu pembuatan dan periode data.

## 6.6 Pembayaran QRIS

### Opsi implementasi

Versi awal harus mendukung minimal QRIS statis. Integrasi QRIS dinamis atau payment gateway dilakukan hanya jika API, kredensial, biaya, dan perjanjian merchant tersedia.

### QRIS statis

1. Admin dapat mengunggah atau menyimpan URL/gambar QRIS toko.
2. Kasir memilih metode pembayaran `QRIS`.
3. Sistem menampilkan QRIS pada halaman pembayaran atau struk.
4. Kasir mengonfirmasi pembayaran berdasarkan bukti dari aplikasi merchant atau prosedur toko.
5. Transaksi hanya diubah menjadi `LUNAS` setelah konfirmasi kasir.
6. Sistem menyimpan:
   - Metode pembayaran.
   - Waktu konfirmasi.
   - Pengguna yang mengonfirmasi.
   - Referensi pembayaran jika diisi.
   - Catatan verifikasi.

### QRIS dinamis/integrasi gateway

Jika tersedia:

- Sistem membuat nominal pembayaran unik melalui API gateway.
- Sistem menyimpan ID pembayaran dan status dari gateway.
- Status `LUNAS` hanya berasal dari callback/webhook atau verifikasi API yang sah.
- Sistem menyediakan rekonsiliasi transaksi gateway dengan transaksi POS.
- Kredensial API disimpan pada Script Properties, bukan pada sel spreadsheet.
- Kegagalan API ditampilkan kepada pengguna dan tidak boleh menghasilkan transaksi lunas palsu.

### Catatan operasional

QRIS adalah layanan pembayaran yang tunduk pada ketentuan penyedia dan regulator. Pemilik usaha tetap bertanggung jawab melakukan verifikasi settlement dan biaya transaksi.

## 7. Struktur Google Spreadsheet

Satu file spreadsheet utama digunakan dengan sheet berikut. Nama sheet sebaiknya tidak diubah oleh pengguna tanpa prosedur migrasi.

| Sheet | Tujuan | Kolom inti |
|---|---|---|
| `Settings` | Konfigurasi toko dan aplikasi | key, value, tipe, keterangan |
| `Users` | Pengguna dan role | user_id, email, nama, role, status |
| `Categories` | Master kategori | category_id, nama, deskripsi, status |
| `Products` | Master barang | product_id, SKU, barcode, nama, kategori, satuan, harga_beli, harga_jual, stok_minimum, stok_saat_ini, tipe, status |
| `Customers` | Master pelanggan | customer_id, nama, telepon, alamat, total_transaksi, total_pembelian, poin, status |
| `Sales` | Header transaksi | sale_id, nomor_transaksi, timestamp, kasir, customer_id, subtotal, diskon, pajak, total, metode_bayar, status, referensi_bayar |
| `SaleDetails` | Detail barang transaksi | detail_id, sale_id, product_id, SKU, nama_produk, harga, qty, diskon, subtotal |
| `StockMovements` | Riwayat mutasi stok | movement_id, timestamp, product_id, jenis, qty_masuk, qty_keluar, saldo_sebelum, saldo_sesudah, referensi, alasan, user_id |
| `Payments` | Detail penerimaan pembayaran | payment_id, sale_id, metode, nominal_tagihan, nominal_dibayar, kembalian, status, waktu_konfirmasi, referensi |
| `Returns` | Retur dan pembatalan | return_id, sale_id, tipe, alasan, total, status, user_id, timestamp |
| `Shifts` | Kasir/shift opsional | shift_id, kasir, buka, tutup, saldo_awal, penjualan_tunai, saldo_akhir, selisih |
| `AuditLogs` | Audit aktivitas | log_id, timestamp, user_id, aksi, modul, record_id, detail |
| `ReportCache` | Cache hasil laporan opsional | report_id, periode, parameter, hasil, dibuat_pada |

### Prinsip desain spreadsheet

- Baris pertama setiap sheet berisi header tetap.
- ID dibuat oleh sistem dan tidak boleh diedit manual.
- Tanggal dan waktu disimpan dalam format Date/Time Google Sheets.
- Nilai uang disimpan sebagai angka, bukan teks berformat mata uang.
- Status menggunakan nilai enumerasi yang terdokumentasi.
- Formula ringkasan dipisahkan dari data transaksi mentah.
- Data transaksi bersifat append-only sebisa mungkin.
- Kolom teknis yang digunakan Apps Script diberi penamaan konsisten.

## 8. Arsitektur Teknis

### 8.1 Komponen

1. **Google Spreadsheet**
   - Penyimpanan data.
   - Master data.
   - Sumber laporan dan ekspor.
2. **Google Apps Script**
   - Web app antarmuka kasir.
   - Fungsi CRUD.
   - Validasi.
   - Perhitungan transaksi.
   - Otomatisasi stok dan laporan.
   - Integrasi API pembayaran jika digunakan.
3. **HTML Service**
   - Halaman login/identifikasi pengguna.
   - Halaman POS.
   - Halaman master data.
   - Dashboard dan laporan.
4. **Google Drive**
   - Penyimpanan logo, QRIS, PDF struk, dan ekspor jika diperlukan.
5. **Email/trigger Apps Script**
   - Notifikasi stok menipis atau laporan terjadwal, jika diaktifkan.

### 8.2 Modul Apps Script yang disarankan

- `ConfigService`: membaca konfigurasi dan validasi instalasi.
- `AuthService`: identifikasi email pengguna dan hak akses.
- `ProductService`: barang, kategori, pencarian, dan harga.
- `CustomerService`: pelanggan dan riwayat.
- `SalesService`: keranjang, validasi, finalisasi, pembatalan, dan retur.
- `InventoryService`: saldo dan mutasi stok.
- `PaymentService`: metode pembayaran dan QRIS.
- `ReportService`: agregasi laporan dan ekspor.
- `AuditService`: audit trail.
- `DocumentService`: struk dan PDF.
- `UiService`: komunikasi fungsi server dengan antarmuka HTML.

### 8.3 Konsistensi dan konkurensi

- Gunakan `LockService` saat finalisasi transaksi dan perubahan stok.
- Validasi ulang harga, status barang, dan stok di server, bukan hanya di browser.
- Gunakan nomor transaksi dan token permintaan unik untuk mencegah duplikasi.
- Tulis data header transaksi, detail transaksi, pembayaran, dan mutasi stok dalam urutan yang aman.
- Jika salah satu tahap transaksi gagal, tampilkan kegagalan dan lakukan kompensasi atau tandai transaksi untuk rekonsiliasi.
- Jangan mengandalkan formula spreadsheet sebagai satu-satunya validasi bisnis.

## 9. Alur Utama Sistem

### 9.1 Pembukaan aplikasi

1. Pengguna membuka URL web app.
2. Sistem mengidentifikasi akun Google pengguna.
3. Sistem memeriksa status dan role pada `Users`.
4. Sistem menampilkan menu sesuai hak akses.
5. Jika pengguna tidak terdaftar atau nonaktif, akses ditolak dengan pesan yang jelas.

### 9.2 Penjualan berhasil

1. Kasir membuat keranjang.
2. Server mengambil data barang aktif dan harga.
3. Kasir memilih pelanggan dan metode pembayaran.
4. Server memvalidasi seluruh isi keranjang.
5. Server memperoleh lock.
6. Server memeriksa stok terbaru.
7. Server menyimpan header, detail, dan pembayaran.
8. Server memperbarui stok dan menulis mutasi.
9. Server menulis audit log.
10. Server melepaskan lock.
11. Sistem menampilkan struk.

### 9.3 Pembatalan/retur

1. Pengguna berwenang mencari transaksi.
2. Sistem menampilkan detail yang dapat dibatalkan/diretur.
3. Pengguna memasukkan alasan.
4. Sistem meminta konfirmasi.
5. Sistem memperbarui status transaksi atau membuat dokumen retur.
6. Sistem mengembalikan stok jika barang fisik dikembalikan.
7. Sistem mencatat audit log.

### 9.4 Penutupan harian

1. Supervisor memilih tanggal atau shift.
2. Sistem menampilkan penjualan per metode pembayaran.
3. Kasir mengisi saldo fisik bila fitur shift digunakan.
4. Sistem menghitung selisih.
5. Supervisor mengonfirmasi penutupan.
6. Sistem mengunci perubahan operasional tertentu untuk periode tersebut, sesuai kebijakan toko.

## 10. Kebutuhan Nonfungsional

### Performa

- Pencarian barang umum merespons maksimal 2 detik pada dataset normal.
- Finalisasi transaksi merespons maksimal 5 detik pada kondisi normal.
- Laporan standar selesai maksimal 30 detik untuk hingga 50.000 detail transaksi.
- Data list menggunakan pagination atau pembatasan jumlah baris agar antarmuka tetap ringan.

### Keamanan

- Akses dibatasi berdasarkan akun Google dan daftar pengguna.
- Hak akses diterapkan di server Apps Script.
- Semua input divalidasi dan dinormalisasi di server.
- Kredensial dan token API disimpan di Script Properties.
- Sheet data dilindungi dari pengeditan umum; akses langsung hanya untuk admin teknis.
- Perubahan penting dicatat di `AuditLogs`.
- Tidak ada penghapusan permanen transaksi tanpa prosedur admin.

### Reliabilitas

- Sistem menampilkan error yang dapat ditindaklanjuti.
- Kegagalan pembayaran tidak boleh ditampilkan sebagai pembayaran sukses.
- Kegagalan penulisan stok harus membuat transaksi ditandai gagal atau perlu rekonsiliasi, bukan dibiarkan setengah tersimpan tanpa penanda.
- Sediakan salinan/backup spreadsheet berkala.
- Trigger dan integrasi eksternal harus memiliki log eksekusi dan mekanisme retry yang aman.

### Kemudahan penggunaan

- Antarmuka responsif untuk desktop, tablet, dan layar kasir umum.
- Tombol aksi utama terlihat jelas.
- Form menggunakan label berbahasa Indonesia.
- Konfirmasi ditampilkan untuk aksi berisiko seperti batal transaksi dan penyesuaian stok.
- Format angka dan tanggal mengikuti konfigurasi lokal Indonesia.

### Batasan platform

- Google Apps Script memiliki batas waktu eksekusi dan kuota layanan.
- Google Spreadsheet tidak ideal untuk beban transaksi besar secara bersamaan.
- Aplikasi versi awal menargetkan satu toko atau satu file spreadsheet dengan jumlah kasir bersamaan yang terbatas.
- Jika volume atau kebutuhan multi-cabang meningkat, data dapat dimigrasikan ke database khusus.

## 11. Validasi dan Aturan Data

- SKU unik untuk barang aktif.
- Barcode, jika diisi, harus unik.
- Nama kategori unik.
- Nomor transaksi unik.
- Nominal pembayaran non-negatif.
- Pembayaran tunai harus memenuhi total tagihan, kecuali transaksi dibatalkan.
- Jumlah barang harus bilangan positif.
- Harga jual dan harga beli tidak boleh negatif.
- ID referensi harus menunjuk ke data yang ada.
- Tanggal transaksi tidak boleh berada di masa depan di luar toleransi konfigurasi.
- Email pengguna harus memiliki role dan status aktif.
- Perubahan master penting harus menghasilkan audit log.

## 12. Kriteria Penerimaan

### POS

- [x] Kasir dapat membuat transaksi dengan minimal satu barang aktif.
- [ ] Sistem menghitung subtotal, diskon, pajak, total, pembayaran, dan kembalian dengan benar.
- [ ] Sistem menolak barang nonaktif atau stok tidak mencukupi sesuai pengaturan.
- [ ] Setiap transaksi lunas memiliki nomor unik dan detail yang lengkap.
- [ ] Stok berkurang tepat satu kali walaupun tombol simpan diklik berulang.
- [ ] Struk menampilkan nomor transaksi, waktu, kasir, barang, total, metode pembayaran, dan informasi toko.

### Stok

- [ ] Restock menambah stok dan membuat mutasi.
- [ ] Penjualan mengurangi stok dan membuat mutasi.
- [ ] Retur atau pembatalan yang sah mengembalikan stok.
- [ ] Penyesuaian stok membutuhkan alasan dan hak akses.
- [ ] Daftar stok menipis sesuai batas minimum barang.

### Master data

- [ ] Admin dapat mengelola kategori, barang, dan pelanggan.
- [ ] Barang yang sudah memiliki histori tidak hilang dari histori ketika dinonaktifkan.
- [ ] SKU dan kategori tidak dapat diduplikasi.

### Laporan

- [ ] Dashboard menampilkan omzet, jumlah transaksi, rata-rata transaksi, dan estimasi laba kotor sesuai periode.
- [ ] Total laporan dapat ditelusuri ke transaksi lunas.
- [ ] Laporan dapat difilter dan diekspor.
- [ ] Retur dan pembatalan diperlakukan konsisten dalam seluruh laporan.

### QRIS

- [ ] QRIS statis dapat ditampilkan saat metode pembayaran QRIS dipilih.
- [ ] Transaksi QRIS tidak menjadi lunas sebelum konfirmasi kasir atau verifikasi gateway.
- [ ] Referensi pembayaran dan pengguna konfirmasi tersimpan.
- [ ] Kegagalan integrasi tidak membuat transaksi palsu berstatus lunas.

### Keamanan dan audit

- [ ] Pengguna tanpa role aktif tidak dapat masuk.
- [ ] Kasir tidak dapat mengubah harga master atau melakukan penyesuaian stok tanpa otorisasi.
- [ ] Pembatalan, retur, dan penyesuaian memiliki alasan serta audit log.

## 13. Prioritas Rilis

### MVP

1. Login dan role dasar.
2. Master kategori.
3. Master barang.
4. POS dengan pembayaran tunai.
5. Pengurangan stok otomatis.
6. Master pelanggan sederhana.
7. Dashboard penjualan harian.
8. Laporan penjualan dan stok dasar.
9. QRIS statis.
10. Audit log dasar.

### Rilis berikutnya

1. Pembayaran transfer dan rekonsiliasi manual.
2. Retur dan pembatalan lengkap.
3. Shift kasir dan setoran kas.
4. Impor/ekspor massal.
5. Poin pelanggan.
6. Notifikasi stok menipis.
7. QRIS dinamis melalui payment gateway.
8. Laporan laba kotor dengan metode HPP yang lebih akurat.
9. Dukungan multi-cabang.

## 14. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Edit manual pada sheet merusak data | Tinggi | Lindungi sheet, batasi akses, sediakan audit dan backup |
| Dua kasir menyimpan transaksi bersamaan | Tinggi | Gunakan `LockService`, validasi server, dan token idempotensi |
| Kuota Apps Script terlampaui | Sedang/Tinggi | Kurangi pembacaan sel berulang, gunakan batch operation dan cache |
| QRIS statis tidak terverifikasi otomatis | Sedang | Wajibkan konfirmasi kasir dan simpan bukti/referensi |
| Spreadsheet rusak atau terhapus | Tinggi | Backup otomatis berkala dan hak akses admin terbatas |
| Harga berubah setelah transaksi | Sedang | Simpan snapshot harga pada `SaleDetails` |
| Data transaksi membesar | Sedang | Arsip periode lama dan evaluasi migrasi database |
| Koneksi internet terputus | Sedang | Tampilkan status gagal dengan jelas; offline POS bukan bagian MVP |

## 15. Dependensi dan Konfigurasi Awal

- Akun Google Workspace atau Google Account yang dapat menggunakan Google Sheets dan Apps Script.
- Satu spreadsheet utama dengan template sheet yang sesuai.
- Daftar pengguna dan role.
- Data awal barang, kategori, dan stok.
- Informasi toko: nama, alamat, nomor telepon, logo opsional.
- Konfigurasi zona waktu dan format mata uang Rupiah.
- File atau URL QRIS merchant, jika digunakan.
- Kebijakan toko untuk retur, stok minus, diskon, pajak, dan penutupan kas.

## 16. Rencana Implementasi

### Fase 1: Fondasi

- Membuat template spreadsheet dan struktur kolom.
- Membuat konfigurasi, role, validasi, dan audit dasar.
- Menyiapkan deployment Apps Script.

### Fase 2: Master data

- Membangun kategori, barang, pelanggan, impor, ekspor, dan pencarian.

### Fase 3: POS dan stok

- Membangun keranjang, pembayaran tunai, finalisasi transaksi, lock, mutasi, dan struk.

### Fase 4: Laporan

- Membangun dashboard, laporan penjualan, laporan stok, ekspor PDF/XLSX, dan filter periode.

### Fase 5: QRIS dan kontrol operasional

- Menambahkan QRIS statis, konfirmasi pembayaran, retur, pembatalan, shift, dan notifikasi.

### Fase 6: Pengujian dan peluncuran

- Uji unit fungsi perhitungan.
- Uji integrasi transaksi dan stok.
- Uji hak akses.
- Uji beban dataset operasional.
- Uji penerimaan oleh kasir dan pemilik.
- Pelatihan pengguna dan pembuatan prosedur backup.

## 17. Pertanyaan Terbuka untuk Konfigurasi Bisnis

1. Apakah toko menggunakan satu lokasi atau beberapa lokasi?
2. Apakah penjualan stok minus diperbolehkan?
3. Apakah pajak perlu ditampilkan pada struk?
4. Apakah fitur utang pelanggan diperlukan?
5. Apakah program poin pelanggan diperlukan sejak MVP?
6. Apakah QRIS yang digunakan berupa QR statis atau membutuhkan payment gateway dinamis?
7. Apakah toko memerlukan shift kasir dan pencatatan setoran?
8. Berapa perkiraan transaksi dan detail barang per hari?
9. Apakah harga jual berbeda berdasarkan pelanggan atau tingkat harga?
10. Apakah diperlukan pencatatan kedaluwarsa atau nomor batch?

---

## Lampiran A: Status yang Direkomendasikan

### Status transaksi

- `DRAFT`
- `MENUNGGU_PEMBAYARAN`
- `LUNAS`
- `DIBATALKAN`
- `DIRETUR_SEBAGIAN`
- `DIRETUR_PENUH`
- `PERLU_REKONSILIASI`

### Status barang, kategori, dan pelanggan

- `AKTIF`
- `NONAKTIF`

### Jenis mutasi stok

- `STOK_AWAL`
- `RESTOCK`
- `PENJUALAN`
- `RETUR_PENJUALAN`
- `RETUR_PEMBELIAN`
- `PENYESUAIAN_MASUK`
- `PENYESUAIAN_KELUAR`
- `PENGELUARAN_MANUAL`

### Metode pembayaran

- `TUNAI`
- `TRANSFER`
- `QRIS`
- `LAINNYA`

## Lampiran B: Contoh Format Struk

```text
NAMA TOKO
Alamat toko
Telepon toko

No. Transaksi : TRX-20260930-0001
Tanggal       : 30/09/2026 15:40
Kasir         : Nama Kasir
Pelanggan     : Pelanggan Umum
--------------------------------
1 x Air Mineral       5.000
2 x Mi Instan         6.000
--------------------------------
Subtotal             11.000
Diskon                    0
Pajak                     0
TOTAL                11.000
Bayar                20.000
Kembali               9.000
Metode               TUNAI

Terima kasih
```

## Lampiran C: Definisi Selesai

Fitur dianggap selesai apabila:

1. Kode telah diuji pada spreadsheet salinan dan spreadsheet produksi.
2. Validasi server dan hak akses berjalan sesuai role.
3. Data transaksi, stok, dan laporan menghasilkan angka yang konsisten.
4. Kesalahan ditampilkan kepada pengguna tanpa menganggap operasi berhasil.
5. Perubahan penting tercatat dalam audit log.
6. Dokumentasi konfigurasi dan prosedur backup tersedia.
7. Kasir dan pemilik berhasil menyelesaikan skenario uji penerimaan utama.
