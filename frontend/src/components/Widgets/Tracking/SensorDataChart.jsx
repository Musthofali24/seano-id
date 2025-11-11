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
import { FaChartLine, FaRuler } from "react-icons/fa";

const SensorDataChart = ({ className = "" }) => {
  const chartData = [
    {
      time: "10:00",
      waterTemp: 23.2,
      waterDepth: 14.8,
      windSpeed: 6.1,
      visibility: 2.1,
    },
    {
      time: "10:05",
      waterTemp: 23.8,
      waterDepth: 15.0,
      windSpeed: 6.8,
      visibility: 2.2,
    },
    {
      time: "10:10",
      waterTemp: 24.1,
      waterDepth: 15.1,
      windSpeed: 7.2,
      visibility: 2.3,
    },
    {
      time: "10:15",
      waterTemp: 24.3,
      waterDepth: 15.2,
      windSpeed: 7.9,
      visibility: 2.4,
    },
    {
      time: "10:20",
      waterTemp: 24.5,
      waterDepth: 15.2,
      windSpeed: 8.3,
      visibility: 2.5,
    },
    {
      time: "10:25",
      waterTemp: 24.2,
      waterDepth: 15.1,
      windSpeed: 7.8,
      visibility: 2.3,
    },
    {
      time: "10:30",
      waterTemp: 24.0,
      waterDepth: 15.0,
      windSpeed: 7.5,
      visibility: 2.4,
    },
  ];

  // Current values
  const currentValues = {
    waterTemp: 24.5,
    waterDepth: 15.2,
    windSpeed: 8.3,
    visibility: 2.5,
  };

  return (
    <div className={`h-full p-6 flex flex-col ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FaChartLine className="text-green-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sensor Data Chart
          </h3>
        </div>
      </div>

      {/* Current Values Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
            Water Temp
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {currentValues.waterTemp}°C
          </p>
        </div>
        <div className="text-center p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">
            Depth
          </p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {currentValues.waterDepth}m
          </p>
        </div>
        <div className="text-center p-5 bg-green-50 dark:bg-green-900/20 rounded-lg min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-green-600 dark:text-green-400 mb-2">
            Wind Speed
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {currentValues.windSpeed} m/s
          </p>
        </div>
        <div className="text-center p-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
            Visibility
          </p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {currentValues.visibility} km
          </p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="time"
              className="text-xs"
              stroke="currentColor"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-xs"
              stroke="currentColor"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "none",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="waterTemp"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Water Temp (°C)"
              dot={{ fill: "#3b82f6", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="waterDepth"
              stroke="#6366f1"
              strokeWidth={2}
              name="Depth (m)"
              dot={{ fill: "#6366f1", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="windSpeed"
              stroke="#10b981"
              strokeWidth={2}
              name="Wind Speed (m/s)"
              dot={{ fill: "#10b981", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="visibility"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Visibility (km)"
              dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorDataChart;
