# Email Verification System

Sistem email verification telah ditambahkan untuk mencegah brute force attack dan memastikan email address yang valid.

## Fitur yang Ditambahkan

### 1. Model User (Updated)

- `is_verified`: Boolean field untuk status verifikasi email (default: False)
- `verification_token`: String field untuk menyimpan token verifikasi

### 2. Email Service (`app/services/email_service.py`)

- `send_verification_email()`: Mengirim email verifikasi dengan HTML dan text format
- Mendukung SMTP configuration melalui environment variables
- Fallback ke development mode jika SMTP tidak dikonfigurasi (token di-log saja)

### 3. Auth Service Functions (Updated)

- `generate_verification_token()`: Generate secure random token
- `create_user_with_verification()`: Membuat user unverified + kirim email
- `verify_email()`: Verifikasi email dengan token
- `resend_verification_email()`: Kirim ulang email verifikasi

### 4. API Endpoints

#### POST `/auth/register`

- Membuat user dengan status `is_verified = False`
- Generate verification token
- Kirim email verifikasi
- Response: `{"message": "Registration successful! Please check your email to verify your account."}`

#### POST `/auth/verify-email`

- Body: `{"token": "verification_token"}`
- Verifikasi email dengan token
- Set `is_verified = True` dan hapus token
- Response: `{"message": "email verified successfully"}`

#### POST `/auth/resend-verification`

- Body: `{"email": "user@example.com"}`
- Generate token baru dan kirim email
- Response: `{"message": "verification email sent"}`

#### POST `/auth/login` (Updated)

- Cek kredensial user
- **WAJIB verified**: Tolak login jika `is_verified = False`
- Response error: `{"detail": "Please verify your email address before logging in"}`

## Environment Variables

Untuk production, set environment variables berikut:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

## Security Benefits

1. **Brute Force Protection**: User harus verifikasi email sebelum bisa login
2. **Valid Email**: Memastikan email address benar-benar dapat diakses
3. **Secure Tokens**: Menggunakan `secrets.token_urlsafe(32)` untuk generate token
4. **One-time Use**: Token dihapus setelah verifikasi berhasil

## Development Mode

Tanpa konfigurasi SMTP, sistem akan:

- Log verification token ke console untuk testing
- Tetap return success response
- Tidak mengirim email sebenarnya

## Flow Penggunaan

1. User register → Dapat unverified account + email verifikasi
2. User cek email → Klik link atau copy token
3. User verify email → Account menjadi verified
4. User login → Berhasil karena sudah verified

Atau jika email hilang:

1. User coba login → Ditolak karena belum verified
2. User request resend verification → Dapat email baru
3. User verify → Selesai
