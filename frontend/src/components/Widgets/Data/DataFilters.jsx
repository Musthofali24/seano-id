import React from "react";
import { VehicleDropdown, Dropdown, DatePickerField } from "../index";

const DataFilters = ({
  vehicles = [],
  missions = [],
  filters = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
  hasActiveFilters = false,
  totalRecords = 0,
}) => {
  // Filter options data
  const dateRangeOptions = [
    { id: "all", name: "All Time", label: "All Time" },
    { id: "today", name: "Today", label: "Today" },
    { id: "week", name: "This Week", label: "This Week" },
    { id: "month", name: "This Month", label: "This Month" },
    { id: "quarter", name: "This Quarter", label: "This Quarter" },
  ];

  const sourceOptions = [
    { id: "all", name: "All Sources", label: "All Sources" },
    { id: "sensors", name: "Sensors", label: "Sensors" },
    { id: "vehicles", name: "Vehicles", label: "Vehicles" },
    { id: "missions", name: "Missions", label: "Missions" },
    { id: "manual", name: "Manual Entry", label: "Manual Entry" },
  ];

  const statusOptions = [
    { id: "all", name: "All Status", label: "All Status" },
    { id: "active", name: "Active", label: "Active" },
    { id: "processed", name: "Processed", label: "Processed" },
    { id: "archived", name: "Archived", label: "Archived" },
    { id: "error", name: "Error", label: "Error" },
  ];

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
          mission.status,
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
          mission.status,
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

  return (
    <div className="bg-white dark:bg-transparent border border-gray-300 dark:border-slate-600 rounded-xl p-6">
      <div className="flex flex-col space-y-6">
        {/* Header with Total Records */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Filters
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalRecords > 0
                ? `${totalRecords} total records`
                : "No records found"}
            </p>
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* USV Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              USV
            </label>
            <VehicleDropdown
              vehicles={vehicles}
              selectedVehicle={filters.vehicle || ""}
              onVehicleChange={(vehicle) => onFilterChange("vehicle", vehicle)}
              placeholder="Select USV"
              className="text-sm"
            />
          </div>

          {/* Mission Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mission
            </label>
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

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <DatePickerField
              value={filters.startDate || ""}
              onChange={(value) => onFilterChange("startDate", value)}
              placeholder="Start Date"
              maxDate={filters.endDate || undefined}
              className="w-full"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <DatePickerField
              value={filters.endDate || ""}
              onChange={(value) => onFilterChange("endDate", value)}
              placeholder="End Date"
              minDate={filters.startDate || undefined}
              className="w-full"
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <Dropdown
              items={dateRangeOptions}
              selectedItem={filters.dateRange || "all"}
              onItemChange={(value) => onFilterChange("dateRange", value)}
              placeholder="Select date range"
              getItemKey={(item) => item.id}
              className="text-sm"
            />
          </div>

          {/* Data Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Source
            </label>
            <Dropdown
              items={sourceOptions}
              selectedItem={filters.source || "all"}
              onItemChange={(value) => onFilterChange("source", value)}
              placeholder="Select data source"
              getItemKey={(item) => item.id}
              className="text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Dropdown
              items={statusOptions}
              selectedItem={filters.status || "all"}
              onItemChange={(value) => onFilterChange("status", value)}
              placeholder="Select status"
              getItemKey={(item) => item.id}
              className="text-sm"
            />
          </div>
        </div>

        {/* Active Filters Display with Reset Button */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Active filters applied
                </span>
              </div>
              <button
                onClick={onResetFilters}
                className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors border border-blue-200 dark:border-blue-600"
              >
                Reset All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFilters;
