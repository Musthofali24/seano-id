import React, { useState, useEffect } from "react";
import {
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
  FaThermometerHalf,
  FaBolt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import useVehicleData from "../../../hooks/useVehicleData";
import useVehicleBattery from "../../../hooks/useVehicleBattery";

const BatteryMonitoring = React.memo(({ selectedVehicle = null }) => {
  const { vehicles, loading } = useVehicleData();
  const { batteryData, loading: batteryLoading } = useVehicleBattery(
    selectedVehicle,
    30000
  );
  const [showTimeout, setShowTimeout] = useState(false);

  // Set timeout to show default values after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (batteryLoading) {
        setShowTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [batteryLoading]);

  // Find current vehicle for fallback data
  const currentVehicle = vehicles.find((v) => v.id === selectedVehicle) || {};

  // Battery data with fallbacks - support for 2 batteries
  const batteries =
    batteryData.length > 0
      ? batteryData
      : [
          {
            id: 1,
            percentage: currentVehicle.battery_level || null,
            voltage: null,
            current: null,
            temperature: null,
            charge: null,
            capacity: null,
            design_capacity: null,
            power_supply_status: null,
            power_supply_health: null,
            power_supply_technology: null,
            present: null,
          },
          {
            id: 2,
            percentage: null,
            voltage: null,
            current: null,
            temperature: null,
            charge: null,
            capacity: null,
            design_capacity: null,
            power_supply_status: null,
            power_supply_health: null,
            power_supply_technology: null,
            present: null,
          },
        ];

  // Ensure we always have exactly 2 batteries for display
  const displayBatteries = [
    batteries[0] || { id: 1, percentage: null },
    batteries[1] || { id: 2, percentage: null },
  ];

  const getBatteryIcon = (percentage) => {
    if (percentage === null || percentage === undefined) return FaBatteryEmpty;
    if (percentage >= 75) return FaBatteryFull;
    if (percentage >= 50) return FaBatteryThreeQuarters;
    if (percentage >= 25) return FaBatteryHalf;
    if (percentage >= 10) return FaBatteryQuarter;
    return FaBatteryEmpty;
  };

  const getBatteryColor = (percentage) => {
    if (percentage === null || percentage === undefined) return "text-gray-500";
    if (percentage >= 50) return "text-green-500";
    if (percentage >= 25) return "text-yellow-500";
    if (percentage >= 10) return "text-orange-500";
    return "text-red-500";
  };

  const getBatteryFillColor = (percentage) => {
    if (percentage === null || percentage === undefined) return "bg-gray-300";
    if (percentage >= 50) return "bg-green-500";
    if (percentage >= 25) return "bg-yellow-500";
    if (percentage >= 10) return "bg-orange-500";
    return "bg-red-500";
  };

  const getHealthStatus = (health) => {
    if (health === null || health === undefined)
      return {
        text: "N/A",
        color: "text-gray-500",
        icon: FaExclamationTriangle,
      };

    switch (health) {
      case 1:
      case "Good":
        return { text: "Good", color: "text-green-500", icon: FaCheckCircle };
      case 2:
      case "Overheat":
        return {
          text: "Overheat",
          color: "text-red-500",
          icon: FaThermometerHalf,
        };
      case 3:
      case "Dead":
        return {
          text: "Dead",
          color: "text-red-600",
          icon: FaExclamationTriangle,
        };
      default:
        return {
          text: "Unknown",
          color: "text-gray-500",
          icon: FaExclamationTriangle,
        };
    }
  };

  const getStatusText = (status) => {
    if (status === null || status === undefined) return "N/A";

    switch (status) {
      case 1:
      case "Charging":
        return "Charging";
      case 2:
      case "Discharging":
        return "Discharging";
      case 3:
      case "Not charging":
        return "Not Charging";
      case 4:
      case "Full":
        return "Full";
      default:
        return "Unknown";
    }
  };

  if ((loading || batteryLoading) && !showTimeout) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading battery data...
        </div>
      </div>
    );
  }

  // Helper function to render a single battery
  const renderBattery = (battery, index) => {
    const BatteryIcon = getBatteryIcon(battery.percentage);
    const healthStatus = getHealthStatus(battery.power_supply_health);
    const HealthIcon = healthStatus.icon;
    const batteryPercentage =
      battery.percentage !== null ? battery.percentage : 0;

    return (
      <div key={index} className="flex flex-col items-center">
        {/* Battery Label */}
        <div className="mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Battery {index + 1}
          </span>
        </div>

        {/* Battery Container */}
        <div className="relative">
          <div className="w-30 h-56 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden">
            {/* Battery Fill */}
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${getBatteryFillColor(
                battery.percentage
              )}`}
              style={{ height: `${batteryPercentage}%` }}
            >
              {/* Liquid Effect */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-1 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* Battery Terminal */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-gray-400 dark:bg-gray-500 rounded-t" />

            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white drop-shadow-lg">
                {battery.percentage !== null ? `${battery.percentage}%` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Battery Status */}
        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BatteryIcon
              className={`text-sm ${getBatteryColor(battery.percentage)}`}
            />
            <HealthIcon className={`text-xs ${healthStatus.color}`} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {getStatusText(battery.power_supply_status)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full p-4 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <FaBatteryFull className="text-lg text-green-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Battery Monitoring
          </h3>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-4 items-center">
        {/* Left Side - Battery Tanks */}
        <div className="col-span-2 flex items-center justify-center">
          <div className="flex gap-6">
            {displayBatteries.map((battery, index) =>
              renderBattery(battery, index)
            )}
          </div>
        </div>

        {/* Right Side - Battery Stats */}
        <div className="col-span-3 flex flex-col space-y-5">
          {/* Individual Battery Details */}
          <div className="grid grid-cols-2 gap-3">
            {displayBatteries.map((battery, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3"
              >
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Battery {index + 1}
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {getStatusText(battery.power_supply_status) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Current:
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {battery.current !== null && battery.current !== undefined
                        ? `${battery.current.toFixed(1)}A`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Voltage:
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {battery.voltage !== null && battery.voltage !== undefined
                        ? `${battery.voltage.toFixed(1)}V`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Temp:
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {battery.temperature !== null &&
                      battery.temperature !== undefined
                        ? `${battery.temperature.toFixed(1)}°C`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
              System Summary
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-600 dark:text-blue-400">
                  Total Capacity:
                </span>
                <span className="font-mono text-blue-700 dark:text-blue-300">
                  {displayBatteries
                    .reduce((sum, bat) => sum + (bat.capacity || 0), 0)
                    .toFixed(1)}
                  Ah
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 dark:text-blue-400">
                  Average Percentage:
                </span>
                <span className="font-mono text-blue-700 dark:text-blue-300">
                  {Math.round(
                    displayBatteries.reduce(
                      (sum, bat) => sum + (bat.percentage || 0),
                      0
                    ) / displayBatteries.length
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Last Sync */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Last Sync
                </span>
              </div>
              <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}{" "}
                (
                {new Date().toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
                )
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BatteryMonitoring;
