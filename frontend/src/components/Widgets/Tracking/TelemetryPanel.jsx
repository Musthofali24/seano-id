import React, { useState, useEffect } from "react";
import {
  FaCompass,
  FaWifi,
  FaArrowUp,
  FaThermometerHalf,
} from "react-icons/fa";
import { MdAirlineSeatFlat, MdSpeed } from "react-icons/md";
import { API_ENDPOINTS } from "../../../config";
import useMQTT from "../../../hooks/useMQTT";

const TelemetryPanel = React.memo(({ selectedVehicle = null }) => {
  const [vehicleLog, setVehicleLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeout, setShowTimeout] = useState(false);

  const { subscribe, unsubscribe, messages } = useMQTT();

  // Fetch initial vehicle log data (historical)
  useEffect(() => {
    const fetchVehicleLog = async () => {
      // Only fetch when we have a selected vehicle
      if (!selectedVehicle?.id) {
        console.log("🔍 TelemetryPanel: No vehicle selected yet");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error(
          "🔍 TelemetryPanel: No access_token found in localStorage"
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(
          "🔍 TelemetryPanel: Fetching vehicle log for vehicle",
          selectedVehicle.id
        );
        const url = `${API_ENDPOINTS.VEHICLE_LOGS.LIST}?vehicle_id=${selectedVehicle.id}&limit=1`;
        console.log("🔍 TelemetryPanel: URL:", url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(
          "🔍 TelemetryPanel: Fetch response status:",
          response.status
        );

        if (response.ok) {
          const data = await response.json();
          console.log("🔍 TelemetryPanel: Fetched vehicle log:", data);
          if (data && Array.isArray(data) && data.length > 0) {
            console.log("✅ TelemetryPanel: Setting vehicle log:", data[0]);
            setVehicleLog(data[0]);
          } else {
            console.warn("🔍 TelemetryPanel: No data returned from API");
          }
        } else {
          console.error(
            "🔍 TelemetryPanel: API response error:",
            response.status,
            response.statusText
          );
          const errorText = await response.text();
          console.error("🔍 TelemetryPanel: Error details:", errorText);
        }
      } catch (error) {
        console.error("🔍 TelemetryPanel: Fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleLog();
  }, [selectedVehicle]);

  // Subscribe to MQTT for real-time updates
  useEffect(() => {
    if (!selectedVehicle?.code) return;

    // Use registration_code for MQTT topic (seano/{registration_code}/vehicle_log)
    const topic = `seano/${selectedVehicle.code}/vehicle_log`;
    console.log("📡 TelemetryPanel: Subscribing to MQTT topic:", topic);

    subscribe(topic);

    return () => {
      unsubscribe(topic);
    };
  }, [selectedVehicle, subscribe, unsubscribe]);

  // Listen to messages changes and update vehicle log
  useEffect(() => {
    if (!selectedVehicle?.code) return;

    const topic = `seano/${selectedVehicle.code}/vehicle_log`;
    const message = messages[topic];

    if (message && message.data) {
      console.log(
        "📡 TelemetryPanel: Real-time update received:",
        message.data
      );
      setVehicleLog(message.data);
    }
  }, [messages, selectedVehicle]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setShowTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const telemetryData = {
    orientation: {
      roll: vehicleLog?.roll || null,
      pitch: vehicleLog?.pitch || null,
      yaw: vehicleLog?.yaw || null,
    },
    angular_velocity: {
      x: null, // Not in vehicle_logs
      y: null,
      z: null,
    },
    linear_acceleration: {
      x: null, // Not in vehicle_logs
      y: null,
      z: null,
    },

    position: {
      latitude: vehicleLog?.latitude || null,
      longitude: vehicleLog?.longitude || null,
      altitude: vehicleLog?.altitude || null,
    },
    navigation: {
      speed: vehicleLog?.speed || null,
      heading: vehicleLog?.heading || vehicleLog?.yaw || null,
    },

    rssi: vehicleLog?.rssi || null,
    temperature: vehicleLog?.temperature || null,
    battery_voltage: vehicleLog?.battery_voltage || null,
    battery_current: vehicleLog?.battery_current || null,
  };

  const formatDegrees = (value) => {
    if (value === null || value === undefined) return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "N/A" : `${num.toFixed(1)}°`;
  };
  const formatCoordinate = (value) => {
    if (value === null || value === undefined) return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "N/A" : `${num.toFixed(8)}`;
  };
  const formatValue = (value, unit = "") => {
    if (value === null || value === undefined) return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "N/A" : `${num.toFixed(2)}${unit}`;
  };

  const getRSSIColor = (rssi) => {
    if (rssi === null || rssi === undefined) return "text-gray-500";
    if (rssi >= -50) return "text-green-600";
    if (rssi >= -60) return "text-green-400";
    if (rssi >= -70) return "text-yellow-500";
    if (rssi >= -80) return "text-orange-500";
    return "text-red-500";
  };

  const getSignalBars = (rssi) => {
    if (rssi === null || rssi === undefined) return 0;
    if (rssi >= -50) return 4;
    if (rssi >= -60) return 3;
    if (rssi >= -70) return 2;
    if (rssi >= -80) return 1;
    return 0;
  };

  if (loading && !showTimeout) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading telemetry data...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 flex flex-col">
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Telemetry Data
        </h3>
      </div>

      {/* IMU Orientation */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-3">
          <MdAirlineSeatFlat className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Orientation (IMU)
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Roll
            </p>
            <p className="text-lg font-mono font-bold text-blue-700 dark:text-blue-300">
              {formatDegrees(telemetryData.orientation.roll)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Pitch
            </p>
            <p className="text-lg font-mono font-bold text-blue-700 dark:text-blue-300">
              {formatDegrees(telemetryData.orientation.pitch)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Yaw</p>
            <p className="text-lg font-mono font-bold text-blue-700 dark:text-blue-300">
              {formatDegrees(telemetryData.orientation.yaw)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Data */}
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-3">
          <FaCompass className="text-green-600" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-300">
            Navigation
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MdSpeed className="text-green-600" size={16} />
              <p className="text-xs text-gray-600 dark:text-gray-400">Speed</p>
            </div>
            <p className="text-lg font-mono font-bold text-green-700 dark:text-green-300">
              {formatValue(telemetryData.navigation.speed, " m/s")}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaCompass className="text-green-600" size={16} />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Heading
              </p>
            </div>
            <p className="text-lg font-mono font-bold text-green-700 dark:text-green-300">
              {formatDegrees(telemetryData.navigation.heading)}
            </p>
          </div>
        </div>
      </div>

      {/* Position Data */}
      <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-3">
          <FaArrowUp className="text-purple-600" />
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
            Position
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
            <span className="font-mono text-purple-700 dark:text-purple-300 text-xs">
              {formatCoordinate(telemetryData.position.latitude)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
            <span className="font-mono text-purple-700 dark:text-purple-300 text-xs">
              {formatCoordinate(telemetryData.position.longitude)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Altitude:</span>
            <span className="font-mono text-purple-700 dark:text-purple-300">
              {formatValue(telemetryData.position.altitude, " m")}
            </span>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="mt-auto grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaWifi className={getRSSIColor(telemetryData.rssi)} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Signal
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Signal strength bars */}
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-3 rounded ${
                    i < getSignalBars(telemetryData.rssi)
                      ? getRSSIColor(telemetryData.rssi).replace("text-", "bg-")
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
            <span
              className={`text-xs font-mono ${getRSSIColor(
                telemetryData.rssi
              )}`}
            >
              {telemetryData.rssi !== null && telemetryData.rssi !== undefined
                ? `${telemetryData.rssi} dBm`
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaThermometerHalf className="text-orange-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Temp
            </span>
          </div>
          <p className="text-sm font-mono font-semibold text-orange-600 dark:text-orange-400">
            {formatValue(telemetryData.temperature, "°C")}
          </p>
        </div>
      </div>
    </div>
  );
});

export default TelemetryPanel;
