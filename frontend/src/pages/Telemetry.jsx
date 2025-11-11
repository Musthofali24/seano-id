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

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicle(vehicleId);
  };

  const handleMissionChange = (missionId) => {
    setSelectedMission(missionId);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && date && new Date(date) > new Date(endDate)) {
      setEndDate("");
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters and Actions */}
      <TelemetryHeader
        // Vehicle props
        vehicles={vehicles || []}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleVehicleChange}
        vehicleLoading={vehicleLoading}
        // Mission props
        missions={missions || []}
        selectedMission={selectedMission}
        onMissionChange={handleMissionChange}
        missionLoading={missionLoading}
        // Date range props
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        // Actions
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
      />

      {/* Status Information */}
      <TelemetryStatusInfo
        selectedVehicle={selectedVehicle}
        selectedMission={selectedMission}
        startDate={startDate}
        endDate={endDate}
        vehicles={vehicles}
        missions={missions}
      />

      {/* Telemetry Cards Grid */}
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
