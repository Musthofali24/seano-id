import React, { useState, useEffect, useRef } from "react";
import useMQTT from "../../../hooks/useMQTT";
import { LogSkeleton } from "../../Skeleton";
import useLoadingTimeout from "../../../hooks/useLoadingTimeout";
import { Dropdown } from "../index";
import { API_ENDPOINTS } from "../../../config";

/**
 * SensorDataLog - Log Data Sensor
 *
 * SUMBER DATA:
 * - Historis: GET /sensor-logs/?vehicle_id={id}&limit=50 (API)
 * - Real-time: MQTT WebSocket topic `seano/{vehicleId}/sensor_log`
 *
 * CARA KERJA:
 * - Fetch log sensor historis dari API saat mount/ubah kendaraan
 * - Subscribe ke MQTT topic untuk update real-time sensor
 * - Tampilkan indicator "Live" ketika MQTT terhubung
 * - Gabung data API dengan pesan MQTT real-time
 * - Support filter berdasarkan tipe sensor (GPS, Environmental, Accelerometer, dll)
 * - Handle format JSON dan plain text
 * - Deteksi duplikat menggunakan timestamp pesan
 * - Maksimal 50 log, paling baru di atas
 *
 * @param {number} selectedVehicle - ID Kendaraan dari parent (halaman Tracking)
 */
const SensorDataLog = ({ selectedVehicle }) => {
  const [logs, setLogs] = useState([]);
  const [hasNewData, setHasNewData] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState("all");
  const { loading } = useLoadingTimeout(true, 2000);
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
          API_ENDPOINTS.SENSOR_LOGS.LIST +
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
        console.error("Failed to fetch sensor logs from API:", err);
      }
    };

    fetchLogs();
  }, [selectedVehicle]);

  // Subscribe to sensor_log topic when component mounts or selectedVehicle changes
  useEffect(() => {
    if (!selectedVehicle?.code) return;
    const topic = `seano/${selectedVehicle.code}/sensor_log`;
    subscribe(topic);
  }, [selectedVehicle, subscribe]);

  // Listen for real-time MQTT sensor_log messages
  useEffect(() => {
    if (!selectedVehicle?.code) return;
    const interval = setInterval(() => {
      const topic = `seano/${selectedVehicle.code}/sensor_log`;
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
          let parsedData = {};

          // Try to parse as JSON first
          try {
            parsedData = JSON.parse(messageObj.payload);
          } catch {
            // If not valid JSON, treat entire payload as logs field
            parsedData = { logs: messageObj.payload };
          }

          // Add MQTT message to logs (prepend to show latest first)
          setLogs((prevLogs) => [
            {
              id: `mqtt-${Date.now()}-${Math.random()}`,
              sensor_id: parsedData.sensor_id || 0,
              sensor_type: parsedData.sensor_type || "Unknown",
              data: parsedData.data || {},
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

  const formatSensorData = (data) => {
    if (!data || typeof data !== "object") return '{"error": "Invalid data"}';
    return JSON.stringify(data);
  };

  const getSensorColor = (sensorType) => {
    switch (sensorType) {
      case "Environmental":
        return "text-green-600 dark:text-green-400";
      case "Accelerometer":
        return "text-blue-600 dark:text-blue-400";
      case "Gyroscope":
        return "text-purple-600 dark:text-purple-400";
      case "Depth":
        return "text-cyan-600 dark:text-cyan-400";
      case "GPS":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const filteredLogs =
    selectedSensor === "all"
      ? logs
      : logs.filter((log) => log.sensor_type === selectedSensor);

  const sensorTypes = ["all", ...new Set(logs.map((log) => log.sensor_type))];

  if (loading && logs.length === 0) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <LogSkeleton lines={7} />
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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
            Sensor Data Log
          </h3>
          <div className="flex items-center space-x-1">
            {isConnected && (
              <>
                <div
                  className={`w-2 h-2 rounded-full ${
                    hasNewData ? "bg-blue-500 animate-pulse" : "bg-blue-500"
                  }`}
                ></div>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Live
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-40">
            <Dropdown
              items={sensorTypes.map((type) => ({
                id: type,
                name: type === "all" ? "All Sensors" : type,
                label: type === "all" ? "All Sensors" : type,
              }))}
              selectedItem={selectedSensor}
              onItemChange={setSelectedSensor}
              placeholder="Select sensor type"
              className="text-xs"
            />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedVehicle?.name || selectedVehicle?.code || "All Vehicles"}
          </span>
        </div>
      </div>
      {/* 
      {error && (
        <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200">
          {error} - Showing mock data
        </div>
      )} */}

      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs scrollbar-hide">
        {filteredLogs.map((log, index) => (
          <div
            key={log.id || index}
            className={`p-3 rounded border-l-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
              log._isMQTT ? "bg-blue-50 dark:bg-blue-900/10" : ""
            } ${
              log.sensor_type === "Environmental"
                ? "border-green-500"
                : log.sensor_type === "Accelerometer"
                ? "border-blue-500"
                : log.sensor_type === "Gyroscope"
                ? "border-purple-500"
                : log.sensor_type === "Depth"
                ? "border-cyan-500"
                : log.sensor_type === "GPS"
                ? "border-red-500"
                : "border-gray-400"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {formatTime(log.created_at)}
                </span>
                <span
                  className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${getSensorColor(
                    log.sensor_type
                  )} bg-opacity-20`}
                >
                  {log.sensor_type}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ID: {log.sensor_id}
              </span>
            </div>
            <div className="text-gray-700 dark:text-gray-300 break-all text-xs leading-relaxed bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {formatSensorData(log.data)}
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-20 font-openSans">
            No sensor logs available
            {selectedSensor !== "all" && (
              <div className="text-xs mt-1">for {selectedSensor} sensors</div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {filteredLogs.length} of {logs.length} entries
            {selectedSensor !== "all" && ` (${selectedSensor})`}
          </span>
          <span>Last updated: {formatTime(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
};

export default SensorDataLog;
