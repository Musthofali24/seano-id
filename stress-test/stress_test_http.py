import time
import json
import requests
from statistics import mean

# ===========================================
# KONFIGURASI SEANO API
# ===========================================
LOGIN_URL = "https://api.seano.cloud/auth/login"
TELEMETRY_URL = "https://api.seano.cloud/vehicle-logs/"

EMAIL = "seanousv@gmail.com"  # GANTI SESUAI USER API KAMU
PASSWORD = "Seano2025*"  # GANTI SESUAI USER API KAMU

# Iteration counts untuk stress test
ITERATIONS = [50, 100, 300, 500]
TIMEOUT = 10

payload = {
    "vehicle_id": 1,
    "battery_voltage": "13.76",
    "battery_current": None,
    "rssi": -66,
    "mode": "MANUAL",
    "latitude": "-6.21077422",
    "longitude": "106.84813904",
    "altitude": "109.39",
    "gps_fix": 4,
    "heading": "266.22",
    "speed": "3.51",
    "roll": "-1.74",
    "pitch": "-0.0",
    "yaw": "129.91",
    "temperature": "34.13",
    "armed": False,
    "guided": False,
    "system_status": None,
}


# ===========================================
# LOGIN → GET TOKEN
# ===========================================
def get_token():
    print("🔐 Melakukan login ke API...")
    try:
        r = requests.post(
            LOGIN_URL, json={"email": EMAIL, "password": PASSWORD}, timeout=TIMEOUT
        )
        data = r.json()

        if "access_token" not in data:
            print("❌ LOGIN GAGAL!", data)
            return None

        print("✅ Login berhasil, token diterima.\n")
        return data["access_token"]

    except Exception as e:
        print(f"❌ ERROR saat login: {e}")
        return None


# ===========================================
# HTTP STRESS TEST
# ===========================================
def run_http_test(token, iteration_count):
    """Run HTTP stress test dengan jumlah iterasi tertentu"""
    print(f"\n{'='*50}")
    print(f"🚀 HTTP API STRESS TEST - {iteration_count} ITERATIONS")
    print(f"{'='*50}\n")

    latencies = []
    fail = 0

    headers = {"Authorization": f"Bearer {token}"}

    for i in range(iteration_count):
        start = time.time()
        try:
            r = requests.post(
                TELEMETRY_URL, json=payload, timeout=TIMEOUT, headers=headers
            )
            latency = (time.time() - start) * 1000
            latencies.append(latency)
            print(f"#{i+1} Status: {r.status_code} - {latency:.2f} ms")

        except Exception as e:
            fail += 1
            print(f"#{i+1} ❌ FAIL - {str(e)[:50]}")

        time.sleep(0.05)

    # Results
    print(f"\n{'='*50}")
    print(f"📊 HASIL HTTP API ({iteration_count} DATA)")
    print(f"{'='*50}\n")

    print(f"Total request        : {iteration_count}")
    print(f"Berhasil             : {iteration_count - fail}")
    print(f"Gagal                : {fail}")

    if len(latencies) > 0:
        success_rate = ((iteration_count - fail) / iteration_count) * 100
        print(f"Success rate         : {success_rate:.2f}%")
        print(f"Rata-rata latency    : {mean(latencies):.2f} ms")
        print(f"Latency minimum      : {min(latencies):.2f} ms")
        print(f"Latency maksimum     : {max(latencies):.2f} ms")
    print()


if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("    HTTP API STRESS TEST - MULTIPLE ITERATIONS")
    print("=" * 50)

    token = get_token()

    if token:
        for iteration in ITERATIONS:
            run_http_test(token, iteration)
            time.sleep(2)

        print("\n✅ Semua HTTP API stress test selesai!\n")
    else:
        print("❌ Tidak bisa melanjutkan tanpa token!")
