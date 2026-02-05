# 📑 Dokumentasi Teknis InstaInsight: Ngulik Sampe Akar-akarnya!

Halo semuanya! 👋 Dokumentasi ini gue buat biar lo semua, mau yang masih baru belajar ngoding (*beginner*) ataupun yang udah mastah, bisa paham banget gimananya InstaInsight Analyzer bekerja dari awal sampe akhir. 

Kita bakal bahas santai tapi tetep mendalam ya, no debat!

---

## 🚀 Filosofi: Aman di Depan, Pinter di Belakang
Prinsip utama kita cuma satu: **Data lo adalah raja.** 
Gue gak pernah, dan gak bakal pernah minta password Instagram lo. Kita manfaatin sesi browser yang udah aktif biar pengambilan datanya legal, aman, dan nggak bikin pusing.

---

## 🛠️ "Jeroan" Teknologi (*Tech Stack*)
- **React 19**: Versi paling gres buat bikin UI yang responsif dan sat-set.
- **Vite 6**: Alat *build* yang kenceng banget, bikin ngoding makin asik tanpa mager.
- **TypeScript**: Biar kita gak pusing semriwing gara-gara bug tipe data.
- **Tailwind CSS**: Biar desainnya makin estetik dan gampang diatur.
- **PWA**: Biar web kita bisa dikantongin di HP (bisa diinstal langsung).

---

## 🏗️ Cara Kerja & Alur Data (Flow-nya Tuh Gini...)

Aplikasi kita ini tipenya **Client-Only**. Artinya, semua proses "masak" datanya terjadi di browser lo sendiri. Gak ada data yang terbang ke server asing, aman jaya!

### 1. Pengarahan Data (*Data Acquisition*)
Instagram itu jagain datanya pake aturan CORS yang ketat banget. Jadi, web luar nggak bisa sembarangan manggil API mereka.
**Trik Jitunya:**
- Kita kasih **Scraper Script** (JS murni) yang bisa lo jalanin di tab `instagram.com`.
- Karena dijalankan di situ, script kita dapet "lampu hijau" buat nanya ke API internal Instagram (`/api/v1/friendships/...`) pake sesi lo yang udah aktif.

### 2. Biar Gak Kena Marah Instagram (*Evasion & Reliability*)
Instagram itu sensitif banget sama bot. Makanya kita pasang fitur ala pro:
- **Rotasi App-ID**: Header `X-IG-App-ID` kita gilir biar nggak gampang ketauan kalo itu script otomatis.
- **Waktunya Rehat (*Rate Limit*)**: Kalo kena error `429`, script kita bakal "break" dulu 60 detik. Ada timer-nya juga, jadi lo nggak bakal bingung kenapa scriptnya berhenti.

### 3. Sinkronisasi Data
Setelah dapet ribuan data, script bakal ngirim balik ke aplikasi utama lewat dua jalur:
- **Jalur Utama**: Pake `window.postMessage` (otomatis sinkron).
- **Jalur Cadangan**: Copy-Paste manual teks JSON lewat Clipboard (kalo jalur otomatis lagi mager).

### 4. Otak Pemrosesan (`utils/instagramParser.ts`)
Di sinilah keajaiban matematika "pertemanan" terjadi:
- **Yah, Gak Follback**: `Following \ Followers` (Yang lo follow tapi nggak ada di daftar pengikut).
- **Fans Rahasia**: `Followers \ Following` (Pengikut yang lo sendiri belum follow balik).
- **Mutual Sejati**: `Following ∩ Followers` (Daftar temen yang saling support).

---

## 📁 Napak Tilas Folder
```text
├── components/          # Kumpulan komponen UI (Stats card, daftar user, scanner)
├── services/            # Logika buat ngobrol sama API Instagram
├── utils/
│   ├── browserScript.ts # Pabrik pembuat script scraper (Injectable JS)
│   └── instagramParser.ts # Otak yang ngitung relasi follower
├── types.ts             # Definisi tipe data biar aman sentosa
├── App.tsx              # Dirjen utamanya (State & Alur UI)
└── site.webmanifest     # Paspor PWA biar bisa diinstal
```

---

## 🚦 Mulai Ngembangin (Buat Para Dev)

1. **Instal Dulu**: `npm install`.
2. **Nyalain Server**: `npm run dev`.
3. **Cek Webnya**: Buka `http://localhost:3000`.

---

## 💡 Ide Buat Masa Depan
1. **Dynamic Batching**: Durasi *sleep* dibikin dinamis biar makin kenceng.
2. **Export Data**: Fitur buat simpen hasil ke file CSV atau Excel.
3. **Persistence**: Pake IndexedDB biar nggak perlu scan ulang kalo pengen liat data lama.

---
*Moga-moga dokumentasi ini ngebantu lo buat paham dan bahkan ikut ngembangin InstaInsight lebih jauh lagi. Semangat ngoding, jangan mager!*
