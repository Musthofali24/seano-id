import React from "react";
import useVehicleRawLogs from "../../../hooks/useVehicleRawLogs";
import { LogSkeleton } from "../../Skeleton";
import useLoadingTimeout from "../../../hooks/useLoadingTimeout";

const RawDataLog = ({ selectedVehicle }) => {
  const { logs } = useVehicleRawLogs(selectedVehicle, 50, 30000);
  const { loading } = useLoadingTimeout(true);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLogLevel = (logText) => {
    if (
      logText.toLowerCase().includes("error") ||
      logText.toLowerCase().includes("failed")
    ) {
      return "ERROR";
    } else if (
      logText.toLowerCase().includes("warning") ||
      logText.toLowerCase().includes("low")
    ) {
      return "WARN";
    } else if (
      logText.toLowerCase().includes("connected") ||
      logText.toLowerCase().includes("acquired")
    ) {
      return "INFO";
    }
    return "DEBUG";
  };

  const getLogLevelStyle = (level) => {
    switch (level) {
      case "ERROR":
        return "text-red-500 bg-red-50 dark:bg-red-900/20";
      case "WARN":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "INFO":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-hidden">
          <LogSkeleton lines={8} />
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
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Raw Data Log
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Vehicle {selectedVehicle}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        {logs.map((log, index) => {
          const level = getLogLevel(log.logs);
          return (
            <div
              key={log.id || index}
              className={`p-2 rounded border-l-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                level === "ERROR"
                  ? "border-red-500"
                  : level === "WARN"
                  ? "border-yellow-500"
                  : level === "INFO"
                  ? "border-blue-500"
                  : "border-gray-400"
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {formatTime(log.created_at)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${getLogLevelStyle(
                    level
                  )}`}
                >
                  {level}
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300 break-all text-xs leading-relaxed">
                {log.logs}
              </div>
            </div>
          );
        })}

        {logs.length === 0 && !loading && (
          <div className="text-center text-gray-500 font-openSans dark:text-gray-400 py-20">
            No logs available
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{logs.length} entries</span>
          <span>Last updated: {formatTime(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
};

export default RawDataLog;
