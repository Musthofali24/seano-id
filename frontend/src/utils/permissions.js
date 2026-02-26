/**
 * Permission utility functions
 */

/**
 * Check if user has permission (client-side only, not secure!)
 * This is just for UI - always check permissions on backend!
 */
export const hasPermission = (permissions, permissionName) => {
  return permissions?.includes(permissionName) ?? false
}

/**
 * Check if user has any of the given permissions
 */
export const hasAnyPermission = (permissions, permissionNames) => {
  return permissionNames?.some(p => permissions?.includes(p)) ?? false
}

/**
 * Check if user has all of the given permissions
 */
export const hasAllPermissions = (permissions, permissionNames) => {
  return permissionNames?.every(p => permissions?.includes(p)) ?? false
}

/**
 * Check if user is admin (has users.read permission)
 */
export const isAdmin = permissions => {
  return permissions?.includes('users.read') ?? false
}

/**
 * Permission constants for common operations
 */
export const PERMISSIONS = {
  // Data Operations
  TRACKING_READ: 'tracking.read',
  TRACKING_EXPORT: 'tracking.export',
  MISSIONS_CREATE: 'missions.create',
  MISSIONS_READ: 'missions.read',
  MISSIONS_UPDATE: 'missions.update',
  MISSIONS_DELETE: 'missions.delete',

  // Data Monitoring
  LOGS_READ: 'logs.read',
  LOGS_DELETE: 'logs.delete',
  ALERTS_READ: 'alerts.read',
  ALERTS_ACKNOWLEDGE: 'alerts.acknowledge',
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_DELETE: 'notifications.delete',

  // Data Management
  VEHICLES_CREATE: 'vehicles.create',
  VEHICLES_READ: 'vehicles.read',
  VEHICLES_UPDATE: 'vehicles.update',
  VEHICLES_DELETE: 'vehicles.delete',
  SENSORS_CREATE: 'sensors.create',
  SENSORS_READ: 'sensors.read',
  SENSORS_UPDATE: 'sensors.update',
  SENSORS_DELETE: 'sensors.delete',
  SENSOR_LOGS_READ: 'sensor_logs.read',
  SENSOR_LOGS_EXPORT: 'sensor_logs.export',

  // User Management
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  ROLES_CREATE: 'roles.create',
  ROLES_READ: 'roles.read',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  PERMISSIONS_CREATE: 'permissions.create',
  PERMISSIONS_READ: 'permissions.read',
  PERMISSIONS_UPDATE: 'permissions.update',
  PERMISSIONS_DELETE: 'permissions.delete',

  // System Management
  SENSOR_TYPES_CREATE: 'sensor_types.create',
  SENSOR_TYPES_READ: 'sensor_types.read',
  SENSOR_TYPES_UPDATE: 'sensor_types.update',
  SENSOR_TYPES_DELETE: 'sensor_types.delete',
  RAW_LOGS_READ: 'raw_logs.read',
  RAW_LOGS_DELETE: 'raw_logs.delete',

  // Dashboard
  DASHBOARD_ACCESS: 'dashboard.access'
}

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  PERMISSIONS
}
