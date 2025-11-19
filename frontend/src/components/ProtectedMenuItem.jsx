import { usePermission } from "../../hooks/usePermission";

/**
 * Component to conditionally render menu items based on user permissions
 * Usage: <ProtectedMenuItem permission="vehicles.read" children={<MenuItem ... />} />
 */
export function ProtectedMenuItem({
  permission,
  permissions = [],
  children,
  fallback = null,
}) {
  const permissionContext = usePermission();

  // Allow if specific permission granted
  if (permission && permissionContext.hasPermission(permission)) {
    return children;
  }

  // Allow if any of the permissions granted
  if (
    permissions.length > 0 &&
    permissionContext.hasAnyPermission(permissions)
  ) {
    return children;
  }

  // Show fallback or nothing
  return fallback;
}

export default ProtectedMenuItem;
