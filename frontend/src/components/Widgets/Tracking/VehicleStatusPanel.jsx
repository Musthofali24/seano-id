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
import useVehicleData from "../../../hooks/useVehicleData";

const VehicleStatusPanel = ({ selectedVehicle }) => {
  const { vehicles, loading } = useVehicleData();
  const [showTimeout, setShowTimeout] = useState(false);
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

  // Set timeout to show default values after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setShowTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Find current vehicle data
  const currentVehicle = vehicles.find((v) => v.id === selectedVehicle) || {};

  // Vehicle states with default fallback values
  const vehicleStates = {
    connected:
      currentVehicle.connected !== undefined ? currentVehicle.connected : null,
    armed: currentVehicle.armed !== undefined ? currentVehicle.armed : null,
    guided: currentVehicle.guided !== undefined ? currentVehicle.guided : null,
    manual_input:
      currentVehicle.manual_input !== undefined
        ? currentVehicle.manual_input
        : null,
    mode: currentVehicle.mode || null,
    system_status:
      currentVehicle.system_status !== undefined
        ? currentVehicle.system_status
        : null,
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
    switch (status) {
      case 0:
        return { text: "Initializing", color: "text-yellow-600" };
      case 1:
        return { text: "System Ready", color: "text-green-600" };
      case 2:
        return { text: "Critical", color: "text-red-600" };
      case 3:
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
            vehicleStates.armed
              ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800"
              : "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <FaShieldAlt
              className={
                vehicleStates.armed ? "text-orange-600" : "text-gray-400"
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
            {vehicleStates.guided === null ? (
              <MdGpsNotFixed className="text-gray-400" />
            ) : vehicleStates.guided ? (
              <MdGpsFixed className="text-blue-600" />
            ) : (
              <MdGpsNotFixed className="text-gray-400" />
            )}
            <span
              className={
                vehicleStates.guided === null
                  ? "text-gray-500"
                  : vehicleStates.guided
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500"
              }
            >
              GPS{" "}
              {vehicleStates.guided === null
                ? "N/A"
                : vehicleStates.guided
                ? "Guided"
                : "Manual"}
            </span>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <FaExclamationTriangle className={systemStatus.color} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            System Status
          </span>
        </div>
        <p className={`text-sm font-semibold ${systemStatus.color}`}>
          {systemStatus.text}
        </p>
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
};

export default VehicleStatusPanel;
