import React from "react";
import { VehicleDropdown, Dropdown } from "../index";

const TelemetryFilters = ({
  // Vehicle props
  vehicles = [],
  selectedVehicle = "",
  onVehicleChange = () => {},
  vehicleLoading = false,

  // Mission props
  missions = [],
  selectedMission = "",
  onMissionChange = () => {},
  missionLoading = false,

  // Date range props
  startDate = "",
  endDate = "",
  onStartDateChange = () => {},
  onEndDateChange = () => {},

  // Styling
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Vehicle Selector */}
      <div className="min-w-[200px]">
        <VehicleDropdown
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onVehicleChange={onVehicleChange}
          placeholder={
            vehicleLoading
              ? "Loading vehicles..."
              : !vehicles || vehicles.length === 0
              ? "No vehicles available"
              : "Select USV"
          }
          className="text-sm"
          disabled={vehicleLoading}
        />
      </div>

      {/* Mission Selector */}
      <div className="min-w-[220px]">
        <Dropdown
          items={missions}
          selectedItem={selectedMission}
          onItemChange={onMissionChange}
          placeholder={
            missionLoading
              ? "Loading missions..."
              : !missions || missions.length === 0
              ? "No missions available"
              : "Select Mission"
          }
          getItemKey={(mission) => mission.id}
          renderItem={(mission) => (
            <>
              <div
                className={`w-3 h-3 rounded-full ${
                  mission.status === "Active"
                    ? "bg-green-500"
                    : mission.status === "Completed"
                    ? "bg-blue-500"
                    : mission.status === "Draft"
                    ? "bg-orange-500"
                    : "bg-gray-500"
                }`}
              />
              <span>{mission.title || mission.name}</span>
            </>
          )}
          renderSelectedItem={(mission) => (
            <>
              <div
                className={`w-3 h-3 rounded-full ${
                  mission.status === "Active"
                    ? "bg-green-500"
                    : mission.status === "Completed"
                    ? "bg-blue-500"
                    : mission.status === "Draft"
                    ? "bg-orange-500"
                    : "bg-gray-500"
                }`}
              />
              <span className="font-medium text-gray-900 dark:text-white">
                {mission.title || mission.name}
              </span>
            </>
          )}
          className="text-sm"
        />
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-2">
        {/* Start Date */}
        <div className="relative">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-white dark:bg-transparent border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start Date"
            max={endDate || new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Separator */}
        <span className="text-gray-500 dark:text-gray-400 text-sm">to</span>

        {/* End Date */}
        <div className="relative">
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-white dark:bg-transparent border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="End Date"
            min={startDate || undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default TelemetryFilters;
