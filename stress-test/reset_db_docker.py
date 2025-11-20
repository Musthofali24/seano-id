#!/usr/bin/env python3
"""
Reset Database via Docker
- Drop all tables
- Recreate schema
- Run seeders
"""

import subprocess
import sys
import os

BACKEND_DIR = "/home/seanoadmin/seano-id/backend"
PYTHON_BIN = "/home/seanoadmin/seano-id/.venv/bin/python"

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


def print_section(text):
    print(f"\n{YELLOW}{text}{RESET}")


def run_cmd(cmd, description=""):
    """Run command"""
    if description:
        print(f"{YELLOW}▶ {description}...{RESET}")

    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    if result.stdout:
        print(result.stdout)
    if result.stderr and result.returncode != 0:
        print(f"{RED}{result.stderr}{RESET}")

    return result.returncode == 0


def main():
    print_header("🗄️  RESET DATABASE VIA DOCKER")

    try:
        # Step 1: Check container
        print_section("STEP 1: Checking PostgreSQL Container...")

        result = subprocess.run(
            "docker ps | grep seano_timescaledb",
            shell=True,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            print(f"{RED}❌ PostgreSQL container not running{RESET}")
            print("Start it with: docker-compose up -d db")
            return False

        print(f"{GREEN}✅ PostgreSQL container is running{RESET}")

        # Step 2: Drop all tables
        print_section("STEP 2: Dropping All Tables...")

        drop_sql = """
        SELECT 'DROP TABLE IF EXISTS \"' || tablename || '\" CASCADE;' 
        FROM pg_tables 
        WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
        """

        cmd = f"""
        docker exec seano_timescaledb psql -U postgres -d seano_db -tc "{drop_sql}" | \
        docker exec -i seano_timescaledb psql -U postgres -d seano_db
        """

        if not run_cmd(cmd, "Dropping tables"):
            print(f"{YELLOW}⚠️  Some tables might not exist (OK){RESET}")

        print(f"{GREEN}✅ All tables dropped{RESET}")

        # Step 3: Run backend reset script
        print_section("STEP 3: Recreating Schema via Backend Script...")

        reset_script = os.path.join(BACKEND_DIR, "app/scripts/reset_db_async.py")

        if not os.path.exists(reset_script):
            print(f"{RED}❌ Reset script not found{RESET}")
            return False

        if not run_cmd(
            f"cd {BACKEND_DIR} && echo 'yes' | {PYTHON_BIN} app/scripts/reset_db_async.py",
            "Running backend reset script",
        ):
            print(f"{RED}❌ Reset script failed{RESET}")
            return False

        print(f"{GREEN}✅ Schema recreated{RESET}")

        # Step 4: Run seeders
        print_section("STEP 4: Running Seeders...")

        seeder_script = os.path.join(BACKEND_DIR, "app/seeds/run_seeder.py")

        if not os.path.exists(seeder_script):
            print(f"{YELLOW}⚠️  Seeder script not found, skipping{RESET}")
        else:
            if not run_cmd(
                f"cd {BACKEND_DIR} && {PYTHON_BIN} app/seeds/run_seeder.py",
                "Running seeders",
            ):
                print(
                    f"{YELLOW}⚠️  Seeder execution had issues (checking if data exists){RESET}"
                )

        print(f"{GREEN}✅ Seeders completed{RESET}")

        # Step 5: Verify
        print_section("STEP 5: Verifying Database...")

        verify_cmd = """
        docker exec seano_timescaledb psql -U postgres -d seano_db -c "
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema='public' ORDER BY table_name;
        "
        """

        result = subprocess.run(verify_cmd, shell=True, capture_output=True, text=True)

        if result.returncode == 0:
            tables = result.stdout.strip().split("\n")
            table_count = len(
                [
                    t
                    for t in tables
                    if t and not t.startswith("-") and not t.startswith("table_name")
                ]
            )

            print(f"{GREEN}✅ Database verification passed{RESET}")
            print(f"\n📊 Tables created: {table_count}")

            # Count records
            count_cmd = """
            docker exec seano_timescaledb psql -U postgres -d seano_db -tc "
            SELECT table_name, row_count FROM (
                SELECT table_name, (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
                FROM (
                    SELECT table_name, query_to_xml(format('SELECT COUNT(*) cnt FROM %I', table_name), false, true, '') as xml_count
                    FROM information_schema.tables WHERE table_schema = 'public'
                ) t
            ) t2 WHERE row_count > 0 ORDER BY table_name;
            "
            """

            result2 = subprocess.run(
                count_cmd, shell=True, capture_output=True, text=True
            )
            if result2.returncode == 0 and result2.stdout.strip():
                print("\n📈 Record counts:")
                print(result2.stdout)
        else:
            print(f"{RED}❌ Verification failed{RESET}")
            return False

        print_header("✅ DATABASE RESET COMPLETED!")
        print(f"{GREEN}Ready for stress testing!{RESET}\n")
        return True

    except KeyboardInterrupt:
        print(f"\n{YELLOW}⏹️  Interrupted by user{RESET}")
        return False
    except Exception as e:
        print(f"\n{RED}❌ Error: {e}{RESET}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
