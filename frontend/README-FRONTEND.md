# SEANO-ID Frontend Documentation

<div align="center">

**React + Vite Maritime Monitoring Dashboard**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Folder Structure](#-folder-structure)
- [Component Architecture](#-component-architecture)
- [Quick Reference](#-quick-reference)
- [Development Guide](#-development-guide)
- [Performance Optimization](#-performance-optimization)
- [Best Practices](#-best-practices)
- [Deployment](#-deployment)

## 🌊 Overview

Modern, responsive web dashboard for maritime vessel monitoring and control. Built with React 18 and Vite for optimal performance and developer experience.

### Key Features

- 🚢 Real-time vessel tracking with interactive maps
- 📊 Live telemetry data visualization
- 🗺️ Mission planning with waypoint management
- 📡 WebSocket integration for live updates
- 🎨 Dark mode support
- 📱 Fully responsive design
- 🔐 Role-based access control
- 📈 Historical data analysis

## ✨ Features

### Dashboard

- Overview cards with real-time statistics
- Recent missions list
- Latest alerts feed
- Vehicle quick view
- Interactive map with vessel markers
- Battery level monitoring

### Vessel Tracking

- Real-time GPS tracking on Leaflet maps
- Multiple vessel monitoring
- Vehicle status indicators
- Telemetry data display
- 3D gyroscope visualization

### Mission Planning

- Interactive waypoint editor
- Mission timeline
- Auto-home functionality
- Mission history and analytics
- Export mission data

### Sensor Monitoring

- Real-time sensor data streams
- Multiple sensor type support
- Historical data charts
- Data export capabilities
- Sensor health monitoring

### User Management

- User CRUD operations
- Role and permission management
- Activity logging
- Profile management

## 🛠️ Tech Stack

### Core

- **React 18.2** - UI library
- **Vite 5.0** - Build tool & dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS framework

### State Management & Data

- **React Context API** - Global state management
- **Custom Hooks** - Reusable stateful logic (30+ hooks)
- **Axios** - HTTP client with interceptors

### UI Components

- **React Icons** - Icon library (Font Awesome, etc.)
- **date-fns** - Date manipulation & formatting
- **Recharts** - Chart library for data visualization
- **Leaflet** - Interactive maps
- **Three.js** - 3D visualization (Gyroscope)

### Real-time Features

- **WebSocket** - Live data streaming
- **MQTT Client** - Sensor data subscription

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running (see backend README)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables

Create a `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8080/ws

# Map Configuration (optional)
VITE_MAP_CENTER_LAT=-6.200000
VITE_MAP_CENTER_LNG=106.816666
VITE_MAP_ZOOM=13

# Feature Flags (optional)
VITE_ENABLE_3D_GYROSCOPE=true
VITE_ENABLE_DARK_MODE=true
```

### Development Server

```bash
# Start dev server
npm run dev

# Server will start on http://localhost:5173
```

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview

# Build output will be in /dist folder
```

## 📁 Folder Structure

```
src/
├── assets/                  # Static assets (images, logos, fonts)
│   └── Partner/             # Partner logos
│
├── components/              # Reusable React components
│   ├── Layout/              # Layout components
│   │   ├── Header.jsx       # Top navigation bar
│   │   ├── Sidebar.jsx      # Side navigation
│   │   ├── Topbar.jsx       # Secondary top bar
│   │   └── index.js         # Barrel exports
│   │
│   ├── Skeleton/            # Loading skeleton components
│   │   ├── WidgetCardSkeleton.jsx
│   │   └── index.js
│   │
│   ├── Widgets/             # Feature-specific widgets (15+ groups)
│   │   ├── Battery/         # Battery monitoring widgets
│   │   ├── Dashboard/       # Dashboard-specific widgets
│   │   │   ├── VehicleQuickView.jsx
│   │   │   ├── OverviewMap.jsx
│   │   │   ├── RecentMissions.jsx
│   │   │   └── LatestAlerts.jsx
│   │   ├── Data/            # Data visualization widgets
│   │   ├── DatePicker/      # Date picker components
│   │   ├── Gyroscope/       # 3D Gyroscope (Three.js)
│   │   ├── Map/             # Map-related widgets
│   │   │   └── ViewMap.jsx  # Leaflet map component
│   │   ├── Mission/         # Mission management
│   │   │   ├── MissionPlanner.jsx
│   │   │   ├── MissionTable.jsx
│   │   │   └── MissionModal.jsx
│   │   ├── Permission/      # Permission management
│   │   ├── Role/            # Role management
│   │   ├── Sensor/          # Sensor widgets
│   │   ├── SensorType/      # Sensor type widgets
│   │   ├── Telemetry/       # Telemetry display
│   │   ├── Tracking/        # Vehicle tracking widgets
│   │   ├── User/            # User management
│   │   ├── Vehicle/         # Vehicle management
│   │   │   ├── VehicleDropdown.jsx
│   │   │   ├── VehicleModal.jsx
│   │   │   ├── VehicleTable.jsx
│   │   │   └── AddVehicleWizard.jsx
│   │   ├── WidgetCard.jsx   # Reusable widget container
│   │   ├── Dropdown.jsx     # Generic dropdown
│   │   └── index.js         # Barrel exports
│   │
│   ├── ui/                  # Core UI components
│   │   ├── ConfirmModal.jsx # Confirmation dialog
│   │   ├── Content.jsx      # Content wrapper
│   │   ├── DataTable.jsx    # Generic table component
│   │   ├── LoadingDots.jsx  # Small loader animation
│   │   ├── LoadingScreen.jsx # Full page loader
│   │   ├── Main.jsx         # Main layout wrapper
│   │   ├── Modal.jsx        # Generic modal
│   │   ├── Title.jsx        # Page title component
│   │   ├── WizardModal.jsx  # Multi-step modal
│   │   ├── toast.jsx        # Toast notifications
│   │   └── index.js         # ✨ Barrel exports
│   │
│   ├── ErrorBoundary.jsx    # Error boundary component
│   ├── LoadingWrapper.jsx   # Loading state wrapper
│   ├── ProtectedRoute.jsx   # Auth route wrapper
│   ├── PublicRoute.jsx      # Public route wrapper
│   └── RegistrationRoute.jsx # Registration flow wrapper
│
├── constant/                # Application constants
│   └── index.jsx            # API endpoints, configs, etc.
│
├── contexts/                # React Context providers
│   ├── AuthContext.jsx      # Authentication state
│   ├── PermissionContext.jsx # Permission checking
│   ├── PermissionProvider.jsx # Permission provider
│   └── index.js             # ✨ Barrel exports
│
├── hooks/                   # Custom React hooks (30+)
│   ├── useAuth.js           # Authentication hook
│   ├── useAuthContext.js    # Auth context hook
│   ├── usePermission.js     # Permission checking
│   │
│   ├── useVehicleData.js    # Vehicle data fetching
│   ├── useVehicleAlerts.js  # Vehicle alerts
│   ├── useVehicleBattery.js # Battery data
│   ├── useVehicleRawLogs.js # Raw logs
│   ├── useVehicleSensorLogs.js # Sensor logs
│   │
│   ├── useMissionData.js    # Mission data
│   ├── useSensorData.js     # Sensor data
│   ├── useSensorTypesData.js # Sensor types
│   ├── useSensorsData.js    # All sensors
│   ├── useTelemetryData.js  # Telemetry data
│   ├── useBatteryData.js    # Battery stats
│   ├── useAlertData.js      # Alerts
│   ├── useNotificationData.js # Notifications
│   ├── useLogData.js        # Logs
│   ├── useRawLogData.js     # Raw logs
│   ├── useUserData.js       # User data
│   ├── useRoleData.js       # Role data
│   ├── usePermissionData.js # Permission data
│   │
│   ├── useGyroscopeData.js  # Gyroscope data
│   ├── useMQTT.js           # MQTT connection
│   ├── useTitle.js          # Page title setter
│   ├── useLoadingTimeout.js # Loading state helper
│   └── index.js             # ✨ Barrel exports
│
├── pages/                   # Page components (routes)
│   ├── auth/                # Authentication pages
│   │   ├── Login.jsx
│   │   ├── EmailRegistration.jsx
│   │   ├── SetAccount.jsx
│   │   ├── CheckEmailVerification.jsx
│   │   ├── VerifyEmail.jsx
│   │   └── index.js         # ✨ Barrel exports
│   │
│   ├── Dashboard.jsx        # Main dashboard
│   ├── Tracking.jsx         # Vehicle tracking page
│   ├── Missions.jsx         # Mission list page
│   ├── MissionPlanner.jsx   # Mission planning page
│   ├── Telemetry.jsx        # Telemetry page
│   ├── Data.jsx             # Data analysis page
│   ├── Control.jsx          # Vehicle control page
│   ├── Vehicle.jsx          # Vehicle management
│   ├── Sensor.jsx           # Sensor management
│   ├── SensorType.jsx       # Sensor type management
│   ├── SensorMonitoring.jsx # Sensor monitoring
│   ├── Battery.jsx          # Battery monitoring
│   ├── Alerts.jsx           # Alerts page
│   ├── Notification.jsx     # Notifications
│   ├── Log.jsx              # Logs page
│   ├── User.jsx             # User management
│   ├── Role.jsx             # Role management
│   ├── Permission.jsx       # Permission management
│   ├── Profile.jsx          # User profile
│   ├── Settings.jsx         # Settings page
│   └── Landing.jsx          # Landing page
│
├── utils/                   # Utility functions
│   ├── axiosConfig.js       # Axios instance & interceptors
│   ├── permissions.js       # Permission helpers
│   ├── missionCalculations.js # Mission calculations
│   └── index.js             # ✨ Barrel exports
│
├── App.jsx                  # Main App component
├── main.jsx                 # Application entry point
├── config.js                # App configuration
└── index.css                # Global styles
```

### Key Principles

#### 1. Separation of Concerns

- **Components**: Reusable UI elements
- **Widgets**: Feature-specific composed components
- **Pages**: Route-level components
- **Hooks**: Reusable stateful logic
- **Utils**: Pure utility functions

#### 2. Barrel Exports (index.js)

Each major directory has an `index.js` for cleaner imports:

```javascript
// ❌ Before (verbose)
import Title from "../components/ui/Title";
import Modal from "../components/ui/Modal";
import toast from "../components/ui/toast";

// ✅ After (clean)
import { Title, Modal, toast } from "../components/ui";
```

#### 3. Component Organization

**UI Components** (`components/ui/`)

- Generic, reusable UI components
- No business logic
- Highly composable
- Examples: Modal, DataTable, LoadingScreen

**Widgets** (`components/Widgets/`)

- Feature-specific components
- Can contain business logic
- Grouped by feature domain
- Examples: VehicleDropdown, MissionPlanner

**Layout Components** (`components/Layout/`)

- Page structure components
- Header, Sidebar, Topbar
- Used across multiple pages

## 📦 Quick Reference

### Import Cheat Sheet

#### UI Components

```javascript
import {
  Title, // Page title component
  Modal, // Generic modal
  ConfirmModal, // Confirmation dialog
  WizardModal, // Multi-step modal
  DataTable, // Table component
  LoadingScreen, // Full page loader
  LoadingDots, // Small loader
  Content, // Content wrapper
  Main, // Main layout wrapper
  toast, // Toast notifications
} from "../components/ui";

// Toast usage
toast.success("Operation successful!");
toast.error("Something went wrong!");
toast.info("Information message");
toast.warning("Warning message");
```

#### Widgets

```javascript
import {
  // Core
  WidgetCard,
  Dropdown,
  DataCard,

  // Vehicle
  VehicleDropdown,
  VehicleSelector,
  VehicleTable,
  VehicleModal,

  // Dashboard
  RecentMissions,
  MissionAnalytics,
  VehicleQuickView,
  OverviewMap,
  LatestAlerts,

  // Map
  ViewMap,

  // Mission
  MissionModal,
  MissionPlanner,
  MissionTable,

  // Sensors
  SensorChart,
  SensorModal,
  SensorTable,

  // 3D Visualization (lazy loaded)
  Gyroscope3D,
} from "../components/Widgets";
```

#### Hooks

```javascript
import {
  // Auth
  useAuth,
  useAuthContext,
  usePermission,

  // Vehicle Data
  useVehicleData,
  useVehicleAlerts,
  useVehicleBattery,
  useVehicleRawLogs,
  useVehicleSensorLogs,

  // Other Data
  useMissionData,
  useSensorData,
  useAlertData,
  useBatteryData,
  useTelemetryData,
  useNotificationData,
  useLogData,
  useUserData,
  useRoleData,
  usePermissionData,

  // Utilities
  useTitle,
  useMQTT,
  useLoadingTimeout,
  useGyroscopeData,
} from "../hooks";
```

#### Contexts

```javascript
import { AuthProvider, PermissionProvider, usePermissions } from "../contexts";
```

#### Utils

```javascript
import {
  axiosInstance,
  hasPermission,
  canCreate,
  canEdit,
  canDelete,
} from "../utils";
```

## 💻 Development Guide

### Component Patterns

#### 1. Data Fetching Page

```javascript
import { useState } from "react";
import { Title } from "../components/ui";
import { useVehicleData, useTitle } from "../hooks";
import { VehicleTable } from "../components/Widgets";

const VehiclePage = () => {
  useTitle("Vehicles"); // Sets document title
  const { vehicles, loading, error } = useVehicleData();

  return (
    <>
      <Title>Vehicle Management</Title>
      {error && <div className="error">{error}</div>}
      <VehicleTable data={vehicles} loading={loading} />
    </>
  );
};

export default VehiclePage;
```

#### 2. Protected Page with Permissions

```javascript
import { usePermission } from "../hooks";
import { hasPermission } from "../utils";

const AdminPage = () => {
  const { permissions, loading } = usePermission();

  if (loading) return <LoadingScreen />;

  if (!hasPermission(permissions, "admin.access")) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
};
```

#### 3. Widget with Modal

```javascript
import { useState } from "react";
import { Modal, toast } from "../components/ui";

const MyWidget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      // Save logic
      toast.success("Saved successfully!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Add New</button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? "Edit Item" : "Add New Item"}
      >
        <form onSubmit={handleSave}>{/* Form content */}</form>
      </Modal>
    </>
  );
};
```

#### 4. Real-time Data with WebSocket

```javascript
import { useEffect, useState } from "react";
import { useMQTT } from "../hooks";

const TelemetryWidget = ({ vehicleId }) => {
  const [telemetry, setTelemetry] = useState(null);
  const { connect, subscribe, disconnect } = useMQTT();

  useEffect(() => {
    // Connect to WebSocket
    connect();

    // Subscribe to vehicle telemetry
    subscribe(`vehicle/${vehicleId}/telemetry`, (data) => {
      setTelemetry(data);
    });

    return () => disconnect();
  }, [vehicleId]);

  return (
    <div>
      <h3>Real-time Telemetry</h3>
      {telemetry && (
        <div>
          <p>Speed: {telemetry.speed} kts</p>
          <p>Battery: {telemetry.battery}%</p>
          <p>GPS: {telemetry.gps_status}</p>
        </div>
      )}
    </div>
  );
};
```

### Creating New Components

#### 1. Determine Location

- Generic UI? → `components/ui/`
- Feature-specific? → `components/Widgets/[Feature]/`
- Page-level? → `pages/`

#### 2. Create Component

```bash
# UI Component
touch src/components/ui/NewComponent.jsx

# Widget
mkdir src/components/Widgets/NewFeature
touch src/components/Widgets/NewFeature/NewFeatureWidget.jsx
touch src/components/Widgets/NewFeature/index.js
```

#### 3. Update Barrel Exports

```javascript
// src/components/ui/index.js
export { default as NewComponent } from "./NewComponent";

// src/components/Widgets/NewFeature/index.js
export { default as NewFeatureWidget } from "./NewFeatureWidget";
```

### Creating Custom Hooks

```bash
# Create hook file
touch src/hooks/useNewFeature.js

# Add to hooks/index.js
# export { default as useNewFeature } from './useNewFeature';
```

Example hook:

```javascript
// hooks/useNewFeature.js
import { useState, useEffect } from "react";
import { axiosInstance } from "../utils";

const useNewFeature = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/feature/${id}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  return { data, loading, error };
};

export default useNewFeature;
```

### Standard Import Order

```javascript
// 1. React & third-party libraries
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEdit } from "react-icons/fa";

// 2. Hooks
import { useAuth, useVehicleData } from "../hooks";

// 3. Components
import { Title, Modal, DataTable } from "../components/ui";
import { VehicleDropdown } from "../components/Widgets";

// 4. Utils, Config & Constants
import { API_ENDPOINTS } from "../config";
import { hasPermission } from "../utils";

// 5. Styles
import "./styles.css";
```

## 🎨 Best Practices

### Component Guidelines

1. **Keep components small** - Max 300 lines
2. **Single responsibility** - One component, one purpose
3. **Composability** - Build complex UIs from simple components
4. **Props validation** - Use PropTypes or TypeScript
5. **Meaningful names** - Clear, descriptive component names

### State Management

1. **Local state first** - Use useState for component state
2. **Context for global** - Auth, theme, permissions
3. **Custom hooks** - Reusable stateful logic
4. **Avoid prop drilling** - Use Context or composition

### Performance

1. **Lazy loading** - Use React.lazy() for heavy components

   ```javascript
   const Gyroscope3D = lazy(() => import("./Gyroscope/Gyroscope3D"));
   ```

2. **Memoization** - Use useMemo and useCallback wisely

   ```javascript
   const expensiveCalculation = useMemo(() => {
     return complexOperation(data);
   }, [data]);
   ```

3. **Code splitting** - Split by routes
   ```javascript
   const Dashboard = lazy(() => import("./pages/Dashboard"));
   ```

### Styling

1. **Tailwind utilities** - Prefer utility classes
2. **Consistent spacing** - Use Tailwind spacing scale
3. **Dark mode** - Use dark: prefix

   ```jsx
   <div className="bg-white dark:bg-gray-800">
   ```

4. **Responsive design** - Mobile-first approach
   ```jsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   ```

### Naming Conventions

| Type        | Convention        | Example             |
| ----------- | ----------------- | ------------------- |
| Components  | PascalCase        | `VehicleModal.jsx`  |
| Hooks       | camelCase + 'use' | `useVehicleData.js` |
| Utils       | camelCase         | `axiosConfig.js`    |
| Constants   | UPPER_SNAKE_CASE  | `API_ENDPOINTS`     |
| CSS Classes | kebab-case        | `vehicle-card`      |
| Files       | Match component   | `VehicleModal.jsx`  |

### File Size Guidelines

| Type      | Max Lines | Action if Exceeded            |
| --------- | --------- | ----------------------------- |
| Component | 300       | Split into smaller components |
| Hook      | 200       | Extract logic to utilities    |
| Page      | 400       | Extract sections to widgets   |
| Util      | 150       | Split into multiple files     |

## 🚢 Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build
npm run build

# Output will be in /dist folder
```

### Environment Variables (Production)

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_WS_URL=wss://api.yourdomain.com/ws
```

### Docker Deployment

```bash
# Build image
docker build -t seano-frontend .

# Run container
docker run -p 5173:5173 seano-frontend
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

## 📊 Project Statistics

- **Total Files**: ~196 JS/JSX files
- **Components**: 50+ reusable components
- **Pages**: 21+ route pages
- **Hooks**: 30+ custom hooks
- **Widgets**: 15+ feature widget groups
- **Lines of Code**: ~15,000+ LOC

## 🐛 Debugging

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify API_URL in .env

2. **WebSocket Connection Failed**
   - Check WS_URL in .env
   - Verify JWT token is valid
   - Check backend WebSocket handler

3. **Map Not Loading**
   - Verify Leaflet CSS is imported
   - Check map center coordinates
   - Verify geojson data format

4. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear cache: `rm -rf dist && npm run build`

## 🔧 Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:debug        # Start with debugging

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues

# Testing (if configured)
npm run test             # Run tests
npm run test:coverage    # Run with coverage
```

## � Performance Optimization

### ⚡ Cache & Real-time Updates

**Cache TIDAK mengganggu WebSocket real-time updates!** Cache hanya untuk initial load, WebSocket tetap instant.

#### Cara Kerja:

1. **Initial Load**: Cek cache → Load dari cache (50ms) atau API (600ms) → WebSocket connect
2. **Real-time Updates**: WebSocket instant (<100ms) → Update UI + cache otomatis
3. **Page Refresh**: Load dari cache (50ms) → WebSocket reconnect → Updates tetap real-time

#### Performance Comparison:

| Scenario             | Without Cache | With Cache | Improvement         |
| -------------------- | ------------- | ---------- | ------------------- |
| **First Load**       | ~600ms        | ~600ms     | Same                |
| **Page Refresh**     | ~600ms        | ~50ms      | **12x faster!**     |
| **Real-time Update** | <100ms        | <100ms     | **Same (instant!)** |

#### Implementation:

**1. Caching API Responses**

- File: [`/src/utils/cacheUtils.js`](src/utils/cacheUtils.js)
- TTL: 30 seconds (configurable)
- Auto-updates on WebSocket messages

**2. Optimized Hooks with Caching**

```javascript
// Cache-enabled hooks
useVehicleData(); // Cache vehicles (30s)
useMissionData(); // Cache missions (30s)
useNotificationData(); // Cache notifications (30s)
```

**3. Code Splitting & Lazy Loading**

```javascript
// Only Dashboard & Login loaded immediately
const Tracking = lazy(() => import("./pages/Tracking"));
const Missions = lazy(() => import("./pages/Missions"));
// ... other pages lazy loaded
```

**4. Cache Invalidation** (Important!)

```javascript
import { clearCache } from "../utils/cacheUtils";

// Setelah create/update/delete
await axios.post("/api/vehicles", data);
clearCache("vehicles"); // Clear cache
```

#### Timeline Example:

```
09:00:00 - Mission 50% progress
09:00:01 - WebSocket → 51% ⚡ INSTANT UPDATE!
09:00:02 - WebSocket → 52% ⚡ INSTANT UPDATE!
09:00:03 - WebSocket → 53% ⚡ INSTANT UPDATE!

User refresh (F5)
09:00:05 - Load dari cache → 53% (50ms)
09:00:06 - WebSocket → 54% ⚡ TETAP INSTANT!
```

#### Data Flow:

```
┌─────────────────────────────────────┐
│       DASHBOARD COMPONENT           │
└─────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    ↓         ↓         ↓
Vehicle    Mission   Notification
  Data       Data       Data
    │         │          │
[1] Check   Check      Check
   Cache    Cache      Cache
    │         │          │
   Hit?     Hit?       Hit?
 Instant!  Instant!   Instant!
    │         │          │
   Miss?    Miss?      Miss?
 API 600ms API 400ms  API 300ms
    │         │          │
[2] WebSocket WebSocket Polling
    ↓         ↓
Real-time  Real-time
<100ms!    <100ms!
    ↓         ↓
Auto-update Auto-update
  cache      cache
```

#### WebSocket Real-time Status:

| Data Type        | WebSocket | Update Speed     | Cache Update   |
| ---------------- | --------- | ---------------- | -------------- |
| Mission Progress | ✅ Yes    | Instant (<100ms) | Auto-updated   |
| Vehicle Status   | ✅ Yes    | Instant (<100ms) | Auto-updated   |
| Battery Level    | ✅ Yes    | Instant (<100ms) | Auto-updated   |
| Telemetry        | ✅ Yes    | Instant (<100ms) | -              |
| Notifications    | ⚠️ Poll   | 30s (TTL)        | Manual refresh |

#### Results:

- 🚀 **Refresh 12x faster** (600ms → 50ms)
- ⚡ **Real-time tetap instant** (<100ms)
- 📦 **Bundle size -40-50%** (code splitting)
- 💾 **Lower server load**
- 😊 **Better UX**

#### Monitoring Performance:

Use Chrome DevTools:

1. **Network Tab**: Check (disk cache) requests
2. **Performance Tab**: Record page load
3. **Lighthouse**: Audit score (Target: FCP < 1.8s, TTI < 3.8s)

```javascript
// Check cache in console
localStorage.getItem("seano_cache_missions");

// Monitor update speed
console.time("update");
// Wait for WebSocket message
console.timeEnd("update"); // Should be <100ms
```

## �📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Leaflet Documentation](https://leafletjs.com/)
- [Recharts Examples](https://recharts.org/)

## 🤝 Contributing

1. Follow the folder structure guidelines
2. Use barrel exports for new modules
3. Write meaningful component names
4. Add PropTypes or TypeScript types
5. Update documentation for new features
6. Test your changes thoroughly

## 📝 License

MIT License - see LICENSE file for details

---

<div align="center">

**[⬆ Back to Top](#seano-id-frontend-documentation)**

Made with ⚡ Vite & ❤️ React

</div>
