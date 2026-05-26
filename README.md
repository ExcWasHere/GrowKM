# GrowKM 
GrowKM adalah platform yang membantu UMKM Indonesia naik kelas: dari usaha rumahan tanpa legalitas, menjadi bisnis formal yang siap mengakses pembiayaan, marketplace, dan program pemerintah.

Banyak pelaku UMKM tahu bisnisnya butuh diformalkan, tapi tersesat di rimba istilah — KBLI, NIB, PIRT, Halal, BPOM, Merek, Sertifikat Standar. GrowKM menerjemahkan kerumitan itu jadi langkah-langkah konkret yang bisa dijalankan satu per satu, dipandu AI yang paham konteks usaha mereka.

---

## Untuk Siapa Produk Ini

- Pelaku UMKM yang baru mulai dan belum tahu harus mengurus legalitas apa lebih dulu.
- UMKM yang sudah berjalan tapi mentok di pintu pembiayaan atau marketplace karena dokumen belum lengkap.
- Pendamping UMKM (mentor, dinas, inkubator) yang butuh alat bantu untuk memetakan kebutuhan legalitas binaannya.

---

## Fitur Utama

### 1. Identifikasi KBLI Berbasis AI
Pengguna cukup mendeskripsikan usahanya dengan bahasa sehari-hari, GrowKM merekomendasikan kode KBLI yang paling sesuai. Sudah punya KBLI? AI bisa memvalidasi apakah kode itu benar-benar cocok dengan deskripsi usaha, atau justru salah pilih sejak awal.

### 2. Roadmap Legalitas Personal
Berdasarkan profil usaha (kategori, omzet, jenis produk, target pasar), GrowKM menyusun roadmap legalitas yang relevan: NIB, SPP-IRT, Sertifikat Halal, izin BPOM, pendaftaran Merek, Sertifikat Standar. Setiap langkah punya status — `locked`, `in_progress`, `completed` — dan langkah berikutnya terbuka otomatis ketika prasyaratnya selesai.

### 3. Bukti Dokumen Tersimpan Aman
Setiap langkah yang sudah diselesaikan bisa dilampiri bukti dokumen (foto NIB, sertifikat PIRT, dan lainnya) dalam format JPG, PNG, atau PDF. Dokumen tersimpan privat dan hanya bisa diakses pemiliknya lewat tautan bertanda waktu.

### 4. Lexa AI
Asisten percakapan yang siap menjawab pertanyaan seputar legalitas kapan saja, misalnya *"Bagaimana cara mengurus NIB untuk usaha kuliner saya?"* atau *"Apa beda PIRT dan BPOM?"*. Setiap sesi tersimpan, bisa dilanjutkan, dan bisa difokuskan ke domain izin tertentu (misalnya khusus pembahasan Sertifikat Halal).

### 5. Marketplace Peluang
Pelaku UMKM sering tidak tahu bahwa setiap legalitas yang mereka urus membuka pintu peluang. GrowKM mencocokkan profil usaha dan langkah yang sudah selesai dengan database peluang nyata:

- Pembiayaan (KUR, modal kerja, P2P lending)
- Vendor dan supply chain
- Marketplace (Tokopedia, Shopee, dan lainnya)
- Program pemerintah
- Event dan pameran

Setiap peluang ditandai status: **eligible** (bisa diambil sekarang), **almost** (kurang sedikit), atau **locked** (masih butuh syarat).

### 6. AI Advisor — Tiga Rekomendasi Teratas
Bukan sekadar daftar panjang, GrowKM memilihkan tiga peluang teratas yang paling cocok dengan profil usaha, lengkap dengan:

- Alasan kenapa peluang ini cocok dengan profil usaha
- Kenapa peluang ini perlu diambil sekarang
- Aksi konkret yang harus dilakukan berikutnya
- Catatan atau peringatan penting

### 7. Notifikasi Peluang Baru
Ketika sebuah langkah selesai dan peluang baru terbuka, pengguna langsung mendapat notifikasi peluang yang baru bisa diakses, supaya hasil dari mengurus legalitas terasa langsung.

---

## Alur Singkat Penggunaan

1. Daftar dan lengkapi profil usaha — deskripsi, kategori, omzet, target pasar.
2. Dapatkan KBLI lewat rekomendasi AI, atau validasi kode yang sudah dimiliki.
3. Ikuti roadmap — kerjakan langkah legalitas satu per satu, unggah bukti dokumen.
4. Tanya Lexa AI kapan saja kalau bingung dengan istilah, prosedur, atau biaya.
5. Buka marketplace peluang — lihat pembiayaan dan program yang sudah eligible, dan langkah apa yang masih perlu diselesaikan untuk membuka peluang lain.
6. Konsultasi AI Advisor untuk fokus ke tiga peluang prioritas.

---

## Struktur Repository

Repository ini berisi dua bagian:

- `Backend/` — REST API yang menangani autentikasi, profil usaha, roadmap, dokumen, chat, dan engine pencocokan peluang. Panduan setup dan dokumentasi API ada di [`Backend/README.md`](./Backend/README.md).
- `Frontend/` — antarmuka pengguna (web app).

---

## Filosofi Produk

Legalitas seharusnya bukan tembok yang menahan UMKM dari peluang, melainkan tangga yang membawa mereka naik. GrowKM dibangun untuk menjadikan setiap langkah legalitas terasa berarti, terhubung, dan berbuah peluang nyata.
