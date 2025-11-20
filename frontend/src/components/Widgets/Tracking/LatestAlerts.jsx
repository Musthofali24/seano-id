import React from "react";
import useVehicleAlerts from "../../../hooks/useVehicleAlerts";
import useLoadingTimeout from "../../../hooks/useLoadingTimeout";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaBell,
  FaClock,
} from "react-icons/fa";

const LatestAlerts = ({ selectedVehicle }) => {
  const { alerts, error } = useVehicleAlerts(selectedVehicle?.id, 10, 30000);
  const { loading } = useLoadingTimeout(true, 2000);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "error":
        return FaTimesCircle;
      case "warning":
        return FaExclamationTriangle;
      case "info":
        return FaInfoCircle;
      case "success":
        return FaCheckCircle;
      default:
        return FaBell;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          icon: "text-red-500",
          text: "text-red-700 dark:text-red-300",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          icon: "text-yellow-500",
          text: "text-yellow-700 dark:text-yellow-300",
        };
      case "info":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          icon: "text-blue-500",
          text: "text-blue-700 dark:text-blue-300",
        };
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
          icon: "text-green-500",
          text: "text-green-700 dark:text-green-300",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800/50",
          border: "border-gray-200 dark:border-gray-700",
          icon: "text-gray-500",
          text: "text-gray-700 dark:text-gray-300",
        };
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="h-full p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1 flex-shrink-0"></div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaBell className="text-lg text-orange-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Latest Alerts
          </h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {selectedVehicle?.name || selectedVehicle?.code || "All Vehicles"}
        </span>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200">
          {error}
        </div>
      )}

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        {alerts.map((alert, index) => {
          const AlertIcon = getAlertIcon(alert.severity);
          const colors = getAlertColor(alert.severity);

          return (
            <div
              key={alert.id || index}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors hover:bg-opacity-80 ${colors.bg} ${colors.border}`}
            >
              <AlertIcon className={`text-sm mt-1 ${colors.icon}`} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${colors.text} mb-1`}>
                  {alert.title ||
                    alert.message ||
                    alert.description ||
                    "Unknown Alert"}
                </div>
                {alert.description && alert.title && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {alert.description}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <FaClock className="text-xs" />
                  <span>
                    {formatDate(alert.created_at || alert.timestamp)} at{" "}
                    {formatTime(alert.created_at || alert.timestamp)}
                  </span>
                  {alert.severity && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors.text} ${colors.bg}`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <FaCheckCircle className="text-3xl mb-2 text-green-500" />
            <div className="text-sm font-medium">No alerts found</div>
            <div className="text-xs">Vehicle is operating normally</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
          </span>
          <span>Last updated: {formatTime(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
};

export default LatestAlerts;
