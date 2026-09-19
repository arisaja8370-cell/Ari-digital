# Ari Digital — Tahap 2: Data pelanggan tersimpan

Tahap ini mengubah editor Template 01 dari localStorage-only menjadi penyimpanan server-side memakai Netlify Functions + Netlify Blobs.

## Yang aktif
- POST `/api/invitations`: membuat undangan dan slug unik.
- GET `/api/invitations?slug=...`: mengambil data publik.
- PUT `/api/invitations?slug=...` + header `X-Edit-Token`: mengubah undangan milik pemilik token.
- Editor membuat slug seperti `dian-faisal`, lalu menyimpan data ke server.
- Halaman `invitation.html?slug=dian-faisal` mengambil data dari server.
- Template 01 menerima data dan mengubah nama, tamu, tanggal, waktu, lokasi, alamat, Maps, serta foto URL.

## Penting untuk deployment
Versi ini membutuhkan Netlify Functions dan Netlify Blobs, jadi bukan lagi static-only. Netlify mendokumentasikan bahwa Functions berada di `netlify/functions` dan dapat memakai Netlify Blobs untuk penyimpanan persisten. Karena itu, deploy harus melalui metode yang memproses Functions (mis. continuous deployment/repository atau Netlify CLI), bukan sekadar upload static folder saja.

## Belum ada
- Login/register akun pelanggan
- Payment gateway
- PRO berdasarkan webhook
- Upload foto file ke storage
- Admin CRUD database
- Rate limiting/anti-abuse tingkat produksi
- Backup/export otomatis

## Keamanan
Edit token tidak ditampilkan oleh GET publik. Simpan token di browser pemilik editor. Untuk produksi komersial, tahap berikutnya perlu autentikasi akun, rate limiting, validasi URL gambar, dan pengamanan CORS.
