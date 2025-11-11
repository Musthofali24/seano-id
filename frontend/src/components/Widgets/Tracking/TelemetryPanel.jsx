import { useState, useEffect } from "react";
import {
  FaCompass,
  FaWifi,
  FaArrowUp,
  FaThermometerHalf,
} from "react-icons/fa";
import { MdAirlineSeatFlat, MdSpeed } from "react-icons/md";
import useVehicleData from "../../../hooks/useVehicleData";

const TelemetryPanel = ({ selectedVehicle = null }) => {
  const { vehicles, loading } = useVehicleData();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setShowTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const currentVehicle = vehicles.find((v) => v.id === selectedVehicle) || {};

  const telemetryData = {
    orientation: {
      roll: currentVehicle.roll !== undefined ? currentVehicle.roll : null,
      pitch: currentVehicle.pitch !== undefined ? currentVehicle.pitch : null,
      yaw: currentVehicle.heading !== undefined ? currentVehicle.heading : null,
    },
    angular_velocity: {
      x:
        currentVehicle.angular_vel_x !== undefined
          ? currentVehicle.angular_vel_x
          : null,
      y:
        currentVehicle.angular_vel_y !== undefined
          ? currentVehicle.angular_vel_y
          : null,
      z:
        currentVehicle.angular_vel_z !== undefined
          ? currentVehicle.angular_vel_z
          : null,
    },
    linear_acceleration: {
      x: currentVehicle.accel_x !== undefined ? currentVehicle.accel_x : null,
      y: currentVehicle.accel_y !== undefined ? currentVehicle.accel_y : null,
      z: currentVehicle.accel_z !== undefined ? currentVehicle.accel_z : null,
    },

    position: {
      latitude:
        currentVehicle.latitude !== undefined ? currentVehicle.latitude : null,
      longitude:
        currentVehicle.longitude !== undefined
          ? currentVehicle.longitude
          : null,
      altitude:
        currentVehicle.altitude !== undefined ? currentVehicle.altitude : null,
    },
    navigation: {
      speed: currentVehicle.speed !== undefined ? currentVehicle.speed : null,
      heading:
        currentVehicle.heading !== undefined ? currentVehicle.heading : null,
    },

    rssi: currentVehicle.rssi !== undefined ? currentVehicle.rssi : null,
    temperature:
      currentVehicle.temperature !== undefined
        ? currentVehicle.temperature
        : null,
    battery_voltage:
      currentVehicle.battery_voltage !== undefined
        ? currentVehicle.battery_voltage
        : null,
    battery_current:
      currentVehicle.battery_current !== undefined
        ? currentVehicle.battery_current
        : null,
  };

  const formatDegrees = (value) =>
    value !== null && value !== undefined ? `${value.toFixed(1)}°` : "N/A";
  const formatValue = (value, unit = "") =>
    value !== null && value !== undefined
      ? `${value.toFixed(2)}${unit}`
      : "N/A";

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
            <span className="font-mono text-purple-700 dark:text-purple-300">
              {formatValue(telemetryData.position.latitude)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
            <span className="font-mono text-purple-700 dark:text-purple-300">
              {formatValue(telemetryData.position.longitude)}
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
};

export default TelemetryPanel;
