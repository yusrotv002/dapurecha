# Dapur Echa

Game memasak 3D bergaya kartun yang dimainkan langsung di browser. Bantu Echa membuat makanan dan minuman khas Indonesia, sajikan ke pelanggan, dan tepuk serangga pengganggu.

## Cara main

1. Lihat pesanan pelanggan di bagian atas dan resepnya di kiri bawah.
2. Klik **Kulkas** atau **Lemari** untuk mengambil bahan.
3. Drag bahan ke alat masak: **Gelas**, **Talenan**, **Wajan**, **Panci**, atau **Oven**.
4. Drag makanan yang sudah jadi ke **Tray**.
5. Putar kamera 90° ke kaunter, lalu bawa Tray ke pelanggan yang memesan.
6. Klik serangga (lalat, nyamuk, semut) sebelum hinggap. Makanan yang dihinggapi jadi kotor dan harus dibuang.

Selesaikan semua pesanan untuk mendapat tulisan **Berhasil!** dan 1 sampai 3 bintang (makin cepat, makin banyak bintang).

## Kontrol

| Aksi | Laptop | HP (mode mendatar) |
|---|---|---|
| Buka kulkas/lemari | Klik | Tap |
| Pindahkan bahan/makanan | Drag, atau klik lalu klik tujuan | Drag, atau tap lalu tap tujuan |
| Putar kamera ke kaunter / dapur | Tombol panah, Spasi, A / D | Tombol panah atau swipe |
| Tepuk serangga | Klik | Tap |
| Jeda | Esc atau ⏸ | ⏸ |

## 10 level

| Level | Rumah | Menu |
|---|---|---|
| 1 | Rumah Kayu | Es teh manis, pisang goreng |
| 2 | Rumah Joglo | Es jeruk, roti bakar |
| 3 | Rumah Gadang | Telur dadar, teh hangat |
| 4 | Rumah Panggung | Nasi goreng, es campur |
| 5 | Rumah Kebaya | Mie goreng, martabak manis |
| 6 | Rumah Limas | Sate ayam, es cendol |
| 7 | Rumah Honai | Soto ayam, klepon |
| 8 | Rumah Tongkonan | Bakso, gado-gado |
| 9 | Rumah Lamin | Rendang, es doger |
| 10 | Rumah Bali | Nasi tumpeng mini dan semua menu |

Level berikutnya terbuka setelah level sebelumnya berhasil. Progres tersimpan di browser.

## Menjalankan

Buka `index.html` di browser (Chrome, Edge, Firefox, atau Safari terbaru). Tidak perlu instalasi atau server.

Agar bisa dimainkan lewat link, aktifkan **GitHub Pages**: Settings → Pages → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)`.

## Struktur kode

```
index.html      Game siap main (hasil build, satu file)
build.py        Menggabungkan isi src/ menjadi index.html
src/
  index.html    Kerangka HTML
  style.css     Tampilan antarmuka (termasuk tampilan HP)
  engine.js     Mesin 3D WebGL kecil dengan shading kartun
  data.js       Bahan, resep, dan pengaturan 10 level
  assets.js     Ikon, wajah, tekstur, dan gambar rumah adat
  models.js     Model 3D Echa, pelanggan, serangga, dan dapur
  audio.js      Efek suara dan musik (dibuat lewat Web Audio)
  game.js       Logika permainan, kontrol, dan antarmuka
```

Setelah mengubah file di `src/`, jalankan `python3 build.py` untuk membuat ulang `index.html`.
