import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FaBatteryFull,
  FaBolt,
  FaTachometerAlt,
  FaCompass,
  FaChartLine,
  FaThermometerHalf,
} from "react-icons/fa";

const VehicleLogChart = ({ className = "" }) => {
  // Mock vehicle telemetry data for chart - should come from API
  const chartData = [
    {
      time: "10:00",
      battery: 92,
      voltage: 12.6,
      speed: 0,
      heading: 120,
      temperature: 25,
    },
    {
      time: "10:05",
      battery: 89,
      voltage: 12.5,
      speed: 1.2,
      heading: 130,
      temperature: 26,
    },
    {
      time: "10:10",
      battery: 85,
      voltage: 12.4,
      speed: 2.1,
      heading: 140,
      temperature: 27,
    },
    {
      time: "10:15",
      battery: 82,
      voltage: 12.3,
      speed: 2.5,
      heading: 145,
      temperature: 28,
    },
    {
      time: "10:20",
      battery: 78,
      voltage: 12.2,
      speed: 2.3,
      heading: 148,
      temperature: 29,
    },
    {
      time: "10:25",
      battery: 75,
      voltage: 12.1,
      speed: 1.8,
      heading: 145,
      temperature: 28.5,
    },
    {
      time: "10:30",
      battery: 72,
      voltage: 12.0,
      speed: 2.2,
      heading: 142,
      temperature: 28,
    },
    {
      time: "10:35",
      battery: 69,
      voltage: 11.9,
      speed: 2.7,
      heading: 140,
      temperature: 27.5,
    },
    {
      time: "10:40",
      battery: 65,
      voltage: 11.8,
      speed: 2.1,
      heading: 138,
      temperature: 28,
    },
    {
      time: "10:45",
      battery: 62,
      voltage: 11.7,
      speed: 1.5,
      heading: 135,
      temperature: 28.5,
    },
  ];

  // Current values for display cards
  const currentValues = {
    battery: {
      value: 85,
      unit: "%",
      icon: FaBatteryFull,
      color: "#22c55e",
      label: "Battery Level",
    },
    voltage: {
      value: 12.4,
      unit: "V",
      icon: FaBolt,
      color: "#3b82f6",
      label: "Battery Voltage",
    },
    speed: {
      value: 2.3,
      unit: "m/s",
      icon: FaTachometerAlt,
      color: "#8b5cf6",
      label: "Vehicle Speed",
    },
    heading: {
      value: 145.8,
      unit: "°",
      icon: FaCompass,
      color: "#6366f1",
      label: "Heading",
    },
    temperature: {
      value: 28.5,
      unit: "°C",
      icon: FaThermometerHalf,
      color: "#f59e0b",
      label: "System Temperature",
    },
  };

  return (
    <div className={`h-full p-6 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <FaChartLine className="text-gray-600 dark:text-gray-400 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Vehicle Log Chart
        </h3>
      </div>

      {/* Current Values Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="text-center p-5 bg-green-50 dark:bg-green-900/20 rounded-lg min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-green-600 dark:text-green-400 mb-2">
            Battery Level
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {currentValues.battery.value}%
          </p>
        </div>
        <div className="text-center p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
            Battery Voltage
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {currentValues.voltage.value}V
          </p>
        </div>
        <div className="text-center p-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
            Vehicle Speed
          </p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {currentValues.speed.value}m/s
          </p>
        </div>
        <div className="text-center p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">
            Heading
          </p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {currentValues.heading.value}°
          </p>
        </div>
        <div className="text-center p-5 bg-orange-50 dark:bg-orange-900/20 rounded-lg min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
            System
          </p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {currentValues.temperature.value}°C
          </p>
        </div>
      </div>

      {/* Multi-Line Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.3}
            />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "6px",
                color: "#f9fafb",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="battery"
              stroke="#22c55e"
              strokeWidth={2}
              name="Battery (%)"
            />
            <Line
              type="monotone"
              dataKey="voltage"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Voltage (V)"
            />
            <Line
              type="monotone"
              dataKey="speed"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Speed (m/s)"
            />
            <Line
              type="monotone"
              dataKey="heading"
              stroke="#6366f1"
              strokeWidth={2}
              name="Heading (°)"
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Temperature (°C)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VehicleLogChart;
