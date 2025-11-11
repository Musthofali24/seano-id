import React from "react";

const DataTable = ({ hasActiveFilters, handleResetFilters }) => {
  return (
    <div className="bg-white dark:bg-transparent border border-gray-300 dark:border-slate-600 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Data Records
        </h2>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </button>
      </div>

      <div className="text-center py-12">
        <svg
          className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>

        <p className="text-gray-500 dark:text-gray-400 mb-2">
          {hasActiveFilters
            ? "No matching records found"
            : "No data records available"}
        </p>

        <p className="text-sm text-gray-400 dark:text-gray-500">
          {hasActiveFilters
            ? "Try adjusting your filters or clearing them to see more results."
            : "Use the filters above to search for specific data or import new records."}
        </p>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default DataTable;
