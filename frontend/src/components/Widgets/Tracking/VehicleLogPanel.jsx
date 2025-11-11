import React, { useState } from "react";
import {
  FaCog,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const VehicleLogPanel = ({ selectedVehicle = null }) => {
  const [activeTab, setActiveTab] = useState("system");

  // Mock log data - should come from API
  const logData = {
    system: [
      {
        id: 1,
        timestamp: "10:25:30",
        level: "INFO",
        message: "Vehicle system initialized successfully",
        module: "SYSTEM",
      },
      {
        id: 2,
        timestamp: "10:25:45",
        level: "INFO",
        message: "GPS lock acquired - 8 satellites",
        module: "GPS",
      },
      {
        id: 3,
        timestamp: "10:26:12",
        level: "WARNING",
        message: "Battery voltage below optimal (12.2V)",
        module: "POWER",
      },
      {
        id: 4,
        timestamp: "10:26:30",
        level: "INFO",
        message: "Mission waypoint #3 reached",
        module: "NAV",
      },
      {
        id: 5,
        timestamp: "10:27:01",
        level: "ERROR",
        message: "Communication timeout with ground station",
        module: "COMM",
      },
    ],
    vehicle: [
      {
        id: 1,
        timestamp: "10:25:15",
        battery_voltage: 12.4,
        battery_current: 2.1,
        speed: 2.3,
        heading: 145.8,
        mode: "AUTO",
      },
      {
        id: 2,
        timestamp: "10:25:30",
        battery_voltage: 12.3,
        battery_current: 2.2,
        speed: 2.5,
        heading: 146.2,
        mode: "AUTO",
      },
      {
        id: 3,
        timestamp: "10:25:45",
        battery_voltage: 12.2,
        battery_current: 2.3,
        speed: 2.1,
        heading: 145.5,
        mode: "AUTO",
      },
      {
        id: 4,
        timestamp: "10:26:00",
        battery_voltage: 12.1,
        battery_current: 2.4,
        speed: 1.8,
        heading: 144.9,
        mode: "MANUAL",
      },
      {
        id: 5,
        timestamp: "10:26:15",
        battery_voltage: 12.0,
        battery_current: 2.5,
        speed: 1.5,
        heading: 144.2,
        mode: "MANUAL",
      },
    ],
  };

  const getLogLevelIcon = (level) => {
    switch (level) {
      case "INFO":
        return <FaInfoCircle className="text-blue-500" />;
      case "WARNING":
        return <FaExclamationTriangle className="text-yellow-500" />;
      case "ERROR":
        return <FaTimesCircle className="text-red-500" />;
      case "SUCCESS":
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case "INFO":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "WARNING":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "ERROR":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      case "SUCCESS":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <FaCog className="text-gray-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vehicle Logs
          </h3>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("system")}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "system"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            System Logs
          </button>
          <button
            onClick={() => setActiveTab("vehicle")}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "vehicle"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Vehicle Data
          </button>
        </div>
      </div>

      {/* Log Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "system" ? (
          <div className="p-6 space-y-3">
            {logData.system.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border ${getLogLevelColor(
                  log.level
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getLogLevelIcon(log.level)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {log.timestamp}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getLogLevelColor(
                          log.level
                        )}`}
                      >
                        {log.module}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {log.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">
                      Time
                    </th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">
                      Voltage
                    </th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">
                      Current
                    </th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">
                      Speed
                    </th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">
                      Heading
                    </th>
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-medium">
                      Mode
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logData.vehicle.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-2 font-mono text-gray-600 dark:text-gray-400">
                        {entry.timestamp}
                      </td>
                      <td className="py-2 font-mono text-gray-900 dark:text-white">
                        {entry.battery_voltage}V
                      </td>
                      <td className="py-2 font-mono text-gray-900 dark:text-white">
                        {entry.battery_current}A
                      </td>
                      <td className="py-2 font-mono text-gray-900 dark:text-white">
                        {entry.speed} m/s
                      </td>
                      <td className="py-2 font-mono text-gray-900 dark:text-white">
                        {entry.heading}°
                      </td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            entry.mode === "AUTO"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}
                        >
                          {entry.mode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleLogPanel;
