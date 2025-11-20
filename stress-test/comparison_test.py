#!/usr/bin/env python3
"""
Comparison Script: HTTP API vs MQTT
- Run both HTTP dan MQTT stress test
- Compare latency, success rate
- Generate comparison report dalam CSV
"""

import time
import json
import csv
import requests
from datetime import datetime
from statistics import mean, stdev
import paho.mqtt.client as mqtt

# ==========================================
# HTTP CONFIG
# ==========================================
LOGIN_URL = "https://api.seano.cloud/auth/login"
TELEMETRY_URL = "https://api.seano.cloud/vehicle-logs/"
EMAIL = "seanousv@gmail.com"
PASSWORD = "Seano2025*"
TIMEOUT = 10

# ==========================================
# MQTT CONFIG
# ==========================================
MQTT_BROKER = "mqtt.seano.cloud"
MQTT_PORT = 8883
MQTT_USER = "seanomqtt"
MQTT_PASS = "Seano2025*"
MQTT_USE_TLS = True
MQTT_PUB_TOPIC = "seano/USV-K47/vehicle_log"
MQTT_ACK_TOPIC = "seano/USV-K47/ack"

# Iteration untuk test
TEST_ITERATIONS = 50  # Untuk quick comparison

payload_data = {
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

# ==========================================
# GLOBAL RESULTS
# ==========================================
http_results = []
mqtt_results = []
mqtt_acks_received = {}


# ==========================================
# HTTP TEST
# ==========================================
def get_token():
    """Login dan dapatkan token"""
    print("🔐 Melakukan login ke API...")
    try:
        r = requests.post(
            LOGIN_URL, json={"email": EMAIL, "password": PASSWORD}, timeout=TIMEOUT
        )
        data = r.json()

        if "access_token" not in data:
            print("❌ LOGIN GAGAL!", data)
            return None

        print("✅ Login berhasil\n")
        return data["access_token"]

    except Exception as e:
        print(f"❌ ERROR saat login: {e}")
        return None


def run_http_test(token, iteration_count):
    """Run HTTP stress test"""
    global http_results

    print(f"\n{'='*60}")
    print(f"🌐 HTTP API STRESS TEST - {iteration_count} ITERATIONS")
    print(f"{'='*60}\n")

    http_results = []
    headers = {"Authorization": f"Bearer {token}"}

    for i in range(iteration_count):
        start = time.time()
        try:
            r = requests.post(
                TELEMETRY_URL, json=payload_data, timeout=TIMEOUT, headers=headers
            )
            latency = (time.time() - start) * 1000
            http_results.append(
                {
                    "index": i + 1,
                    "timestamp": start,
                    "latency": latency,
                    "status_code": r.status_code,
                    "success": r.status_code == 200,
                }
            )
            print(f"#{i+1} Status: {r.status_code} - {latency:.2f} ms")

        except Exception as e:
            latency = (time.time() - start) * 1000
            http_results.append(
                {
                    "index": i + 1,
                    "timestamp": start,
                    "latency": latency,
                    "status_code": 0,
                    "success": False,
                }
            )
            print(f"#{i+1} ❌ FAIL - {str(e)[:40]}")

        time.sleep(0.05)

    # Print results
    successful = sum(1 for r in http_results if r["success"])
    latencies = [r["latency"] for r in http_results if r["success"]]

    print(f"\n{'='*60}")
    print(f"📊 HASIL HTTP API ({iteration_count} DATA)")
    print(f"{'='*60}\n")
    print(f"Total request        : {iteration_count}")
    print(f"Berhasil             : {successful}")
    print(f"Gagal                : {iteration_count - successful}")

    if latencies:
        success_rate = (successful / iteration_count) * 100
        print(f"Success rate         : {success_rate:.2f}%")
        print(f"Rata-rata latency    : {mean(latencies):.2f} ms")
        print(f"Latency minimum      : {min(latencies):.2f} ms")
        print(f"Latency maksimum     : {max(latencies):.2f} ms")
        if len(latencies) > 1:
            print(f"Std deviation        : {stdev(latencies):.2f} ms")

    return http_results


# ==========================================
# MQTT TEST
# ==========================================
def run_mqtt_test(iteration_count):
    """Run MQTT stress test"""
    global mqtt_results, mqtt_acks_received

    print(f"\n{'='*60}")
    print(f"📡 MQTT STRESS TEST - {iteration_count} ITERATIONS")
    print(f"{'='*60}\n")

    mqtt_results = []
    mqtt_acks_received = {}
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    if MQTT_USER and MQTT_PASS:
        client.username_pw_set(MQTT_USER, MQTT_PASS)
        if MQTT_USE_TLS:
            client.tls_set()

    def on_message(client, userdata, msg):
        try:
            ack = json.loads(msg.payload.decode())
            sent = ack.get("sent_at")
            received = ack.get("received_at")

            if sent and received:
                latency_ms = (received - sent) * 1000
                mqtt_acks_received[sent] = {
                    "latency": latency_ms,
                    "received_at": received,
                }
        except:
            pass

    def on_connect(client, userdata, flags, rc, properties=None):
        if rc == 0:
            client.subscribe(MQTT_ACK_TOPIC, qos=1)

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(MQTT_BROKER, MQTT_PORT)
    client.loop_start()
    time.sleep(2)

    # Publish payloads
    print("📤 Publishing payloads...")
    for i in range(iteration_count):
        sent_at = time.time()
        payload = payload_data.copy()
        payload["sent_at"] = sent_at

        client.publish(MQTT_PUB_TOPIC, json.dumps(payload), qos=1)
        mqtt_results.append(
            {
                "index": i + 1,
                "timestamp": sent_at,
                "ack_received": False,
                "latency": None,
            }
        )
        print(f"  #{i+1}/{iteration_count} published")
        time.sleep(0.05)

    # Wait for ACKs
    print("\n⏳ Waiting for ACKs...")
    time.sleep(12)
    client.loop_stop()
    client.disconnect()

    # Update results dengan ACK data
    for result in mqtt_results:
        sent_at = result["timestamp"]
        if sent_at in mqtt_acks_received:
            result["ack_received"] = True
            result["latency"] = mqtt_acks_received[sent_at]["latency"]

    # Print results
    ack_count = sum(1 for r in mqtt_results if r["ack_received"])
    latencies = [r["latency"] for r in mqtt_results if r["latency"] is not None]

    print(f"\n{'='*60}")
    print(f"📊 HASIL MQTT ({iteration_count} DATA)")
    print(f"{'='*60}\n")
    print(f"Total published      : {iteration_count}")
    print(f"ACK received         : {ack_count}")
    print(f"ACK failed           : {iteration_count - ack_count}")

    if latencies:
        success_rate = (ack_count / iteration_count) * 100
        print(f"Success rate         : {success_rate:.2f}%")
        print(f"Rata-rata latency    : {mean(latencies):.2f} ms")
        print(f"Latency minimum      : {min(latencies):.2f} ms")
        print(f"Latency maksimum     : {max(latencies):.2f} ms")
        if len(latencies) > 1:
            print(f"Std deviation        : {stdev(latencies):.2f} ms")
    else:
        print("⚠️  No ACK received!")

    return mqtt_results


# ==========================================
# COMPARISON & EXPORT
# ==========================================
def generate_comparison_report():
    """Generate comparison report"""
    print(f"\n{'='*60}")
    print(f"📊 COMPARISON REPORT: HTTP vs MQTT")
    print(f"{'='*60}\n")

    http_latencies = [r["latency"] for r in http_results if r["success"]]
    mqtt_latencies = [r["latency"] for r in mqtt_results if r["ack_received"]]

    http_success_rate = (
        (sum(1 for r in http_results if r["success"]) / len(http_results) * 100)
        if http_results
        else 0
    )
    mqtt_success_rate = (
        (sum(1 for r in mqtt_results if r["ack_received"]) / len(mqtt_results) * 100)
        if mqtt_results
        else 0
    )

    comparison_data = {
        "metric": [
            "Total Requests",
            "Success Rate",
            "Avg Latency (ms)",
            "Min Latency (ms)",
            "Max Latency (ms)",
            "Std Dev (ms)",
        ],
        "HTTP API": [
            len(http_results),
            f"{http_success_rate:.2f}%",
            f"{mean(http_latencies):.2f}" if http_latencies else "N/A",
            f"{min(http_latencies):.2f}" if http_latencies else "N/A",
            f"{max(http_latencies):.2f}" if http_latencies else "N/A",
            f"{stdev(http_latencies):.2f}" if len(http_latencies) > 1 else "N/A",
        ],
        "MQTT": [
            len(mqtt_results),
            f"{mqtt_success_rate:.2f}%",
            f"{mean(mqtt_latencies):.2f}" if mqtt_latencies else "N/A",
            f"{min(mqtt_latencies):.2f}" if mqtt_latencies else "N/A",
            f"{max(mqtt_latencies):.2f}" if mqtt_latencies else "N/A",
            f"{stdev(mqtt_latencies):.2f}" if len(mqtt_latencies) > 1 else "N/A",
        ],
    }

    for i, metric in enumerate(comparison_data["metric"]):
        print(
            f"{metric:25} | HTTP: {comparison_data['HTTP API'][i]:>20} | MQTT: {comparison_data['MQTT'][i]:>20}"
        )

    return comparison_data


def export_comparison_csv(comparison_data, filename=None):
    """Export comparison ke CSV"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"comparison_{TEST_ITERATIONS}_{timestamp}.csv"

    filepath = f"/home/seanoadmin/seano-id/stress-test/results/{filename}"

    try:
        with open(filepath, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Metric", "HTTP API", "MQTT"])

            for i, metric in enumerate(comparison_data["metric"]):
                writer.writerow(
                    [metric, comparison_data["HTTP API"][i], comparison_data["MQTT"][i]]
                )

        print(f"\n✅ Comparison report disimpan ke: {filepath}")
        return filepath
    except Exception as e:
        print(f"❌ Error saving comparison CSV: {e}")
        return None


def export_detailed_csv(filename=None):
    """Export detailed results (HTTP dan MQTT bersama-sama)"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"detailed_results_{TEST_ITERATIONS}_{timestamp}.csv"

    filepath = f"/home/seanoadmin/seano-id/stress-test/results/{filename}"

    try:
        with open(filepath, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(
                [
                    "Index",
                    "HTTP_Latency_ms",
                    "HTTP_Success",
                    "MQTT_Latency_ms",
                    "MQTT_ACK",
                ]
            )

            for i in range(max(len(http_results), len(mqtt_results))):
                http_lat = (
                    f"{http_results[i]['latency']:.2f}"
                    if i < len(http_results)
                    else "N/A"
                )
                http_ok = (
                    "Yes"
                    if (i < len(http_results) and http_results[i]["success"])
                    else "No"
                )

                mqtt_lat = (
                    f"{mqtt_results[i]['latency']:.2f}"
                    if (i < len(mqtt_results) and mqtt_results[i]["ack_received"])
                    else "N/A"
                )
                mqtt_ok = (
                    "Yes"
                    if (i < len(mqtt_results) and mqtt_results[i]["ack_received"])
                    else "No"
                )

                writer.writerow([i + 1, http_lat, http_ok, mqtt_lat, mqtt_ok])

        print(f"✅ Detailed results disimpan ke: {filepath}")
        return filepath
    except Exception as e:
        print(f"❌ Error saving detailed CSV: {e}")
        return None


if __name__ == "__main__":
    import os

    os.makedirs("/home/seanoadmin/seano-id/stress-test/results", exist_ok=True)

    print("\n" + "=" * 60)
    print("    COMPARISON TEST: HTTP API vs MQTT")
    print("=" * 60)

    # Get token
    token = get_token()
    if not token:
        print("❌ Tidak bisa melanjutkan tanpa token!")
        exit(1)

    # Run HTTP test
    run_http_test(token, TEST_ITERATIONS)
    time.sleep(3)

    # Run MQTT test
    run_mqtt_test(TEST_ITERATIONS)
    time.sleep(2)

    # Generate comparison
    comparison = generate_comparison_report()

    # Export to CSV
    export_comparison_csv(comparison)
    export_detailed_csv()

    print("\n✅ Comparison test selesai!\n")
