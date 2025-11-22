# app/scripts/reset_db_async.py
import asyncio
import importlib
import pkgutil
import traceback

from app.database import engine, Base
from sqlalchemy import text
import app.models  # pastikan ada __init__.py di folder ini


async def reset_database():
    print("[INFO] 🔄 Loading all models dynamically...")

    # auto-import semua file di app/models
    for _, module_name, _ in pkgutil.iter_modules(app.models.__path__):
        try:
            importlib.import_module(f"app.models.{module_name}")
            print(f"  ↳ Loaded model: {module_name}")
        except Exception as e:
            print(f"[WARN] ⚠️ Failed to import {module_name}: {e}")
            traceback.print_exc()

    print("[INFO] ✅ All models imported successfully.")
    print("[INFO] 🚀 Resetting database schema...")

    async with engine.begin() as conn:
        print("[INFO] Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("[INFO] Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)

        # Convert to Hypertables (TimescaleDB)
        print("[INFO] ⚡ Converting to Hypertables...")
        try:
            # Enable TimescaleDB extension if not exists
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
            
            # Convert tables
            await conn.execute(text("SELECT create_hypertable('sensor_logs', 'created_at', if_not_exists => TRUE);"))
            await conn.execute(text("SELECT create_hypertable('vehicle_logs', 'created_at', if_not_exists => TRUE);"))
            await conn.execute(text("SELECT create_hypertable('raw_logs', 'created_at', if_not_exists => TRUE);"))
            print("[SUCCESS] ✅ Hypertables created.")
        except Exception as e:
            print(f"[WARN] ⚠️ Failed to create hypertables (Is TimescaleDB installed?): {e}")

    print("[SUCCESS] 🎉 Database reset completed.")


if __name__ == "__main__":
    confirm = input("⚠️  This will DROP ALL TABLES. Type 'yes' to continue: ")
    if confirm.lower() == "yes":
        asyncio.run(reset_database())
    else:
        print("❌ Aborted.")
