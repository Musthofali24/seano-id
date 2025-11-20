# 🧪 Seano Stress Test Suite

Panduan penggunaan tools stress test untuk menguji performa MQTT Broker dan HTTP API Seano.

## 📋 Prasyarat

Pastikan virtual environment aktif dan dependencies terinstall:

```bash
source ../.venv/bin/activate
pip install -r ../requirements.txt  # (Jika ada, atau pastikan paho-mqtt, requests, psycopg2 terinstall)
```

## 🚀 Menjalankan Test

### 1. Full Stress Test (Recommended)

Menjalankan seluruh rangkaian test: MQTT Worker, HTTP Stress Test, MQTT Stress Test, dan Comparison.

```bash
python run_all_tests.py
```

### 2. MQTT Only Test

Hanya menjalankan stress test untuk MQTT (dengan worker otomatis berjalan di background).

```bash
python run_mqtt_stress_test.py
```

### 3. HTTP Localhost Test

Untuk testing API yang berjalan di local (`localhost:8000`).

```bash
python stress_test_http_local.py
```

## 🛠️ Utilities

### Reset Database

Script ini akan menghapus semua tabel di database Docker (`seano_timescaledb`), membuat ulang schema, dan menjalankan seeder. Sangat berguna untuk mengembalikan state database ke awal sebelum test.

```bash
python reset_db_docker.py
```

### Check Database

Cek koneksi dan jumlah data di database.

```bash
python check_db.py
```

## 📂 Struktur File

| File                           | Deskripsi                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `run_all_tests.py`             | **Main Script**. Orchestrator untuk menjalankan semua test secara berurutan.            |
| `run_mqtt_stress_test.py`      | Script khusus untuk menjalankan stress test MQTT saja.                                  |
| `mqtt_worker_local.py`         | Worker yang subscribe ke MQTT topic dan menyimpan data ke DB (simulasi backend worker). |
| `stress_test_mqtt_with_csv.py` | Script pengirim data (publisher) ke MQTT untuk load testing.                            |
| `stress_test_http.py`          | Script pengirim data HTTP POST ke API Production/Staging.                               |
| `stress_test_http_local.py`    | Script pengirim data HTTP POST ke API Localhost.                                        |
| `comparison_test.py`           | Membandingkan latency antara HTTP dan MQTT.                                             |
| `reset_db_docker.py`           | Utility untuk reset database via Docker.                                                |
| `results/`                     | Folder output hasil test (CSV dan logs).                                                |

## 📊 Hasil Test

Semua hasil test (CSV) akan tersimpan otomatis di folder `results/`.
