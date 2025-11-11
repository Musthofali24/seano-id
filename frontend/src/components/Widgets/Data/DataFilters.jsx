import React from "react";
import { Dropdown } from "../index";

const DataFilters = ({
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

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors border border-blue-200 dark:border-blue-600"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Search Input */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Records
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ID, name, or description..."
                className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 pl-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search || ""}
                onChange={(e) => onFilterChange("search", e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active filters applied
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Filtering enabled
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFilters;
