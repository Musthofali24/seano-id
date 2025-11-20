#!/usr/bin/env python3
"""
MQTT Stress Test Report Generator
- Read CSV hasil test
- Generate comprehensive report
- Show database insertion stats
"""

import os
import csv
import psycopg2
from datetime import datetime, timedelta
from pathlib import Path

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "seano_db"
DB_USER = "postgres"
DB_PASS = "da25f4bcdfe0147"

RESULTS_DIR = "/home/seanoadmin/seano-id/stress-test/results"


def get_csv_stats(filename):
    """Extract statistics dari CSV file"""
    filepath = os.path.join(RESULTS_DIR, filename)

    if not os.path.exists(filepath):
        return None

    latencies = []
    with open(filepath, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                latency_str = row.get("latency_ms", "N/A")
                if latency_str != "N/A":
                    latencies.append(float(latency_str))
            except:
                pass

    if not latencies:
        return None

    return {
        "count": len(latencies),
        "min": min(latencies),
        "max": max(latencies),
        "avg": sum(latencies) / len(latencies),
    }


def get_db_stats():
    """Get statistics dari database"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, database=DB_NAME, user=DB_USER, password=DB_PASS
        )
        cursor = conn.cursor()

        # Total records
        cursor.execute("SELECT COUNT(*) FROM vehicle_logs")
        total = cursor.fetchone()[0]

        # Recent records (last 10 minutes)
        ten_min_ago = datetime.now() - timedelta(minutes=10)
        cursor.execute(
            "SELECT COUNT(*) FROM vehicle_logs WHERE created_at >= %s", (ten_min_ago,)
        )
        recent = cursor.fetchone()[0]

        cursor.close()
        conn.close()

        return {"total": total, "recent": recent}
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        return None


print("\n" + "=" * 80)
print("  🔬 MQTT STRESS TEST - COMPREHENSIVE REPORT")
print("=" * 80 + "\n")

# Database Stats
print("📊 DATABASE STATISTICS")
print("-" * 80)
db_stats = get_db_stats()
if db_stats:
    print(f"Total records in vehicle_logs:     {db_stats['total']}")
    print(f"Records from last 10 minutes:      {db_stats['recent']}")
else:
    print("Could not retrieve database stats")

# CSV Results
print(f"\n📁 STRESS TEST RESULTS (CSV FILES)")
print("-" * 80)

csv_files = sorted(
    [
        f
        for f in os.listdir(RESULTS_DIR)
        if f.startswith("mqtt_test_") and f.endswith(".csv")
    ]
)

if csv_files:
    total_latencies = []

    for csv_file in csv_files:
        stats = get_csv_stats(csv_file)
        if stats:
            print(f"\n{csv_file}:")
            print(f"  Messages: {stats['count']}")
            print(f"  Avg Latency: {stats['avg']:.2f} ms")
            print(f"  Min Latency: {stats['min']:.2f} ms")
            print(f"  Max Latency: {stats['max']:.2f} ms")
            total_latencies.extend([stats["min"], stats["avg"], stats["max"]])

    if total_latencies:
        print(f"\n📈 OVERALL LATENCY STATISTICS")
        print("-" * 80)
        print(
            f"Overall Avg Latency: {sum(total_latencies)/len(total_latencies):.2f} ms"
        )
        print(f"Overall Min Latency: {min(total_latencies):.2f} ms")
        print(f"Overall Max Latency: {max(total_latencies):.2f} ms")
else:
    print("No CSV files found in results directory")

# Summary
print(f"\n" + "=" * 80)
print("✅ REPORT GENERATED")
print("=" * 80 + "\n")

# Show all files
print("📄 All Generated Files:")
for f in sorted(os.listdir(RESULTS_DIR)):
    filepath = os.path.join(RESULTS_DIR, f)
    size = os.path.getsize(filepath)
    print(f"   {f} ({size} bytes)")

print("\n")
