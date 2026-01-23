import { lazy } from 'react'

// Core Widgets
export { default as WidgetCard } from './WidgetCard'
export { default as Dropdown } from './Dropdown'
export { default as DataCard } from './DataCard'

// Vehicle Widgets
export {
  VehicleDropdown,
  VehicleSelector,
  VehicleTable,
  VehicleModal
} from './Vehicle'

// Sensor Widgets
export { SensorChart, SensorModal, SensorTable } from './Sensor'

// SensorType Widgets
export { SensorTypeModal, SensorTypeTable } from './SensorType'

// Gyroscope Widgets - Lazy loaded to avoid loading Three.js on every page
export const Gyroscope3D = lazy(() => import('./Gyroscope/Gyroscope3D.jsx'))

// Map Widgets
export { ViewMap } from './Map'

// Dashboard Widgets
export {
  RecentMissions,
  MissionAnalytics,
  VehicleQuickView,
  OverviewMap,
  LatestAlerts,
  RealtimeMBES
} from './Dashboard'

// Data Management Widgets
export { DataHeader, DataStats, DataTable, DataFilters } from './Data'

// Telemetry Widgets
export {
  TelemetryCards,
  TelemetryFilters,
  TelemetryHeader,
  TelemetryStatusInfo
} from './Telemetry'

// User Management Widgets
export { UserModal, UserTable } from './User'

// Role Management Widgets
export { RoleModal, RoleTable } from './Role'

// Permission Management Widgets
export { PermissionModal, PermissionTable } from './Permission'

// Battery Monitoring Widgets
export {
  BatteryDisplay,
  DualUnitAnalytics,
  IndividualCellVoltages,
  SystemHealth,
  BatteryLog,
  BatteryStatusInfo
} from './Battery'
