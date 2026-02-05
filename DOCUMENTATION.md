# 📑 Dokumentasi Teknis InstaInsight: Bedah Jeroan Sampe Tuntas!

Halo temen-temen semua! 👋 Dokumentasi ini dibuat biar kalian semua, mau yang baru belajar ngoding (*beginner*) ataupun yang udah senior, bisa paham banget gimananya InstaInsight Analyzer bekerja dari awal sampe akhir. 

Kita bakal bahas santai tapi tetep mendalam ya!

---

## 🚀 Filosofi: Sopan di Depan, Pinter di Belakang
Prinsip utama kita cuma satu: **Keamanan data user itu harga mati.** 
Kita nggak pernah, dan nggak akan pernah minta password Instagram kamu. Kita manfaatin sesi browser yang udah ada biar pengambilan datanya legal dan aman.

---

## 🛠️ Jeroan Teknologi (*Tech Stack*)
- **React 19**: Versi paling gres buat bikin UI yang responsif.
- **Vite 6**: Alat *build* yang kenceng banget, bikin ngoding makin asik.
- **TypeScript**: Biar kita nggak pusing sama error tipe data yang aneh-aneh.
- **Tailwind CSS**: Biar desainnya makin estetik dan gampang diatur.
- **PWA**: Biar web kita bisa dikantongin di HP (bisa diinstal).

---

## 🏗️ Cara Kerja & Alur Data (Alurnya Begini Ges...)

Aplikasi kita ini tipenya **Client-Only**. Artinya, semua proses terjadi di browser kalian sendiri. Nggak ada data yang terbang ke server asing.

### 1. Pengambilan Data (*Data Acquisition*)
Instagram itu jagain datanya pake aturan CORS yang ketat banget. Jadi, web luar nggak bisa sembarangan manggil API mereka.
**Trik Jitunya:**
- Kita kasih **Scraper Script** (JS murni) yang bisa kalian jalankan di tab `instagram.com`.
- Karena dijalankan di situ, script kita dapet "izin" buat nanya ke API internal Instagram (`/api/v1/friendships/...`) pake sesi kalian yang udah aktif.

### 2. Biar Nggak Kena Marah Instagram (*Evasion & Reliability*)
Instagram itu sensitif banget sama bot. Makanya kita pasang fitur ala senior:
- **Gonta-ganti App-ID**: Header `X-IG-App-ID` kita gilir biar nggak gampang ketauan kalo itu script otomatis.
- **Istirahat Dulu Bos (*Rate Limit*)**: Kalo kena error `429`, script kita bakal "break" dulu 60 detik. Ada timer-nya juga, jadi kalian nggak bakal bingung kenapa scriptnya berhenti.

### 3. Singkronisasi Data
Setelah dapet ribuan data, script bakal ngirim balik ke aplikasi utama lewat dua pintu:
- **Pintu Otomatis**: Pake `window.postMessage`.
- **Pintu Manual**: Copy-Paste manual teks JSON lewat Clipboard (kalo yang otomatis gagal).

### 4. Otak Pemrosesan (`utils/instagramParser.ts`)
Di sinilah keajaiban matematika himpunan terjadi:
- **Gak Follback**: `Following \ Followers` (Yang kalian follow tapi nggak ada di daftar pengikut).
- **Fans**: `Followers \ Following` (Pengikut yang kalian sendiri nggak follow balik).
- **Mutual**: `Following ∩ Followers` (Daftar temen yang saling follow).

---

## 📁 Napak Tilas Folder
```text
├── components/          # Kumpulan bumbu UI (Kartu stats, daftar user, scanner)
├── services/            # Logika buat ngobrol sama API Instagram
├── utils/
│   ├── browserScript.ts # Pabrik pembuat script scraper (Injectable JS)
│   └── instagramParser.ts # Otak yang ngitung relasi follower
├── types.ts             # Definisi tipe data biar aman sentosa
├── App.tsx              # Dirigen utamanya (State & Alur UI)
└── site.webmanifest     # Paspor PWA biar bisa diinstal
```

---

## 🚦 Mulai Ngembangin (Buat Temen-Temen Dev)

1. **Instal Dulu**: `npm install`.
2. **Nyalain Server**: `npm run dev`.
3. **Cek Webnya**: Buka `http://localhost:3000`.

---

## 💡 Ide Buat Masa Depan
1. **Optimasi Batch**: Durasi *sleep* dibikin dinamis biar makin cepet.
2. **Download Hasil**: Fitur buat simpen hasil ke file CSV atau Excel.
3. **Database Lokal**: Pake IndexedDB biar nggak perlu scan ulang kalo cuma mau liat data lama.

---
*Semoga dokumentasi ini ngebantu kalian buat paham dan bahkan ikut ngembangin InstaInsight lebih jauh lagi. Semangat ngoding, ges!*
