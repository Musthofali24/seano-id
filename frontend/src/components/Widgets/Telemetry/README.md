# 📡 Telemetry Components Documentation

## Overview

Base components for the Telemetry monitoring system, following the same structure as other widget components in the project.

---

## 📁 File Structure

```
src/components/Widgets/Telemetry/
├── TelemetryCards.jsx       # Main cards grid component
├── TelemetryFilters.jsx     # Filter controls component
├── TelemetryHeader.jsx      # Header with title and filters
├── TelemetryStatusInfo.jsx  # Status information display
└── index.js                 # Export file
```

---

## 🧩 Components

### 1. **TelemetryCards**

Main component for displaying telemetry data in widget cards grid.

**Props:**

- `telemetryData` (Array): Array of telemetry data objects
- `isLoading` (Boolean): Loading state to show skeletons
- `skeletonCount` (Number): Number of skeleton cards to show (default: 12)

**Usage:**

```jsx
import { TelemetryCards } from "../components/Widgets/Telemetry";

<TelemetryCards
  telemetryData={telemetryData}
  isLoading={isLoading}
  skeletonCount={12}
/>;
```

### 2. **TelemetryFilters**

Filter controls for vehicle, mission, and date range selection.

**Props:**

- `vehicles` (Array): Available vehicles list
- `selectedVehicle` (String): Selected vehicle ID
- `onVehicleChange` (Function): Vehicle change handler
- `vehicleLoading` (Boolean): Vehicle loading state
- `missions` (Array): Available missions list
- `selectedMission` (String): Selected mission ID
- `onMissionChange` (Function): Mission change handler
- `missionLoading` (Boolean): Mission loading state
- `startDate` (String): Start date value
- `endDate` (String): End date value
- `onStartDateChange` (Function): Start date change handler
- `onEndDateChange` (Function): End date change handler
- `className` (String): Additional CSS classes

**Usage:**

```jsx
<TelemetryFilters
  vehicles={vehicles}
  selectedVehicle={selectedVehicle}
  onVehicleChange={handleVehicleChange}
  // ... other props
/>
```

### 3. **TelemetryHeader**

Complete header component with title and integrated filters.

**Props:**

- All props from `TelemetryFilters` (passed through)
- `onRefresh` (Function): Refresh button handler
- `isRefreshing` (Boolean): Refreshing state
- `title` (String): Header title (default: "Telemetry Monitoring")
- `subtitle` (String): Header subtitle (default: "Real-time USV Data Dashboard")

**Usage:**

```jsx
<TelemetryHeader
  vehicles={vehicles}
  selectedVehicle={selectedVehicle}
  onVehicleChange={handleVehicleChange}
  onRefresh={refreshData}
  isRefreshing={isRefreshing}
  // ... other props
/>
```

### 4. **TelemetryStatusInfo**

Displays active filter status information.

**Props:**

- `selectedVehicle` (String): Selected vehicle ID
- `selectedMission` (String): Selected mission ID
- `startDate` (String): Start date
- `endDate` (String): End date
- `vehicles` (Array): Vehicles list for name lookup
- `missions` (Array): Missions list for name lookup

**Usage:**

```jsx
<TelemetryStatusInfo
  selectedVehicle={selectedVehicle}
  selectedMission={selectedMission}
  startDate={startDate}
  endDate={endDate}
  vehicles={vehicles}
  missions={missions}
/>
```

---

## 🔧 Custom Hook

### **useTelemetryData**

Custom hook for managing telemetry data state and loading.

**Location:** `src/hooks/useTelemetryData.js`

**Parameters:**

- `hasVehicleData` (Boolean): Whether vehicle data is available

**Returns:**

- `telemetryData` (Array): Current telemetry data
- `isLoading` (Boolean): Loading state (initial + refresh)
- `isRefreshing` (Boolean): Refresh-specific loading state
- `refreshData` (Function): Manual refresh function

**Usage:**

```jsx
import useTelemetryData from "../hooks/useTelemetryData";

const { telemetryData, isLoading, isRefreshing, refreshData } =
  useTelemetryData(hasVehicleData);
```

---

## 🚀 Complete Implementation Example

```jsx
// pages/Telemetry.jsx
import React, { useState } from "react";
import useTitle from "../hooks/useTitle";
import useVehicleData from "../hooks/useVehicleData";
import useMissionData from "../hooks/useMissionData";
import useTelemetryData from "../hooks/useTelemetryData";
import {
  TelemetryHeader,
  TelemetryStatusInfo,
  TelemetryCards,
} from "../components/Widgets/Telemetry";

const Telemetry = () => {
  useTitle("Telemetry");

  // State management
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedMission, setSelectedMission] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data hooks
  const { vehicles, loading: vehicleLoading } = useVehicleData();
  const { missionData: missions, loading: missionLoading } = useMissionData();

  const hasVehicleData = vehicles && vehicles.length > 0;
  const { telemetryData, isLoading, isRefreshing, refreshData } =
    useTelemetryData(hasVehicleData);

  // Handler functions
  const handleVehicleChange = (vehicleId) => setSelectedVehicle(vehicleId);
  const handleMissionChange = (missionId) => setSelectedMission(missionId);
  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && date && new Date(date) > new Date(endDate)) {
      setEndDate("");
    }
  };
  const handleEndDateChange = (date) => setEndDate(date);

  return (
    <div className="space-y-6">
      <TelemetryHeader
        vehicles={vehicles || []}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleVehicleChange}
        vehicleLoading={vehicleLoading}
        missions={missions || []}
        selectedMission={selectedMission}
        onMissionChange={handleMissionChange}
        missionLoading={missionLoading}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
      />

      <TelemetryStatusInfo
        selectedVehicle={selectedVehicle}
        selectedMission={selectedMission}
        startDate={startDate}
        endDate={endDate}
        vehicles={vehicles}
        missions={missions}
      />

      <div className="px-4">
        <TelemetryCards
          telemetryData={telemetryData}
          isLoading={isLoading}
          skeletonCount={12}
        />
      </div>
    </div>
  );
};

export default Telemetry;
```

---

## ✅ Benefits of Base Component Structure

1. **Consistency**: Follows same pattern as Dashboard, Vehicle, and other widget components
2. **Reusability**: Components can be used in other pages or contexts
3. **Maintainability**: Easier to update and modify individual pieces
4. **Testing**: Each component can be tested independently
5. **Performance**: Better code splitting and lazy loading potential

---

## 🔄 Migration from Legacy Code

The old `pages/Telemetry.jsx` has been refactored to use base components:

**Before:** All logic in single page component (200+ lines)
**After:** Distributed across base components (~50 lines page component)

**Changes:**

- ✅ Extracted `TelemetryCards` component
- ✅ Extracted `TelemetryFilters` component
- ✅ Extracted `TelemetryHeader` component
- ✅ Extracted `TelemetryStatusInfo` component
- ✅ Created `useTelemetryData` hook
- ✅ Updated exports in `components/Widgets/index.js`

**Result:** Clean, maintainable, and reusable telemetry system! 🎉
