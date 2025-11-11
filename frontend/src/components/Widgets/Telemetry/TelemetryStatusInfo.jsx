import React from "react";

const TelemetryStatusInfo = ({
  selectedVehicle = "",
  selectedMission = "",
  startDate = "",
  endDate = "",
  vehicles = [],
  missions = [],
}) => {
  // Only show if any filter is active
  const hasActiveFilters =
    selectedVehicle || selectedMission || startDate || endDate;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mx-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {selectedVehicle &&
              `Vehicle: ${
                vehicles?.find((v) => v.id.toString() === selectedVehicle)
                  ?.name || selectedVehicle
              }`}
            {selectedVehicle &&
              (selectedMission || startDate || endDate) &&
              " • "}
            {selectedMission &&
              `Mission: ${
                missions?.find((m) => m.id.toString() === selectedMission)
                  ?.title || selectedMission
              }`}
            {selectedMission && (startDate || endDate) && " • "}
            {(startDate || endDate) &&
              `Date: ${startDate || "Start"} to ${endDate || "End"}`}
          </span>
        </div>
        <div className="text-sm text-blue-600 dark:text-blue-400">
          Manual refresh only
        </div>
      </div>
    </div>
  );
};

export default TelemetryStatusInfo;
