import React, { useEffect, useState, useRef } from "react";
import useMQTT from "../../../hooks/useMQTT";
import { LogSkeleton } from "../../Skeleton";
import useLoadingTimeout from "../../../hooks/useLoadingTimeout";
import { API_ENDPOINTS } from "../../../config";

/**
 * RawDataLog - Log Data Mentah
 *
 * SUMBER DATA:
 * - Historis: GET /raw-logs/?vehicle_id={id}&limit=50 (API)
 * - Real-time: MQTT WebSocket topic `seano/{vehicleId}/raw_log`
 *
 * CARA KERJA:
 * - Fetch log historis dari API saat mount/ubah kendaraan
 * - Subscribe ke MQTT topic untuk update real-time
 * - Tampilkan indicator "Live" ketika MQTT terhubung
 * - Gabung data API dengan pesan MQTT real-time
 * - Handle format JSON dan plain text
 * - Deteksi duplikat menggunakan timestamp pesan
 * - Maksimal 50 log, paling baru di atas
 *
 * @param {number} selectedVehicle - ID Kendaraan dari parent (halaman Tracking)
 */
const RawDataLog = ({ selectedVehicle }) => {
  const [logs, setLogs] = useState([]);
  const [hasNewData, setHasNewData] = useState(false);
  const { loading } = useLoadingTimeout(true);
  const { isConnected, getMessage, subscribe } = useMQTT();
  const lastMessageRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  // Fetch initial logs from API on mount or vehicle change
  useEffect(() => {
    const fetchLogs = async () => {
      if (!selectedVehicle?.id) return;

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          API_ENDPOINTS.RAW_LOGS.LIST +
            `?vehicle_id=${selectedVehicle.id}&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setLogs(
            data.map((log) => ({
              ...log,
              _isMQTT: false,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch raw logs from API:", err);
      }
    };

    fetchLogs();
  }, [selectedVehicle]);

  // Subscribe to raw_log topic when component mounts or selectedVehicle changes
  useEffect(() => {
    if (!selectedVehicle?.code) return;
    const topic = `seano/${selectedVehicle.code}/raw_log`;
    subscribe(topic);
  }, [selectedVehicle, subscribe]);

  // Listen for real-time MQTT raw_log messages
  useEffect(() => {
    if (!selectedVehicle?.code) return;
    const interval = setInterval(() => {
      const topic = `seano/${selectedVehicle.code}/raw_log`;
      const messageObj = getMessage(topic);

      // Check if message exists and is newer than last processed (using timestamp)
      if (
        messageObj &&
        (!lastMessageRef.current ||
          messageObj.timestamp !== lastMessageRef.current)
      ) {
        lastMessageRef.current = messageObj.timestamp;
        setHasNewData(true);

        try {
          let logText = messageObj.payload;

          // Try to parse as JSON first
          try {
            const parsedData = JSON.parse(messageObj.payload);
            logText = parsedData.logs || JSON.stringify(parsedData);
          } catch {
            // If not valid JSON, use raw string as log text
            logText = messageObj.payload;
          }

          // Add MQTT message to logs (prepend to show latest first)
          setLogs((prevLogs) => [
            {
              id: `mqtt-${Date.now()}-${Math.random()}`,
              logs: logText,
              created_at: messageObj.timestamp || new Date().toISOString(),
              _isMQTT: true,
            },
            ...prevLogs.slice(0, 49), // Keep 50 entries max
          ]);

          // Reset new data indicator after 2 seconds
          if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
          updateTimeoutRef.current = setTimeout(() => {
            setHasNewData(false);
          }, 2000);
        } catch (e) {
          console.error("Failed to process MQTT message:", e);
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, [selectedVehicle, getMessage]);

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
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Raw Data Log
          </h3>
          <div className="flex items-center space-x-1">
            {isConnected && (
              <>
                <div
                  className={`w-2 h-2 rounded-full ${
                    hasNewData ? "bg-green-500 animate-pulse" : "bg-green-500"
                  }`}
                ></div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  Live
                </span>
              </>
            )}
          </div>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {selectedVehicle?.name || selectedVehicle?.code || "All Vehicles"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs scrollbar-hide">
        {logs.map((log, index) => {
          const level = getLogLevel(log.logs);
          return (
            <div
              key={log.id || index}
              className={`p-2 rounded border-l-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                log._isMQTT ? "bg-green-50 dark:bg-green-900/10" : ""
              } ${
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
