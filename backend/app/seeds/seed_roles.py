from app.models.role import Role
from app.database import AsyncSessionLocal
from sqlalchemy import select

async def seed_roles():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Role))
        existing = result.scalars().all()
        if existing:
            print("[INFO] Roles already exist, skipping seeding.")
            return

        roles = [
            Role(name="Admin", description="Full access to the all system"),
            Role(name="User", description="Full access to the user system"),
        ]

        session.add_all(roles)
        await session.commit()
        print("[SUCCESS] Default roles seeded.")
