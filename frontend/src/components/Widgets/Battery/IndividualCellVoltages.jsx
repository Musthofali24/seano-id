import React from "react";
import { FaTh } from "react-icons/fa";

const IndividualCellVoltages = ({ selectedVehicle, batteryData = {} }) => {
  const vehicleBatteries = batteryData[selectedVehicle?.id] || { 1: null, 2: null };
  const batteryA = vehicleBatteries[1];
  const batteryB = vehicleBatteries[2];

  // Generate cell voltages (in real app, this would come from API)
  const generateCellVoltages = (baseVoltage, cellCount = 6) => {
    const cells = [];
    const avgCellVoltage = baseVoltage / cellCount;
    for (let i = 0; i < cellCount; i++) {
      // Add some variation
      const variation = (Math.random() - 0.5) * 0.2;
      cells.push({
        cell: i + 1,
        voltage: Math.max(1.8, Math.min(2.5, avgCellVoltage + variation)),
      });
    }
    return cells;
  };

  const cellsA = batteryA
    ? generateCellVoltages(batteryA.voltage || 12.6, 6)
    : Array.from({ length: 6 }, (_, i) => ({ cell: i + 1, voltage: 2.1 }));
  const cellsB = batteryB
    ? generateCellVoltages(batteryB.voltage || 11.9, 6)
    : Array.from({ length: 6 }, (_, i) => ({ cell: i + 1, voltage: 2.0 }));

  const renderCell = (cell, unit) => {
    const maxVoltage = 2.5;
    const minVoltage = 1.8;
    const percentage = ((cell.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
    const barColor = unit === "A" ? "bg-blue-500" : "bg-cyan-400";

    return (
      <div key={cell.cell} className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-700/50">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">Cell {cell.cell}</span>
        <div className="flex items-center gap-4 flex-1 ml-4">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[45px] text-right">
            {cell.voltage.toFixed(1)}V
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <FaTh className="text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-black dark:text-white">Monitoring Cell</h3>
      </div>

      <div className="grid grid-cols-2 gap-8 lg:gap-12">
        {/* Battery A */}
        <div>
          <h4 className="text-sm font-medium text-blue-400 mb-4">BATTERY A (6 CELLS)</h4>
          <div className="space-y-1">{cellsA.map((cell) => renderCell(cell, "A"))}</div>
        </div>

        {/* Battery B */}
        <div>
          <h4 className="text-sm font-medium text-cyan-400 mb-4">BATTERY B (6 CELLS)</h4>
          <div className="space-y-1">{cellsB.map((cell) => renderCell(cell, "B"))}</div>
        </div>
      </div>
    </div>
  );
};

export default IndividualCellVoltages;
