import React from "react";
import { FaThermometerHalf } from "react-icons/fa";

const PeakLoadTemp = ({ selectedVehicle, batteryData = {} }) => {
  const vehicleBatteries = batteryData[selectedVehicle?.id] || { 1: null, 2: null };
  const batteryA = vehicleBatteries[1];
  const batteryB = vehicleBatteries[2];

  // Get peak temperature from both batteries
  const getPeakTemp = () => {
    const temps = [batteryA?.temperature, batteryB?.temperature].filter((t) => t !== null && t !== undefined);
    if (temps.length === 0) return 34.0;
    return Math.max(...temps);
  };

  const peakTemp = getPeakTemp();
  const change = +2.4; // This would come from historical comparison
  const changeColor = change > 0 ? "text-orange-500" : "text-green-500";

  return (
    <div className="dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <FaThermometerHalf className="text-orange-500" />
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">PEAK LOAD TEMP</h3>
      </div>
      <div className="text-5xl font-bold text-black dark:text-white mb-2">{peakTemp.toFixed(1)}°C</div>
      <div className={`text-sm font-medium ${changeColor} mb-1`}>
        {change > 0 ? "+" : ""}
        {change.toFixed(1)}°
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-auto">Sensor 04 & 00 active.</p>
    </div>
  );
};

export default PeakLoadTemp;
