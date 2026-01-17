export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.seano.cloud'

// WebSocket URL (same as API but with ws/wss protocol)
export const WS_URL = API_BASE_URL.replace(/^http/, 'ws')

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER_EMAIL: `${API_BASE_URL}/auth/register-email`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    SET_CREDENTIALS: `${API_BASE_URL}/auth/set-credentials`,
    RESEND_VERIFICATION: `${API_BASE_URL}/auth/resend-verification`,
    ME: `${API_BASE_URL}/auth/me`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`
  },

  USERS: {
    LIST: `${API_BASE_URL}/users/`,
    BY_ID: id => `${API_BASE_URL}/users/${id}`,
    CREATE: `${API_BASE_URL}/users/`,
    UPDATE: id => `${API_BASE_URL}/users/${id}`,
    DELETE: id => `${API_BASE_URL}/users/${id}`
  },

  ROLES: {
    LIST: `${API_BASE_URL}/roles/`,
    BY_ID: id => `${API_BASE_URL}/roles/${id}`,
    CREATE: `${API_BASE_URL}/roles/`,
    UPDATE: id => `${API_BASE_URL}/roles/${id}`,
    DELETE: id => `${API_BASE_URL}/roles/${id}`
  },

  PERMISSIONS: {
    LIST: `${API_BASE_URL}/permissions/`,
    BY_ID: id => `${API_BASE_URL}/permissions/${id}`,
    CREATE: `${API_BASE_URL}/permissions/`,
    UPDATE: id => `${API_BASE_URL}/permissions/${id}`,
    DELETE: id => `${API_BASE_URL}/permissions/${id}`,
    ASSIGN_TO_ROLE: `${API_BASE_URL}/permissions/assign-to-role`,
    REMOVE_FROM_ROLE: (roleId, permissionId) =>
      `${API_BASE_URL}/permissions/remove-from-role/${roleId}/${permissionId}`
  },

  SENSORS: {
    LIST: `${API_BASE_URL}/sensors/`,
    BY_ID: id => `${API_BASE_URL}/sensors/${id}`,
    CREATE: `${API_BASE_URL}/sensors/`,
    UPDATE: id => `${API_BASE_URL}/sensors/${id}`,
    DELETE: id => `${API_BASE_URL}/sensors/${id}`
  },

  SENSOR_TYPES: {
    LIST: `${API_BASE_URL}/sensor-types/`,
    BY_ID: id => `${API_BASE_URL}/sensor-types/${id}`,
    CREATE: `${API_BASE_URL}/sensor-types/`,
    UPDATE: id => `${API_BASE_URL}/sensor-types/${id}`,
    DELETE: id => `${API_BASE_URL}/sensor-types/${id}`
  },

  SENSOR_LOGS: {
    LIST: `${API_BASE_URL}/sensor-logs/`,
    BY_ID: id => `${API_BASE_URL}/sensor-logs/${id}`,
    BY_VEHICLE: vehicleId =>
      `${API_BASE_URL}/sensor-logs/?vehicle_id=${vehicleId}`,
    CREATE: `${API_BASE_URL}/sensor-logs/`,
    DELETE: id => `${API_BASE_URL}/sensor-logs/${id}`
  },

  // Vehicle endpoints
  VEHICLES: {
    LIST: `${API_BASE_URL}/vehicles/`,
    BY_ID: id => `${API_BASE_URL}/vehicles/${id}`,
    CREATE: `${API_BASE_URL}/vehicles/`,
    UPDATE: id => `${API_BASE_URL}/vehicles/${id}`,
    DELETE: id => `${API_BASE_URL}/vehicles/${id}`,
    ALERTS: id => `${API_BASE_URL}/vehicles/${id}/alerts`,
    RAW_LOGS: vehicleId => `${API_BASE_URL}/raw-logs/?vehicle_id=${vehicleId}`,
    SENSOR_LOGS: vehicleId =>
      `${API_BASE_URL}/sensor-logs/?vehicle_id=${vehicleId}`,
    ASSIGN_SENSOR: id => `${API_BASE_URL}/vehicles/${id}/sensors`,
    GET_SENSORS: id => `${API_BASE_URL}/vehicles/${id}/sensors`,
    REMOVE_SENSOR: (id, sensorId) =>
      `${API_BASE_URL}/vehicles/${id}/sensors/${sensorId}`
  },

  // Raw Logs endpoints
  RAW_LOGS: {
    LIST: `${API_BASE_URL}/raw-logs/`,
    BY_ID: id => `${API_BASE_URL}/raw-logs/${id}`,
    CREATE: `${API_BASE_URL}/raw-logs/`,
    DELETE: id => `${API_BASE_URL}/raw-logs/${id}`,
    STATS: `${API_BASE_URL}/raw-logs/stats`
  },

  // Vehicle Logs endpoints
  VEHICLE_LOGS: {
    LIST: `${API_BASE_URL}/vehicle-logs/`,
    BY_ID: id => `${API_BASE_URL}/vehicle-logs/${id}`,
    CREATE: `${API_BASE_URL}/vehicle-logs/`,
    DELETE: id => `${API_BASE_URL}/vehicle-logs/${id}`,
    LATEST: vehicleId => `${API_BASE_URL}/vehicle-logs/latest/${vehicleId}`
  },

  // Gyroscope endpoints (custom)
  GYROSCOPE: {
    BY_VEHICLE: vehicleId => `${API_BASE_URL}/gyroscope/${vehicleId}`
  },

  // Battery endpoints (custom)
  BATTERY: {
    BY_VEHICLE: vehicleId =>
      `${API_BASE_URL}/vehicles/batteries/?vehicle_id=${vehicleId}`
  },

  // Notifications endpoints (if exists)
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/api/notifications`
  },

  // Missions endpoints (if exists)
  MISSIONS: {
    LIST: `${API_BASE_URL}/api/missions`
  }
}

// Public assets
export const PUBLIC_ASSETS = {
  INDONESIA_MAP: '/indonesia_land.json'
}
