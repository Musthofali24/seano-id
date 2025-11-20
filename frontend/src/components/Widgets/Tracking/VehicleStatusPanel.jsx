import React, { useState, useEffect } from "react";
import {
  FaWifi,
  FaShieldAlt,
  FaLocationArrow,
  FaPlay,
  FaPause,
  FaHome,
  FaExclamationTriangle,
  FaStop,
} from "react-icons/fa";
import { MdAutoMode, MdGpsFixed, MdGpsNotFixed } from "react-icons/md";
import { API_ENDPOINTS } from "../../../config";
import useVehicleData from "../../../hooks/useVehicleData";
import useMQTT from "../../../hooks/useMQTT";

/**
 * VehicleStatusPanel - Panel Status Kendaraan
 *
 * SUMBER DATA:
 * - Historis: useVehicleData() hook → /vehicles/ API endpoint
 * - Real-time: WebSocket via useMQTT hook → seano/{registration_code}/vehicle_log
 *
 * CARA KERJA:
 * - Fetch semua kendaraan dari API via useVehicleData()
 * - Subscribe WebSocket untuk real-time updates
 * - Merge data real-time dengan data historis
 * - Update otomatis ketika selectedVehicle berubah atau data baru masuk
 */
const VehicleStatusPanel = React.memo(({ selectedVehicle }) => {
  const { vehicles, loading } = useVehicleData();
  const { subscribe, unsubscribe, messages } = useMQTT();
  const [showTimeout, setShowTimeout] = useState(false);
  const [historicalData, setHistoricalData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeActions, setActiveActions] = useState({
    start: false,
    pause: false,
    stop: false,
    auto: false,
    arm: false,
    rtl: false,
  });

  // Handle quick action button clicks
  const handleActionClick = (action) => {
    setActiveActions((prev) => ({
      ...prev,
      [action]: !prev[action],
    }));
  };

  // Fetch historical vehicle log data from database
  useEffect(() => {
    const fetchHistoricalData = async () => {
      // Only fetch when we have a selected vehicle
      if (!selectedVehicle?.id) {
        console.log("📡 VehicleStatusPanel: No vehicle selected yet");
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error(
          "📡 VehicleStatusPanel: No access_token found in localStorage"
        );
        return;
      }

      try {
        console.log(
          "📡 VehicleStatusPanel: Fetching historical data for vehicle",
          selectedVehicle.id
        );
        const url = `${API_ENDPOINTS.VEHICLE_LOGS.LIST}?vehicle_id=${selectedVehicle.id}&limit=1`;
        console.log("📡 VehicleStatusPanel: URL:", url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(
          "📡 VehicleStatusPanel: Fetch response status:",
          response.status
        );

        if (response.ok) {
          const data = await response.json();
          console.log("📡 VehicleStatusPanel: Received data:", data);
          if (data && Array.isArray(data) && data.length > 0) {
            console.log(
              "✅ VehicleStatusPanel: Setting historical data:",
              data[0]
            );
            setHistoricalData(data[0]);
          } else {
            console.warn("📡 VehicleStatusPanel: No data returned from API");
          }
        } else {
          console.error(
            "📡 VehicleStatusPanel: API response error:",
            response.status,
            response.statusText
          );
          const errorText = await response.text();
          console.error("📡 VehicleStatusPanel: Error details:", errorText);
        }
      } catch (error) {
        console.error("📡 VehicleStatusPanel: Fetch error:", error.message);
      }
    };

    fetchHistoricalData();
  }, [selectedVehicle?.id]);

  // Subscribe to WebSocket for real-time updates
  useEffect(() => {
    if (!selectedVehicle?.code) return;

    const topic = `seano/${selectedVehicle.code}/vehicle_log`;
    console.log("📡 VehicleStatusPanel: Subscribing to:", topic);
    subscribe(topic);

    return () => {
      unsubscribe(topic);
    };
  }, [selectedVehicle, subscribe, unsubscribe]);

  // Listen to real-time messages and track connection timeout
  useEffect(() => {
    if (!selectedVehicle?.code) return;

    const topic = `seano/${selectedVehicle.code}/vehicle_log`;
    const message = messages[topic];

    if (message && message.data) {
      console.log("📡 VehicleStatusPanel: Real-time update:", message.data);
      setRealtimeData(message.data);
      setIsConnected(true);
    } else {
      // If no real-time data but we have historical data, still show as connected
      if (historicalData) {
        console.log(
          "📡 VehicleStatusPanel: No real-time data, using historical data"
        );
        setIsConnected(true);
      }
    }
  }, [messages, selectedVehicle, historicalData]);

  // Monitor connection status with 15-second timeout
  useEffect(() => {
    if (!realtimeData) return;

    const timeout = setTimeout(() => {
      setIsConnected(false);
      console.log(
        "📡 VehicleStatusPanel: Connection timeout - no data received for 15 seconds"
      );
    }, 15000);

    return () => clearTimeout(timeout);
  }, [realtimeData]);

  // Set timeout to show default values after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setShowTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Find current vehicle data and merge with real-time and historical data
  const currentVehicle =
    vehicles.find((v) => v.id === selectedVehicle?.id) || {};

  // Merge: currentVehicle (vehicle metadata) → historicalData (latest DB data) → realtimeData (live WebSocket)
  // Real-time takes priority, then historical DB data, then fallback to vehicle metadata
  const mergedData = { ...currentVehicle, ...historicalData, ...realtimeData };

  // Vehicle states with proper data fallback
  const vehicleStates = {
    connected:
      isConnected ||
      (historicalData &&
        historicalData.rssi !== undefined &&
        historicalData.rssi !== null)
        ? true
        : false,
    armed: mergedData.armed !== undefined ? mergedData.armed : null,
    guided: mergedData.guided !== undefined ? mergedData.guided : null,
    manual_input:
      mergedData.manual_input !== undefined ? mergedData.manual_input : null,
    mode: mergedData.mode || null,
    gps_fix: mergedData.gps_fix !== undefined ? mergedData.gps_fix : null,
    system_status:
      mergedData.system_status !== undefined ? mergedData.system_status : null,
  };

  const getModeColor = (mode) => {
    switch (mode?.toUpperCase()) {
      case "AUTO":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "GUIDED":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "MANUAL":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "RTL":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getSystemStatusText = (status) => {
    if (status === null || status === undefined) {
      return { text: "N/A", color: "text-gray-600" };
    }

    // Handle both string and number status values
    const statusStr =
      typeof status === "string" ? status.toUpperCase() : String(status);

    // Match against status enum names
    if (statusStr.includes("UNKNOWN")) {
      return { text: "Unknown", color: "text-gray-600" };
    }
    if (statusStr.includes("BOOT")) {
      return { text: "Boot", color: "text-yellow-600" };
    }
    if (statusStr.includes("CALIBRATING")) {
      return { text: "Calibrating", color: "text-blue-600" };
    }
    if (statusStr.includes("STANDBY")) {
      return { text: "Standby", color: "text-yellow-600" };
    }
    if (statusStr.includes("ACTIVE")) {
      return { text: "Active", color: "text-green-600" };
    }
    if (statusStr.includes("CRITICAL")) {
      return { text: "Critical", color: "text-red-600" };
    }
    if (statusStr.includes("EMERGENCY")) {
      return { text: "Emergency", color: "text-red-800" };
    }

    // Fallback for numeric values
    const statusNum = typeof status === "string" ? parseInt(status) : status;
    switch (statusNum) {
      case 0:
        return { text: "Unknown", color: "text-gray-600" };
      case 1:
        return { text: "Boot", color: "text-yellow-600" };
      case 2:
        return { text: "Calibrating", color: "text-blue-600" };
      case 3:
        return { text: "Standby", color: "text-yellow-600" };
      case 4:
        return { text: "Active", color: "text-green-600" };
      case 5:
        return { text: "Critical", color: "text-red-600" };
      case 6:
        return { text: "Emergency", color: "text-red-800" };
      default:
        return { text: "Unknown", color: "text-gray-600" };
    }
  };

  const systemStatus = getSystemStatusText(vehicleStates.system_status);

  if (loading && !showTimeout) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading vehicle status...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Vehicle Status
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentVehicle.name || `No Vehicle Selected`}
        </p>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className={`p-3 rounded-lg border ${
            vehicleStates.connected === null
              ? "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800"
              : vehicleStates.connected
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <FaWifi
              className={
                vehicleStates.connected === null
                  ? "text-gray-600"
                  : vehicleStates.connected
                  ? "text-green-600"
                  : "text-red-600"
              }
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Connection
            </span>
          </div>
          <p
            className={`text-sm font-semibold ${
              vehicleStates.connected === null
                ? "text-gray-700 dark:text-gray-400"
                : vehicleStates.connected
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {vehicleStates.connected === null
              ? "N/A"
              : vehicleStates.connected
              ? "Online"
              : "Offline"}
          </p>
        </div>

        <div
          className={`p-3 rounded-lg border ${
            vehicleStates.armed === null
              ? "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800"
              : vehicleStates.armed
              ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800"
              : "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <FaShieldAlt
              className={
                vehicleStates.armed === true
                  ? "text-orange-600"
                  : "text-gray-400"
              }
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Armed
            </span>
          </div>
          <p
            className={`text-sm font-semibold ${
              vehicleStates.armed === null
                ? "text-gray-700 dark:text-gray-400"
                : vehicleStates.armed
                ? "text-orange-700 dark:text-orange-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {vehicleStates.armed === null
              ? "N/A"
              : vehicleStates.armed
              ? "Armed"
              : "Disarmed"}
          </p>
        </div>
      </div>

      {/* Flight Mode & Guidance */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Flight Mode
          </span>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${getModeColor(
              vehicleStates.mode
            )}`}
          >
            {vehicleStates.mode || "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            {(() => {
              const gpsNum =
                typeof vehicleStates.gps_fix === "string"
                  ? parseInt(vehicleStates.gps_fix)
                  : vehicleStates.gps_fix;
              return gpsNum === null || gpsNum === 0 ? (
                <MdGpsNotFixed className="text-gray-400" />
              ) : gpsNum >= 3 ? (
                <MdGpsFixed className="text-green-600" />
              ) : (
                <MdGpsFixed className="text-yellow-600" />
              );
            })()}
            <span
              className={(() => {
                const gpsNum =
                  typeof vehicleStates.gps_fix === "string"
                    ? parseInt(vehicleStates.gps_fix)
                    : vehicleStates.gps_fix;
                return gpsNum === null || gpsNum === 0
                  ? "text-gray-500"
                  : gpsNum >= 3
                  ? "text-green-600 dark:text-green-400"
                  : "text-yellow-600 dark:text-yellow-400";
              })()}
            >
              GPS{" "}
              {(() => {
                const gpsNum =
                  typeof vehicleStates.gps_fix === "string"
                    ? parseInt(vehicleStates.gps_fix)
                    : vehicleStates.gps_fix;
                return gpsNum === null
                  ? "N/A"
                  : gpsNum === 0
                  ? "No Fix"
                  : gpsNum === 1
                  ? "Dead Reckoning"
                  : gpsNum === 2
                  ? "2D Fix"
                  : gpsNum === 3
                  ? "3D Fix"
                  : `${gpsNum}D Fix`;
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-2">
          <FaExclamationTriangle className={systemStatus.color} size={16} />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            System Status
          </span>
        </div>
        <p className={`text-lg font-bold ${systemStatus.color}`}>
          {systemStatus.text}
        </p>
        {mergedData.system_status && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Status Code: {mergedData.system_status}
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-auto">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Actions
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleActionClick("start")}
            className={`p-2 rounded-lg transition-colors ${
              activeActions.start
                ? "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700"
            }`}
          >
            <FaPlay
              className={`mx-auto ${
                activeActions.start
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
              size={14}
            />
            <span
              className={`text-xs mt-1 block ${
                activeActions.start
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Start
            </span>
          </button>
          <button
            onClick={() => handleActionClick("pause")}
            className={`p-2 rounded-lg transition-colors ${
              activeActions.pause
                ? "bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700"
            }`}
          >
            <FaPause
              className={`mx-auto ${
                activeActions.pause
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
              size={14}
            />
            <span
              className={`text-xs mt-1 block ${
                activeActions.pause
                  ? "text-orange-700 dark:text-orange-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Pause
            </span>
          </button>
          <button
            onClick={() => handleActionClick("stop")}
            className={`p-2 rounded-lg transition-colors ${
              activeActions.stop
                ? "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700"
            }`}
          >
            <FaStop
              className={`mx-auto ${
                activeActions.stop
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
              size={14}
            />
            <span
              className={`text-xs mt-1 block ${
                activeActions.stop
                  ? "text-red-700 dark:text-red-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Stop
            </span>
          </button>
          <button
            onClick={() => handleActionClick("auto")}
            className={`p-2 rounded-lg transition-colors ${
              activeActions.auto
                ? "bg-teal-100 hover:bg-teal-200 dark:bg-teal-900/30 dark:hover:bg-teal-900/50"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700"
            }`}
          >
            <MdAutoMode
              className={`mx-auto ${
                activeActions.auto
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
              size={14}
            />
            <span
              className={`text-xs mt-1 block ${
                activeActions.auto
                  ? "text-teal-700 dark:text-teal-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Auto
            </span>
          </button>
          <button
            onClick={() => handleActionClick("arm")}
            className={`p-2 rounded-lg transition-colors ${
              activeActions.arm
                ? "bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700"
            }`}
          >
            <FaShieldAlt
              className={`mx-auto ${
                activeActions.arm
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
              size={14}
            />
            <span
              className={`text-xs mt-1 block ${
                activeActions.arm
                  ? "text-purple-700 dark:text-purple-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Disarm/Arm
            </span>
          </button>
          <button
            onClick={() => handleActionClick("rtl")}
            className={`p-2 rounded-lg transition-colors ${
              activeActions.rtl
                ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700"
            }`}
          >
            <FaHome
              className={`mx-auto ${
                activeActions.rtl
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
              size={14}
            />
            <span
              className={`text-xs mt-1 block ${
                activeActions.rtl
                  ? "text-green-700 dark:text-green-300"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              RTL
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default VehicleStatusPanel;
