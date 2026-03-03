# Dokumen Persyaratan (Requirements Document)

## Pendahuluan

Fitur ini menyediakan sistem pengingat (reminder) otomatis berbasis email untuk pengguna aplikasi Sikasir Laundry yang masa langganannya akan segera berakhir. Sistem berjalan sebagai GitHub Actions workflow terjadwal yang melakukan query ke Firestore, mengidentifikasi pengguna yang langganannya akan expired dalam H-7, H-3, dan H-1, lalu mengirimkan email reminder bertingkat melalui layanan Resend. Tujuannya adalah meningkatkan retensi pengguna dengan memberikan notifikasi tepat waktu agar mereka memperpanjang langganan sebelum akses berakhir.

## Glosarium

- **Reminder_System**: Script Node.js yang berjalan di GitHub Actions untuk mengirim email pengingat langganan
- **Workflow**: GitHub Actions workflow yang menjadwalkan dan menjalankan Reminder_System
- **Firestore**: Database Firebase Cloud Firestore (project ID: kasirlaundryapps) yang menyimpan data pengguna
- **Users_Collection**: Koleksi `users` di Firestore yang berisi dokumen pengguna dengan field `name`, `email`, `accessUntil`, dan `fcmToken`
- **Access_Until**: Field bertipe Timestamp pada dokumen pengguna yang menunjukkan tanggal berakhirnya langganan
- **Resend**: Layanan pihak ketiga untuk pengiriman email transaksional
- **Tier_H7**: Kategori pengingat untuk pengguna yang langganannya berakhir dalam 7 hari (informatif)
- **Tier_H3**: Kategori pengingat untuk pengguna yang langganannya berakhir dalam 3 hari (urgent)
- **Tier_H1**: Kategori pengingat untuk pengguna yang langganannya berakhir dalam 1 hari (critical)
- **Email_Template**: Template HTML email profesional dengan branding Sikasir Laundry
- **CTA_Button**: Tombol "Perpanjang Sekarang" dalam email yang mengarah ke halaman aplikasi di Google Play Store (https://play.google.com/store/apps/details?id=com.sikasir.laundry.sikasirlaundry)

## Persyaratan

### Persyaratan 1: Penjadwalan Workflow GitHub Actions

**User Story:** Sebagai pengelola aplikasi, saya ingin workflow reminder berjalan otomatis setiap hari, sehingga pengguna mendapat pengingat tanpa intervensi manual.

#### Kriteria Penerimaan

1. THE Workflow SHALL berjalan secara terjadwal setiap hari pada pukul 02:00 UTC (09:00 WIB) menggunakan cron schedule
2. THE Workflow SHALL mendukung trigger manual melalui `workflow_dispatch` untuk keperluan pengujian
3. THE Workflow SHALL menggunakan Node.js versi 22 sebagai runtime environment
4. THE Workflow SHALL menginstal dependensi dari `scripts/package.json` sebelum menjalankan Reminder_System
5. THE Workflow SHALL meneruskan secret `FIREBASE_SERVICE_ACCOUNT_KEY` dan `RESEND_API_KEY` sebagai environment variable ke Reminder_System

### Persyaratan 2: Inisialisasi Firebase Admin SDK

**User Story:** Sebagai pengelola aplikasi, saya ingin Reminder_System terhubung ke Firestore secara aman, sehingga data pengguna dapat diakses untuk keperluan pengiriman reminder.

#### Kriteria Penerimaan

1. WHEN Reminder_System dijalankan, THE Reminder_System SHALL melakukan parsing JSON dari environment variable `FIREBASE_SERVICE_ACCOUNT_KEY` untuk mendapatkan kredensial service account
2. WHEN kredensial berhasil di-parse, THE Reminder_System SHALL menginisialisasi Firebase Admin SDK menggunakan kredensial tersebut
3. IF environment variable `FIREBASE_SERVICE_ACCOUNT_KEY` tidak tersedia atau berisi JSON yang tidak valid, THEN THE Reminder_System SHALL mencatat pesan error yang deskriptif dan menghentikan eksekusi dengan exit code non-zero

### Persyaratan 3: Query Pengguna yang Akan Expired

**User Story:** Sebagai pengelola aplikasi, saya ingin sistem mengidentifikasi pengguna yang langganannya akan berakhir dalam H-7, H-3, dan H-1, sehingga mereka mendapat pengingat pada waktu yang tepat.

#### Kriteria Penerimaan

1. WHEN Reminder_System dijalankan, THE Reminder_System SHALL melakukan query ke Users_Collection di Firestore untuk mengambil dokumen pengguna yang nilai Access_Until-nya jatuh tepat pada 7 hari, 3 hari, atau 1 hari dari tanggal hari ini
2. THE Reminder_System SHALL menghitung rentang tanggal berdasarkan awal hari (00:00:00) hingga akhir hari (23:59:59) untuk setiap tier (H-7, H-3, H-1) agar mencakup seluruh hari tersebut
3. THE Reminder_System SHALL mengkategorikan setiap pengguna yang ditemukan ke dalam Tier_H7, Tier_H3, atau Tier_H1 berdasarkan sisa hari hingga Access_Until


### Persyaratan 4: Pengiriman Email via Resend

**User Story:** Sebagai pengelola aplikasi, saya ingin email reminder terkirim ke pengguna yang teridentifikasi, sehingga mereka mengetahui bahwa langganan mereka akan segera berakhir.

#### Kriteria Penerimaan

1. WHEN pengguna teridentifikasi masuk dalam Tier_H7, Tier_H3, atau Tier_H1, THE Reminder_System SHALL mengirim email ke alamat email pengguna tersebut menggunakan layanan Resend
2. THE Reminder_System SHALL menggunakan alamat pengirim "Sikasir Laundry <noreply@sikasirlaundry.web.id>" untuk setiap email yang dikirim
3. THE Reminder_System SHALL membaca API key Resend dari environment variable `RESEND_API_KEY`
4. IF pengguna tidak memiliki field `email` atau field `email` kosong, THEN THE Reminder_System SHALL melewatkan pengguna tersebut dan mencatat peringatan ke console log
5. IF pengiriman email gagal, THEN THE Reminder_System SHALL mencatat error ke console log dan melanjutkan pemrosesan pengguna berikutnya

### Persyaratan 5: Subject Email Bertingkat per Tier

**User Story:** Sebagai pengguna, saya ingin menerima email dengan tingkat urgensi yang sesuai dengan sisa waktu langganan saya, sehingga saya memahami seberapa mendesak untuk memperpanjang.

#### Kriteria Penerimaan

1. WHEN email dikirim untuk pengguna Tier_H7, THE Reminder_System SHALL menggunakan subject email yang bersifat informatif yang menyebutkan sisa 7 hari
2. WHEN email dikirim untuk pengguna Tier_H3, THE Reminder_System SHALL menggunakan subject email yang bersifat urgent yang menyebutkan sisa 3 hari
3. WHEN email dikirim untuk pengguna Tier_H1, THE Reminder_System SHALL menggunakan subject email yang bersifat critical yang menyebutkan sisa 1 hari

### Persyaratan 6: Template HTML Email Profesional

**User Story:** Sebagai pengguna, saya ingin menerima email yang terlihat profesional dan mudah dibaca, sehingga saya percaya bahwa email tersebut resmi dari Sikasir Laundry.

#### Kriteria Penerimaan

1. THE Email_Template SHALL menggunakan format HTML dengan branding Sikasir Laundry dan warna utama #0a57a2
2. THE Email_Template SHALL menampilkan sapaan menggunakan nama pengguna dari field `name`
3. THE Email_Template SHALL menampilkan informasi sisa hari langganan sesuai tier pengguna
4. THE Email_Template SHALL menampilkan tanggal expired langganan dalam format bahasa Indonesia (contoh: "3 Maret 2026")
5. THE Email_Template SHALL menampilkan CTA_Button bertuliskan "Perpanjang Sekarang" yang mengarah ke https://play.google.com/store/apps/details?id=com.sikasir.laundry.sikasirlaundry
6. WHEN email dikirim untuk pengguna Tier_H7, THE Email_Template SHALL menggunakan warna banner amber (#f59e0b)
7. WHEN email dikirim untuk pengguna Tier_H3, THE Email_Template SHALL menggunakan warna banner orange (#f97316)
8. WHEN email dikirim untuk pengguna Tier_H1, THE Email_Template SHALL menggunakan warna banner merah (#ef4444)
9. THE Email_Template SHALL menampilkan footer yang berisi link WhatsApp Customer Service ke https://wa.me/6285161616169

### Persyaratan 7: Logging dan Ringkasan Eksekusi

**User Story:** Sebagai pengelola aplikasi, saya ingin melihat log detail dan ringkasan eksekusi, sehingga saya dapat memantau keberhasilan dan kegagalan pengiriman email.

#### Kriteria Penerimaan

1. WHEN email berhasil dikirim ke pengguna, THE Reminder_System SHALL mencatat log keberhasilan yang menyebutkan nama pengguna dan tier reminder
2. WHEN pengiriman email gagal, THE Reminder_System SHALL mencatat log kegagalan yang menyebutkan nama pengguna dan pesan error
3. WHEN seluruh proses pengiriman selesai, THE Reminder_System SHALL menampilkan ringkasan di console log yang mencakup jumlah total email terkirim dan jumlah total email gagal

### Persyaratan 8: Manajemen Dependensi

**User Story:** Sebagai pengelola aplikasi, saya ingin dependensi script terkelola dengan baik, sehingga proses instalasi di CI/CD berjalan lancar.

#### Kriteria Penerimaan

1. THE Reminder_System SHALL memiliki file `scripts/package.json` yang mendefinisikan dependensi `firebase-admin` dan `resend`
2. THE Reminder_System SHALL tidak melakukan hardcode secret atau kredensial di dalam source code

### Persyaratan 9: Penanganan Error secara Graceful

**User Story:** Sebagai pengelola aplikasi, saya ingin sistem menangani error dengan baik, sehingga satu kegagalan tidak menghentikan seluruh proses pengiriman.

#### Kriteria Penerimaan

1. IF terjadi error saat query ke Firestore, THEN THE Reminder_System SHALL mencatat pesan error yang deskriptif dan menghentikan eksekusi dengan exit code non-zero
2. IF terjadi error saat mengirim email ke satu pengguna, THEN THE Reminder_System SHALL mencatat error untuk pengguna tersebut dan melanjutkan pemrosesan pengguna berikutnya
3. IF environment variable `RESEND_API_KEY` tidak tersedia, THEN THE Reminder_System SHALL mencatat pesan error yang deskriptif dan menghentikan eksekusi dengan exit code non-zero
4. IF tidak ada pengguna yang ditemukan untuk semua tier, THEN THE Reminder_System SHALL mencatat informasi bahwa tidak ada pengguna yang perlu dikirimi reminder dan menyelesaikan eksekusi dengan sukses
