#!/usr/bin/env python3
"""
MQTT Stress Test - Fokus ke MQTT dengan Worker
- Start MQTT Worker (background)
- Run MQTT Stress Test (50, 100, 300, 500 iterations)
"""

import subprocess
import time
import signal
import sys
import os

PYTHON_BIN = "/home/seanoadmin/seano-id/.venv/bin/python"
PROJECT_DIR = "/home/seanoadmin/seano-id/stress-test"

# Colors
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"


def print_header(text):
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}{text.center(70)}{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")


def main():
    print_header("📡 MQTT STRESS TEST WITH WORKER 📡")

    mqtt_worker_process = None

    try:
        # Start MQTT Worker (background)
        print(f"{YELLOW}🔧 Starting MQTT Worker...{RESET}")

        mqtt_worker_process = subprocess.Popen(
            [PYTHON_BIN, f"{PROJECT_DIR}/mqtt_worker_local.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            preexec_fn=os.setsid,
        )

        time.sleep(3)  # Wait for worker to connect

        if mqtt_worker_process.poll() is None:
            print(
                f"{GREEN}✅ MQTT Worker started (PID: {mqtt_worker_process.pid}){RESET}"
            )
        else:
            print(f"{RED}❌ MQTT Worker failed to start{RESET}")
            return

        # Run MQTT Stress Test
        print(f"\n{YELLOW}📡 Running MQTT Stress Test...{RESET}")
        print(f"   Iterations: 50, 100, 300, 500")
        print(f"   Broker: mqtt.seano.cloud:8883\n")

        result = subprocess.run(
            [PYTHON_BIN, f"{PROJECT_DIR}/stress_test_mqtt_with_csv.py"], cwd=PROJECT_DIR
        )

        # Summary
        print_header("✅ MQTT STRESS TEST COMPLETED!")
        print(f"{GREEN}📁 Results saved to: {PROJECT_DIR}/results/{RESET}\n")

        # List generated files
        print(f"{YELLOW}📄 Generated Files:{RESET}")
        os.system(f"ls -lh {PROJECT_DIR}/results/ | tail -5")

    except KeyboardInterrupt:
        print(f"\n{YELLOW}⏹️  Interrupted by user{RESET}")

    except Exception as e:
        print(f"{RED}❌ Error: {e}{RESET}")

    finally:
        # Cleanup MQTT Worker
        if mqtt_worker_process and mqtt_worker_process.poll() is None:
            print(f"\n{YELLOW}🧹 Stopping MQTT Worker...{RESET}")
            try:
                os.killpg(os.getpgid(mqtt_worker_process.pid), signal.SIGTERM)
                mqtt_worker_process.wait(timeout=5)
                print(f"{GREEN}✅ MQTT Worker stopped{RESET}")
            except:
                os.killpg(os.getpgid(mqtt_worker_process.pid), signal.SIGKILL)
                print(f"{GREEN}✅ MQTT Worker force killed{RESET}")


if __name__ == "__main__":
    main()
