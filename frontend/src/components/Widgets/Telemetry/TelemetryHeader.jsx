import React from "react";
import Title from "../../../ui/Title";
import TelemetryFilters from "./TelemetryFilters";
import { FaSync } from "react-icons/fa";

const TelemetryHeader = ({
  // Filter props - passed through to TelemetryFilters
  vehicles = [],
  selectedVehicle = "",
  onVehicleChange = () => {},
  vehicleLoading = false,
  missions = [],
  selectedMission = "",
  onMissionChange = () => {},
  missionLoading = false,
  startDate = "",
  endDate = "",
  onStartDateChange = () => {},
  onEndDateChange = () => {},

  // Action props
  onRefresh = () => {},
  isRefreshing = false,

  // Title props
  title = "Telemetry Monitoring",
  subtitle = "Real-time USV Data Dashboard",
}) => {
  return (
    <div className="flex items-center justify-between px-4 pt-4">
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <Title title={title} subtitle={subtitle} />
      </div>

      {/* Filter Controls and Action Buttons */}
      <div className="flex items-center gap-3">
        <TelemetryFilters
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onVehicleChange={onVehicleChange}
          vehicleLoading={vehicleLoading}
          missions={missions}
          selectedMission={selectedMission}
          onMissionChange={onMissionChange}
          missionLoading={missionLoading}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-xl transition-all flex items-center gap-2 font-medium"
          title="Refresh telemetry data now"
        >
          <FaSync className={`text-xs ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default TelemetryHeader;
