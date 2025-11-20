#!/usr/bin/env python3
"""
MQTT Stress Test dengan CSV Export
- Publish data ke MQTT broker
- Measure latency (publish to ACK received)
- Export hasil ke CSV
"""

import time
import json
import csv
from datetime import datetime
from statistics import mean, stdev
import paho.mqtt.client as mqtt

# ==========================================
# KONFIG MQTT CLOUD
# ==========================================
BROKER = "mqtt.seano.cloud"
PORT = 8883
USER = "seanomqtt"
PASS = "Seano2025*"
USE_TLS = True

PUB_TOPIC = "seano/USV-K47/vehicle_log"
ACK_TOPIC = "seano/USV-K47/ack"

# Iteration untuk test
ITERATIONS = [50, 100, 300, 500]

payload_template = {
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
# GLOBAL VARIABLES
# ==========================================
acks_received = {}
test_results = []


def run_mqtt_test(iteration_count):
    """Run MQTT stress test dan export ke CSV"""
    global acks_received, test_results

    print(f"\n{'='*60}")
    print(f"🚀 MQTT STRESS TEST - {iteration_count} ITERATIONS")
    print(f"{'='*60}\n")

    acks_received = {}
    iteration_results = []
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    if USER and PASS:
        client.username_pw_set(USER, PASS)
        if USE_TLS:
            client.tls_set()
        print(f"🔐 MQTT auth enabled (TLS: {USE_TLS})\n")
    else:
        print("🔓 No auth required\n")

    def on_message(client, userdata, msg):
        try:
            ack = json.loads(msg.payload.decode())
            sent = ack.get("sent_at")
            received = ack.get("received_at")

            if sent and received:
                latency_ms = (received - sent) * 1000
                acks_received[sent] = {"latency": latency_ms, "received_at": received}
        except:
            pass

    def on_connect(client, userdata, flags, rc, properties=None):
        if rc == 0:
            client.subscribe(ACK_TOPIC, qos=1)

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(BROKER, PORT)
    client.loop_start()
    time.sleep(2)

    # Send payloads
    print("📤 Publishing payloads...")
    for i in range(iteration_count):
        sent_at = time.time()
        payload = payload_template.copy()
        payload["sent_at"] = sent_at

        client.publish(PUB_TOPIC, json.dumps(payload), qos=1)
        iteration_results.append(
            {"index": i + 1, "sent_at": sent_at, "received_ack": False, "latency": None}
        )
        print(f"  #{i+1}/{iteration_count} sent")
        time.sleep(0.05)

    # Wait for ACKs
    print("\n⏳ Waiting for ACKs...")
    time.sleep(15)
    client.loop_stop()
    client.disconnect()

    # Update results dengan ACK data
    for result in iteration_results:
        sent_at = result["sent_at"]
        if sent_at in acks_received:
            result["received_ack"] = True
            result["latency"] = acks_received[sent_at]["latency"]

    # Results
    print(f"\n{'='*60}")
    print(f"📊 HASIL MQTT ({iteration_count} DATA)")
    print(f"{'='*60}\n")

    ack_count = sum(1 for r in iteration_results if r["received_ack"])
    latencies = [r["latency"] for r in iteration_results if r["latency"] is not None]

    print(f"Total published      : {iteration_count}")
    print(f"ACK received         : {ack_count}")
    print(f"ACK failed           : {iteration_count - ack_count}")

    if len(latencies) > 0:
        success_rate = (ack_count / iteration_count) * 100
        print(f"Success rate         : {success_rate:.2f}%")
        print(f"Rata-rata latency    : {mean(latencies):.2f} ms")
        print(f"Latency minimum      : {min(latencies):.2f} ms")
        print(f"Latency maksimum     : {max(latencies):.2f} ms")
        if len(latencies) > 1:
            print(f"Std deviation        : {stdev(latencies):.2f} ms")
    else:
        print(f"⚠️  No ACK received!")

    # Save iteration results
    test_results.append(
        {
            "iteration": iteration_count,
            "total_published": iteration_count,
            "ack_received": ack_count,
            "success_rate": (
                (ack_count / iteration_count) * 100 if iteration_count > 0 else 0
            ),
            "avg_latency": mean(latencies) if latencies else None,
            "min_latency": min(latencies) if latencies else None,
            "max_latency": max(latencies) if latencies else None,
            "std_latency": stdev(latencies) if len(latencies) > 1 else None,
            "details": iteration_results,
        }
    )

    return iteration_results


def export_to_csv(iteration_count, results, filename=None):
    """Export hasil test ke CSV"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"mqtt_test_{iteration_count}_{timestamp}.csv"

    filepath = f"/home/seanoadmin/seano-id/stress-test/results/{filename}"

    try:
        with open(filepath, "w", newline="") as f:
            writer = csv.DictWriter(
                f, fieldnames=["index", "sent_at", "received_ack", "latency_ms"]
            )
            writer.writeheader()

            for result in results:
                writer.writerow(
                    {
                        "index": result["index"],
                        "sent_at": result["sent_at"],
                        "received_ack": "Yes" if result["received_ack"] else "No",
                        "latency_ms": (
                            f"{result['latency']:.2f}" if result["latency"] else "N/A"
                        ),
                    }
                )

        print(f"✅ Hasil disimpan ke: {filepath}")
        return filepath
    except Exception as e:
        print(f"❌ Error saving CSV: {e}")
        return None


def export_summary_csv(filename=None):
    """Export summary hasil semua test ke CSV"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"mqtt_summary_{timestamp}.csv"

    filepath = f"/home/seanoadmin/seano-id/stress-test/results/{filename}"

    try:
        with open(filepath, "w", newline="") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "iteration",
                    "total_published",
                    "ack_received",
                    "success_rate",
                    "avg_latency_ms",
                    "min_latency_ms",
                    "max_latency_ms",
                    "std_latency_ms",
                ],
            )
            writer.writeheader()

            for result in test_results:
                writer.writerow(
                    {
                        "iteration": result["iteration"],
                        "total_published": result["total_published"],
                        "ack_received": result["ack_received"],
                        "success_rate": f"{result['success_rate']:.2f}%",
                        "avg_latency_ms": (
                            f"{result['avg_latency']:.2f}"
                            if result["avg_latency"]
                            else "N/A"
                        ),
                        "min_latency_ms": (
                            f"{result['min_latency']:.2f}"
                            if result["min_latency"]
                            else "N/A"
                        ),
                        "max_latency_ms": (
                            f"{result['max_latency']:.2f}"
                            if result["max_latency"]
                            else "N/A"
                        ),
                        "std_latency_ms": (
                            f"{result['std_latency']:.2f}"
                            if result["std_latency"]
                            else "N/A"
                        ),
                    }
                )

        print(f"✅ Summary disimpan ke: {filepath}")
        return filepath
    except Exception as e:
        print(f"❌ Error saving summary CSV: {e}")
        return None


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("    MQTT STRESS TEST - MULTIPLE ITERATIONS WITH CSV EXPORT")
    print("=" * 60)

    # Create results directory if not exists
    import os

    os.makedirs("/home/seanoadmin/seano-id/stress-test/results", exist_ok=True)

    # Run tests
    for iteration in ITERATIONS:
        results = run_mqtt_test(iteration)
        export_to_csv(iteration, results)
        time.sleep(2)

    # Export summary
    export_summary_csv()

    print("\n✅ Semua MQTT stress test selesai!\n")
