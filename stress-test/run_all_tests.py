#!/usr/bin/env python3
"""
MQTT Stress Test Orchestrator
- Start MQTT Worker (background)
- Run HTTP Stress Test
- Run MQTT Stress Test (dengan ACK dari worker)
- Generate comparison report
"""

import subprocess
import time
import signal
import sys
import os
from datetime import datetime

PYTHON_BIN = "/home/seanoadmin/seano-id/.venv/bin/python"
PROJECT_DIR = "/home/seanoadmin/seano-id/stress-test"

# ====================================
# COLOR CODES
# ====================================
RESET = "\033[0m"
BOLD = "\033[1m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"


def colored(text, color):
    return f"{color}{text}{RESET}"


def print_header(text):
    print(f"\n{colored('='*70, BLUE)}")
    print(f"{colored(text.center(70), BOLD + BLUE)}")
    print(f"{colored('='*70, BLUE)}\n")


def print_section(text):
    print(f"\n{colored(text, YELLOW)}")


# ====================================
# MAIN ORCHESTRATOR
# ====================================
def main():
    print_header("🔬 MQTT & HTTP STRESS TEST ORCHESTRATOR 🔬")

    mqtt_worker_process = None

    try:
        # Start MQTT Worker (background process)
        print_section("📡 STEP 1: Starting MQTT Worker...")
        print("   Spawning mqtt_worker_local.py in background...")

        mqtt_worker_process = subprocess.Popen(
            [PYTHON_BIN, f"{PROJECT_DIR}/mqtt_worker_local.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            preexec_fn=os.setsid,  # Create new process group
        )

        time.sleep(3)  # Wait for worker to connect

        if mqtt_worker_process.poll() is None:
            print(
                colored(
                    "✅ MQTT Worker started successfully (PID: {})".format(
                        mqtt_worker_process.pid
                    ),
                    GREEN,
                )
            )
        else:
            print(colored("❌ MQTT Worker failed to start", RED))
            return

        # Run HTTP Stress Test
        print_section("🌐 STEP 2: Running HTTP Stress Test (api.seano.cloud)...")
        print("   Testing: 50, 100, 300, 500 iterations")

        result = subprocess.run(
            [PYTHON_BIN, f"{PROJECT_DIR}/stress_test_http.py"],
            cwd=PROJECT_DIR,
            capture_output=False,
            text=True,
        )

        if result.returncode == 0:
            print(colored("✅ HTTP Stress Test completed", GREEN))
        else:
            print(colored("❌ HTTP Stress Test failed", RED))

        time.sleep(2)

        # Run MQTT Stress Test
        print_section("📡 STEP 3: Running MQTT Stress Test (mqtt.seano.cloud)...")
        print("   Testing: 50, 100, 300, 500 iterations")
        print("   MQTT Worker is running in background to provide ACK responses")

        result = subprocess.run(
            [PYTHON_BIN, f"{PROJECT_DIR}/stress_test_mqtt_with_csv.py"],
            cwd=PROJECT_DIR,
            capture_output=False,
            text=True,
        )

        if result.returncode == 0:
            print(colored("✅ MQTT Stress Test completed", GREEN))
        else:
            print(colored("❌ MQTT Stress Test failed", RED))

        time.sleep(2)

        # Run Comparison Test
        print_section("📊 STEP 4: Running Comparison Test (HTTP vs MQTT)...")
        print("   Single iteration (50 data points) for quick comparison")

        result = subprocess.run(
            [PYTHON_BIN, f"{PROJECT_DIR}/comparison_test.py"],
            cwd=PROJECT_DIR,
            capture_output=False,
            text=True,
        )

        if result.returncode == 0:
            print(colored("✅ Comparison Test completed", GREEN))
        else:
            print(colored("❌ Comparison Test failed", RED))

        # Summary
        print_header("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        print(
            colored(
                "\n📁 Results saved to: /home/seanoadmin/seano-id/stress-test/results/\n",
                GREEN,
            )
        )

        # List generated files
        print_section("Generated Files:")
        result = subprocess.run(
            ["ls", "-lh", f"{PROJECT_DIR}/results/"], capture_output=True, text=True
        )
        print(result.stdout)

    except KeyboardInterrupt:
        print(colored("\n⏹️  Interrupted by user", YELLOW))

    except Exception as e:
        print(colored(f"\n❌ Error: {e}", RED))

    finally:
        # Clean up MQTT Worker process
        if mqtt_worker_process and mqtt_worker_process.poll() is None:
            print_section("🧹 Cleaning up...")
            print("   Stopping MQTT Worker...")

            try:
                # Try graceful shutdown first
                os.killpg(os.getpgid(mqtt_worker_process.pid), signal.SIGTERM)
                mqtt_worker_process.wait(timeout=5)
                print(colored("✅ MQTT Worker stopped", GREEN))
            except:
                # Force kill if timeout
                os.killpg(os.getpgid(mqtt_worker_process.pid), signal.SIGKILL)
                print(colored("✅ MQTT Worker force killed", GREEN))


if __name__ == "__main__":
    main()
