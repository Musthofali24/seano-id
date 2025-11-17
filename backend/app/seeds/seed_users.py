from app.models.user import User
from app.models.role import Role, UserRole
from app.database import AsyncSessionLocal
from sqlalchemy import select
import bcrypt


async def seed_users():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        existing_users = result.scalars().all()
        if existing_users:
            print("[INFO] Users already exist, skipping user seeding.")
            return

        result = await session.execute(select(Role).where(Role.name == "Admin"))
        admin_role = result.scalar_one_or_none()
        if not admin_role:
            print("[WARN] No Admin role found. Please seed roles first.")
            return

        password = "Seano2025*"
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode(
            "utf-8"
        )

        admin_user = User(
            email="seanousv@gmail.com",
            password_hash=hashed,
            full_name="Administrator",
            is_verified=True,
        )

        session.add(admin_user)
        await session.flush()

        user_role = UserRole(user_id=admin_user.id, role_id=admin_role.id)
        session.add(user_role)

        await session.commit()
        print(
            f"[SUCCESS] Admin user seeded (email: seanousv@gmail.com, pass: {password})"
        )
