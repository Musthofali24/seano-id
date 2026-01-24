import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const EnergyConsumptionTrends = () => {
  const [filter, setFilter] = useState("30D");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Generate sample data based on filter
    const data = [];
    const now = new Date();
    
    let dataPoints = 5;
    let daysBack = 30;
    
    if (filter === "7D") {
      dataPoints = 7;
      daysBack = 7;
    } else if (filter === "24H") {
      dataPoints = 24;
      daysBack = 1;
    }

    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * (daysBack / dataPoints) * 24 * 60 * 60 * 1000);
      let label = "";
      
      if (filter === "24H") {
        label = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      } else {
        const day = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
        label = `${String(day).padStart(2, "0")} ${month}`;
      }

      // Simulate energy consumption data
      const baseValue = 100;
      const variation = Math.sin(i / 2) * 20 + Math.random() * 10;
      const value = Math.max(50, Math.min(150, baseValue + variation));

      data.push({
        date: label,
        consumption: parseFloat(value.toFixed(1)),
      });
    }

    setChartData(data);
  }, [filter]);

  return (
    <div className="dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Energy Consumption Trends
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kilowatt-hour usage across all active missions
          </p>
        </div>
        <div className="flex gap-2">
          {["30D", "7D", "24H"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              className="dark:stroke-gray-500"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6B7280"
              className="dark:stroke-gray-500"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{label}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Peak: {entry.value} kWh
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="consumption"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorConsumption)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyConsumptionTrends;
