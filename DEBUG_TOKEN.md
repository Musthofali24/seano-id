# Token & Refresh Token Debugging

## Perubahan untuk Testing

### Backend (Go)

File: `/backend/internal/util/jwt.go`

- **Access Token Expiry**: 1 jam → **1 menit** (untuk testing)
- **Refresh Token Expiry**: 7 hari (tidak diubah)

### Frontend (JavaScript)

File: `/frontend/src/utils/axiosConfig.js`

- **Refresh Threshold**: 15 menit → **30 detik** (untuk testing)
- **Logging ditambahkan**: Console log menampilkan sisa waktu token dan status refresh

## Cara Testing

1. Login ke aplikasi
2. Buka browser console (F12)
3. Perhatikan log berikut:
   - `🔍 Token check: expires in Xs, should refresh: true/false`
   - `🔄 Refreshing access token...`
   - `✅ Token refreshed successfully`
   - `✅ New refresh token saved`

## Timeline Expected

- **T+0s**: Login, dapat access token (expire dalam 60 detik)
- **T+30s**: Token check menunjukkan "expires in 30s, should refresh: true"
- **T+30s**: Auto refresh token dimulai
- **T+31s**: Token baru didapat, expired dalam 60 detik lagi
- **T+61s**: Token check lagi, refresh lagi
- **Loop continues...**

## Masalah yang Dicari

1. Apakah refresh token berhasil dipanggil otomatis?
2. Apakah ada error saat refresh?
3. Apakah setelah 1 jam user tetap logout meskipun refresh token sudah jalan?
4. Apakah refresh token sendiri expired?

## Kembalikan ke Normal

Setelah debugging, ubah kembali:

### Backend

```go
ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)), // Kembalikan ke 1 jam
```

### Frontend

```javascript
const fifteenMinutes = 15 * 60 * 1000; // Kembalikan ke 15 menit
```

Dan hapus console.log yang ditambahkan.
