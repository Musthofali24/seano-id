import React from "react";
import { FaTh } from "react-icons/fa";

const IndividualCellVoltages = ({ selectedVehicle, batteryData = {} }) => {
  const vehicleBatteries = batteryData[selectedVehicle?.id] || {
    1: null,
    2: null,
  };
  const batteryA = vehicleBatteries[1];
  const batteryB = vehicleBatteries[2];

  // Cell voltages - use actual cell_voltages from MQTT or calculate from total voltage
  const cellsA = batteryA
    ? batteryA.cell_voltages && batteryA.cell_voltages.length > 0
      ? batteryA.cell_voltages.map((voltage, i) => ({
          cell: i + 1,
          voltage,
        }))
      : batteryA.voltage && batteryA.cell_count
        ? Array.from({ length: batteryA.cell_count }, (_, i) => ({
            cell: i + 1,
            voltage: batteryA.voltage / batteryA.cell_count,
          }))
        : null
    : null;

  const cellsB = batteryB
    ? batteryB.cell_voltages && batteryB.cell_voltages.length > 0
      ? batteryB.cell_voltages.map((voltage, i) => ({
          cell: i + 1,
          voltage,
        }))
      : batteryB.voltage && batteryB.cell_count
        ? Array.from({ length: batteryB.cell_count }, (_, i) => ({
            cell: i + 1,
            voltage: batteryB.voltage / batteryB.cell_count,
          }))
        : null
    : null;

  const renderCell = (cell, unit) => {
    const maxVoltage = 2.5;
    const minVoltage = 1.8;
    const percentage =
      ((cell.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
    const barColor = unit === "A" ? "bg-blue-500" : "bg-cyan-400";

    return (
      <div
        key={cell.cell}
        className="flex items-center justify-between py-2.5 border-b border-gray-200 dark:border-gray-700/50"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">
          Cell {cell.cell}
        </span>
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
        <h3 className="text-lg font-semibold text-black dark:text-white">
          Monitoring Cell
        </h3>
      </div>

      {!cellsA && !cellsB ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No cell voltage data available.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8 lg:gap-12">
          {/* Battery A */}
          <div className="flex flex-col">
            <h4 className="text-sm font-medium text-blue-400 mb-4">
              BATTERY A (9 CELLS)
            </h4>
            {cellsA ? (
              <div className="overflow-y-auto max-h-60 custom-scrollbar space-y-1 pr-3">
                {cellsA.map((cell) => renderCell(cell, "A"))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                No data
              </div>
            )}
          </div>

          {/* Battery B */}
          <div className="flex flex-col">
            <h4 className="text-sm font-medium text-cyan-400 mb-4">
              BATTERY B (9 CELLS)
            </h4>
            {cellsB ? (
              <div className="overflow-y-auto max-h-60 custom-scrollbar space-y-1 pr-3">
                {cellsB.map((cell) => renderCell(cell, "B"))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                No data
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualCellVoltages;
