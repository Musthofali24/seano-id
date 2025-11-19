from app.models.permission import Permission, RolePermission
from app.models.role import Role
from app.database import AsyncSessionLocal
from sqlalchemy import select


async def seed_permissions():
    """Seed initial permissions into the database"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Permission))
        existing = result.scalars().all()
        if existing:
            print("[INFO] Permissions already exist, skipping seeding.")
            return

        # Define all permissions in the system
        permissions = [
            # ===== DATA OPERATIONS =====
            # Tracking
            Permission(name="tracking.read", description="View tracking data"),
            Permission(name="tracking.export", description="Export tracking data"),
            # Missions
            Permission(name="missions.create", description="Create missions"),
            Permission(name="missions.read", description="View missions"),
            Permission(name="missions.update", description="Update missions"),
            Permission(name="missions.delete", description="Delete missions"),
            # Telemetry
            Permission(name="telemetry.read", description="View telemetry data"),
            Permission(name="telemetry.export", description="Export telemetry data"),
            # ===== DATA MONITORING =====
            # Log
            Permission(name="logs.read", description="View logs"),
            Permission(name="logs.delete", description="Delete logs"),
            # Alerts
            Permission(name="alerts.read", description="View alerts"),
            Permission(name="alerts.acknowledge", description="Acknowledge alerts"),
            # Notifications
            Permission(name="notifications.read", description="View notifications"),
            Permission(name="notifications.delete", description="Delete notifications"),
            # ===== DATA MANAGEMENT (Own Data) =====
            # Vehicle (Own)
            Permission(name="vehicles.create", description="Create own vehicles"),
            Permission(name="vehicles.read", description="View own vehicles"),
            Permission(name="vehicles.update", description="Update own vehicles"),
            Permission(name="vehicles.delete", description="Delete own vehicles"),
            # Data (Sensor Logs - Own)
            Permission(name="sensor_logs.read", description="View own sensor logs"),
            Permission(name="sensor_logs.export", description="Export own sensor logs"),
            # Sensor (Own)
            Permission(name="sensors.create", description="Create own sensors"),
            Permission(name="sensors.read", description="View own sensors"),
            Permission(name="sensors.update", description="Update own sensors"),
            Permission(name="sensors.delete", description="Delete own sensors"),
            # ===== USER MANAGEMENT (Admin Only) =====
            # Users
            Permission(name="users.create", description="Create users"),
            Permission(name="users.read", description="View users"),
            Permission(name="users.update", description="Update users"),
            Permission(name="users.delete", description="Delete users"),
            # Roles
            Permission(name="roles.create", description="Create roles"),
            Permission(name="roles.read", description="View roles"),
            Permission(name="roles.update", description="Update roles"),
            Permission(name="roles.delete", description="Delete roles"),
            # Permissions
            Permission(name="permissions.create", description="Create permissions"),
            Permission(name="permissions.read", description="View permissions"),
            Permission(name="permissions.update", description="Update permissions"),
            Permission(name="permissions.delete", description="Delete permissions"),
            # ===== SYSTEM MANAGEMENT (Admin Only) =====
            # Sensor Type (System)
            Permission(name="sensor_types.create", description="Create sensor types"),
            Permission(name="sensor_types.read", description="View sensor types"),
            Permission(name="sensor_types.update", description="Update sensor types"),
            Permission(name="sensor_types.delete", description="Delete sensor types"),
            # Raw Logs (System)
            Permission(name="raw_logs.read", description="View raw logs"),
            Permission(name="raw_logs.delete", description="Delete raw logs"),
            # ===== DASHBOARD =====
            Permission(name="dashboard.access", description="Access dashboard"),
        ]

        session.add_all(permissions)
        await session.commit()
        print(f"[SUCCESS] {len(permissions)} permissions seeded.")

        # Now assign permissions to roles
        result = await session.execute(select(Role).where(Role.name == "Admin"))
        admin_role = result.scalar_one_or_none()

        result = await session.execute(select(Role).where(Role.name == "User"))
        user_role = result.scalar_one_or_none()

        if admin_role:
            # Admin gets ALL permissions
            all_permissions = await session.execute(select(Permission))
            admin_permissions = all_permissions.scalars().all()

            for perm in admin_permissions:
                role_permission = RolePermission(
                    role_id=admin_role.id, permission_id=perm.id
                )
                session.add(role_permission)

            await session.commit()
            print(
                f"[SUCCESS] Admin role assigned {len(admin_permissions)} permissions."
            )

        if user_role:
            # User gets:
            # - All DATA OPERATIONS (tracking, missions, telemetry)
            # - All DATA MONITORING (logs, alerts, notifications)
            # - Own DATA MANAGEMENT (vehicles, sensors, sensor_logs - but only for their own data)
            # - Dashboard access
            user_permissions = [
                "tracking.read",
                "tracking.export",
                "missions.create",
                "missions.read",
                "missions.update",
                "missions.delete",
                "telemetry.read",
                "telemetry.export",
                "logs.read",
                "logs.delete",
                "alerts.read",
                "alerts.acknowledge",
                "notifications.read",
                "notifications.delete",
                "vehicles.create",
                "vehicles.read",
                "vehicles.update",
                "vehicles.delete",
                "sensors.create",
                "sensors.read",
                "sensors.update",
                "sensors.delete",
                "sensor_logs.read",
                "sensor_logs.export",
                "dashboard.access",
            ]

            result = await session.execute(
                select(Permission).where(Permission.name.in_(user_permissions))
            )
            user_perms = result.scalars().all()

            for perm in user_perms:
                role_permission = RolePermission(
                    role_id=user_role.id, permission_id=perm.id
                )
                session.add(role_permission)

            await session.commit()
            print(f"[SUCCESS] User role assigned {len(user_perms)} permissions.")
