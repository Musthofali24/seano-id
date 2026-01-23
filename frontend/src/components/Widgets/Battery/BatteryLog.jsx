import React, { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";
import useBatteryData from "../../../hooks/useBatteryData";

const BatteryLog = ({ selectedVehicle }) => {
  const [logs, setLogs] = useState([]);
  const { batteryData } = useBatteryData();

  useEffect(() => {
    if (!selectedVehicle?.id) return;

    const vehicleBatteries = batteryData[selectedVehicle.id] || { 1: null, 2: null };
    const batteryA = vehicleBatteries[1];
    const batteryB = vehicleBatteries[2];

    // Generate log entries from battery data
    const logEntries = [];

    if (batteryA) {
      const status = batteryA.status || "Active";
      const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
      logEntries.push({
        timestamp: batteryA.timestamp
          ? new Date(batteryA.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          : new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }),
        unit: "A",
        status: statusDisplay,
        level: `${batteryA.percentage?.toFixed(0) || 0}%`,
        anomaly: "None",
        statusType: status.toLowerCase(),
      });
    }

    if (batteryB) {
      const status = batteryB.status || "Active";
      const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
      logEntries.push({
        timestamp: batteryB.timestamp
          ? new Date(batteryB.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          : new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }),
        unit: "B",
        status: statusDisplay,
        level: `${batteryB.percentage?.toFixed(0) || 0}%`,
        anomaly: "None",
        statusType: status.toLowerCase(),
      });
    }

    // Add some historical entries for demo
    const historicalLogs = [
      {
        timestamp: "14:15:45",
        unit: "A",
        status: "Charging",
        level: "81%",
        anomaly: "None",
        statusType: "charging",
      },
      {
        timestamp: "13:45:12",
        unit: "B",
        status: "Drain Spike",
        level: "65%",
        anomaly: "Critical Load",
        statusType: "drain",
      },
    ];

    setLogs([...logEntries, ...historicalLogs].slice(0, 10));
  }, [batteryData, selectedVehicle]);

  const getStatusColor = (statusType) => {
    if (statusType === "charging") return "bg-blue-500";
    if (statusType === "active") return "bg-orange-500";
    if (statusType === "drain") return "bg-red-500";
    return "bg-gray-500";
  };

  const exportCSV = () => {
    const headers = ["TIMESTAMP", "UNIT", "STATUS", "LEVEL", "ANOMALY"];
    const rows = logs.map((log) => [
      log.timestamp,
      log.unit,
      log.status,
      log.level,
      log.anomaly,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `battery_logs_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white">Data Logs</h3>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <FaDownload />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">TIMESTAMP</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">UNIT</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">STATUS</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">LEVEL</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">ANOMALY</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{log.timestamp}</td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{log.unit}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(log.statusType)}`}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{log.status}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{log.level}</td>
                <td className="py-3 px-4">
                  <span
                    className={`text-sm ${
                      log.anomaly === "None"
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-red-500 font-medium"
                    }`}
                  >
                    {log.anomaly}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatteryLog;
