import asyncio
import importlib
import pkgutil
import traceback

# pastikan app.models adalah package (ada __init__.py)
import app.models
from app.database import AsyncSessionLocal, engine
from app.seeds.seed_roles import seed_roles
from app.seeds.seed_users import seed_users
from app.seeds.seed_permissions import seed_permissions


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
    await import_all_models()  # <--- Tambahin ini sebelum seed jalan
    print("[INFO] Starting database seeding...")
    await seed_roles()
    await seed_users()
    await seed_permissions()
    print("[DONE] All seeders executed successfully.")


if __name__ == "__main__":
    asyncio.run(run_seeders())
