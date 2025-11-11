import React from "react";
import { FaDownload, FaUpload, FaSync, FaUndo } from "react-icons/fa";
import Title from "../../../ui/Title";
import { VehicleDropdown, Dropdown } from "../index";

const DataHeader = ({
  vehicles = [],
  missions = [],
  filters = {},
  onFilterChange = () => {},
  onRefreshData = () => {},
  onResetFilters = () => {},
  isRefreshing = false,
  lastRefresh = new Date(),
  hasActiveFilters = false,
}) => {
  // Get status indicator color for missions
  const getMissionStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Completed":
        return "bg-blue-500";
      case "Draft":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // Custom render function for selected mission item
  const renderSelectedMission = (mission) => (
    <>
      <div
        className={`w-3 h-3 rounded-full ${getMissionStatusColor(
          mission.status
        )}`}
      />
      <span className="font-medium text-gray-900 dark:text-white">
        {mission.name}
      </span>
    </>
  );

  // Custom render function for mission dropdown items
  const renderMissionItem = (mission, isSelected) => (
    <>
      <div
        className={`w-3 h-3 rounded-full ${getMissionStatusColor(
          mission.status
        )}`}
      />
      <div className="flex-1">
        <div className="text-gray-900 dark:text-white font-medium">
          {mission.name}
        </div>
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          {mission.status}
        </div>
      </div>
      {isSelected && (
        <div className="text-blue-600 dark:text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </>
  );

  const handleImport = () => {
    console.log("Import data functionality");
    // Implement import logic here
  };

  const handleExport = () => {
    console.log("Export data functionality");
    // Implement export logic here
  };

  // Count active filters for legacy display
  const legacyActiveFilterCount = [
    filters.vehicle,
    filters.mission,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <Title
          title="Data Management"
          subtitle="Real-time and historical data management for autonomous USV operations"
        />

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* USV Selection */}
          <div className="min-w-[200px]">
            <VehicleDropdown
              vehicles={vehicles}
              selectedVehicle={filters.vehicle || ""}
              onVehicleChange={(vehicle) => onFilterChange("vehicle", vehicle)}
              placeholder="Select USV"
              className="text-sm"
            />
          </div>

          {/* Mission Selection */}
          <div className="min-w-[220px]">
            <Dropdown
              items={missions}
              selectedItem={filters.mission || ""}
              onItemChange={(mission) => onFilterChange("mission", mission)}
              placeholder="Select Mission"
              renderItem={renderMissionItem}
              renderSelectedItem={renderSelectedMission}
              getItemKey={(mission) => mission.id}
              className="text-sm"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => onFilterChange("startDate", e.target.value)}
                className="bg-white dark:bg-transparent border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
              />
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">to</span>
            <div className="relative">
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => onFilterChange("endDate", e.target.value)}
                className="bg-white dark:bg-transparent border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Refresh Data Button */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className={`px-3 py-3 text-white text-sm rounded-xl transition-all flex items-center gap-2 font-medium ${
              isRefreshing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            title={
              isRefreshing
                ? "Refreshing data..."
                : `Refresh Data (Last: ${lastRefresh.toLocaleTimeString()})`
            }
          >
            <FaSync size={12} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          {/* Reset Filter Button - Only show when filters are active */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-3 py-3 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-xl transition-all flex items-center gap-2 font-medium"
              title="Reset All Filters"
            >
              <FaUndo size={12} />
            </button>
          )}

          {/* Import/Export Buttons */}
          <div
            className={`flex items-center gap-2 ${
              hasActiveFilters ? "ml-2" : ""
            }`}
          >
            <button
              onClick={handleImport}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl transition-all flex items-center gap-2 font-medium"
              title="Import Data"
            >
              <FaUpload size={14} />
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-all flex items-center gap-2 font-medium"
              title="Export Data"
            >
              <FaDownload size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Last Refresh Indicator */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </div>
          {hasActiveFilters && (
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {legacyActiveFilterCount} filter(s) active
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataHeader;
