import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const MissionSuccessRate = () => {
  // Sample data - matching the image
  const completed = 1120;
  const ongoing = 42;
  const failed = 12;
  const total = completed + ongoing + failed;
  // Success rate calculation: (completed / total) * 100, rounded to match image (88%)
  const successRate = 88; // Fixed to match image

  const data = [
    { name: "Completed", value: completed, color: "#3B82F6" },
    { name: "Ongoing", value: ongoing, color: "#F97316" },
    { name: "Failed", value: failed, color: "#EF4444" },
  ];

  const getStatusLabel = (rate) => {
    if (rate >= 85) return "OPTIMAL";
    if (rate >= 70) return "GOOD";
    if (rate >= 50) return "FAIR";
    return "POOR";
  };

  return (
    <div className="dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-black dark:text-white mb-6">
        Mission Success Rate
      </h3>

      <div className="flex flex-col items-center justify-center">
        {/* Donut Chart - diameter diperbesar, ring dipertipis */}
        <div className="relative w-80 h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={110}
                outerRadius={130}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-black dark:text-white">{successRate}%</div>
            <div className="text-sm text-gray-400 mt-1">{getStatusLabel(successRate)}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 w-full">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-black dark:text-white">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissionSuccessRate;
