import asyncio
import importlib
import pkgutil
import traceback
import app.models
from app.database import AsyncSessionLocal, engine
from app.seeds.seed_roles import seed_roles
from app.seeds.seed_users import seed_users
from app.seeds.seed_permissions import seed_permissions
from app.seeds.seed_sensor_types import seed_sensor_types
from app.seeds.seed_sensors import seed_sensors


async def import_all_models():
    print("[INFO] Loading all models before seeding...")
    for _, module_name, _ in pkgutil.iter_modules(app.models.__path__):
        try:
            importlib.import_module(f"app.models.{module_name}")
            print(f"  ↳ Loaded model: {module_name}")
        except Exception as e:
            print(f"[WARN] Failed importing {module_name}: {e}")
            traceback.print_exc()
    print("[INFO] All models imported successfully.")


async def run_seeders():
    await import_all_models()
    print("[INFO] Starting database seeding...")
    await seed_roles()
    await seed_permissions()
    await seed_users()
    await seed_sensor_types()
    await seed_sensors()
    print("[DONE] All seeders executed successfully.")


if __name__ == "__main__":
    asyncio.run(run_seeders())
