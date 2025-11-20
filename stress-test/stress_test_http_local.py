import time
import json
import requests
from statistics import mean

# ===========================================
# KONFIGURASI HTTP LOCAL
# ===========================================
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"
TELEMETRY_URL = f"{BASE_URL}/vehicle-logs/"

# Credentials
EMAIL = "seanousv@gmail.com"
PASSWORD = "Seano2025*"

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
    """Login dan dapatkan access token"""
    print("🔐 Melakukan login...")
    try:
        login_payload = {"email": EMAIL, "password": PASSWORD}

        r = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)

        if r.status_code == 200:
            data = r.json()
            if "access_token" in data:
                print("✅ Login berhasil!\n")
                return data["access_token"]
            else:
                print(f"❌ No access_token in response: {data}")
                return None
        else:
            print(f"❌ Login failed with status {r.status_code}")
            print(f"   Response: {r.text}")
            return None

    except Exception as e:
        print(f"❌ ERROR saat login: {e}")
        return None


# ===========================================
# HTTP STRESS TEST
# ===========================================
def run_http_test(token, iteration_count):
    """Run HTTP stress test dengan jumlah iterasi tertentu"""
    print(f"\n{'='*60}")
    print(f"🚀 HTTP LOCALHOST STRESS TEST - {iteration_count} ITERATIONS")
    print(f"{'='*60}\n")

    latencies = []
    fail = 0
    status_codes = {}

    headers = {"Authorization": f"Bearer {token}"}

    for i in range(iteration_count):
        start = time.time()
        try:
            r = requests.post(
                TELEMETRY_URL, json=payload, timeout=TIMEOUT, headers=headers
            )
            latency = (time.time() - start) * 1000
            latencies.append(latency)

            # Collect status codes
            status = r.status_code
            status_codes[status] = status_codes.get(status, 0) + 1

            print(f"#{i+1} Status: {status} - {latency:.2f} ms")

        except requests.exceptions.Timeout:
            fail += 1
            print(f"#{i+1} ❌ TIMEOUT")
        except requests.exceptions.ConnectionError:
            fail += 1
            print(f"#{i+1} ❌ CONNECTION ERROR")
        except Exception as e:
            fail += 1
            print(f"#{i+1} ❌ ERROR - {str(e)[:50]}")

        time.sleep(0.01)  # Minimal delay

    # Results
    print(f"\n{'='*60}")
    print(f"📊 HASIL HTTP LOCALHOST ({iteration_count} DATA)")
    print(f"{'='*60}\n")

    print(f"Total request        : {iteration_count}")
    print(f"Berhasil             : {iteration_count - fail}")
    print(f"Gagal                : {fail}")

    if status_codes:
        print(f"\nStatus codes:")
        for status, count in sorted(status_codes.items()):
            print(f"  {status}: {count} requests")

    if len(latencies) > 0:
        success_rate = ((iteration_count - fail) / iteration_count) * 100
        print(f"\nSuccess rate         : {success_rate:.2f}%")
        print(f"Rata-rata latency    : {mean(latencies):.2f} ms")
        print(f"Latency minimum      : {min(latencies):.2f} ms")
        print(f"Latency maksimum     : {max(latencies):.2f} ms")
    print()


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("    HTTP LOCALHOST STRESS TEST - MULTIPLE ITERATIONS")
    print("=" * 60)

    # Check if server is running
    print("\n🔍 Checking if server is running...")
    try:
        r = requests.get(f"{BASE_URL}/docs", timeout=5)
        print(f"✅ Server is running at {BASE_URL}\n")
    except Exception as e:
        print(f"❌ Cannot connect to server at {BASE_URL}")
        print(f"   Error: {e}\n")
        exit(1)

    # Login
    token = get_token()

    if not token:
        print("❌ Cannot proceed without valid token!")
        exit(1)

    # Run tests
    for iteration in ITERATIONS:
        run_http_test(token, iteration)
        time.sleep(2)

    print("\n✅ Semua HTTP localhost stress test selesai!\n")
