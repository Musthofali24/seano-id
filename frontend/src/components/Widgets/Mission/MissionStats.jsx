import React from "react";
import { FaCheckCircle, FaClock, FaTimesCircle, FaList } from "react-icons/fa";

const MissionStats = () => {
  // Sample stats data
  const stats = [
    {
      label: "Total Missions",
      value: "1,284",
      icon: FaList,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Completed",
      value: "1,120",
      icon: FaCheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Ongoing",
      value: "42",
      icon: FaClock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Failed",
      value: "12",
      icon: FaTimesCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-black dark:text-white">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <Icon className="text-2xl" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MissionStats;
