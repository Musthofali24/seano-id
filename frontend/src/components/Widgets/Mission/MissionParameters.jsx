import { FaRoute } from "react-icons/fa";

const MissionParameters = ({ missionParams, setMissionParams }) => {
  return (
    <div
      className="w-full p-4 bg-white dark:bg-transparent border-t border-gray-200 dark:border-slate-600"
      style={{ height: "200px" }}
    >
      {/* Parameter Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <FaRoute className="text-[#018190]" />
          Mission Parameters
        </h2>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Action Type */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Action
          </label>
          <select
            value={missionParams.action}
            onChange={(e) =>
              setMissionParams((prev) => ({
                ...prev,
                action: e.target.value,
              }))
            }
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#018190] focus:border-transparent transition-all"
          >
            <option value="waypoint">Waypoint</option>
            <option value="loiter">Loiter</option>
            <option value="rtl">Return Home</option>
            <option value="land">Land</option>
          </select>
        </div>

        {/* Speed Parameter */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Speed (m/s)
          </label>
          <input
            type="number"
            value={missionParams.speed}
            onChange={(e) =>
              setMissionParams((prev) => ({
                ...prev,
                speed: parseFloat(e.target.value) || 0,
              }))
            }
            step="0.1"
            min="0.1"
            max="10"
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#018190] focus:border-transparent transition-all"
          />
        </div>

        {/* Altitude Parameter - Fixed at 0m for USV */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Altitude (m){" "}
          </label>
          <input
            type="number"
            value="0"
            disabled
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            title="Altitude is fixed at 0m for USV operations (sea level)"
          />
        </div>

        {/* Delay Parameter */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Delay (s)
          </label>
          <input
            type="number"
            value={missionParams.delay}
            onChange={(e) =>
              setMissionParams((prev) => ({
                ...prev,
                delay: parseInt(e.target.value) || 0,
              }))
            }
            step="1"
            min="0"
            max="300"
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#018190] focus:border-transparent transition-all"
          />
        </div>

        {/* Loiter Time */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Loiter (s)
          </label>
          <input
            type="number"
            value={missionParams.loiter}
            onChange={(e) =>
              setMissionParams((prev) => ({
                ...prev,
                loiter: parseInt(e.target.value) || 0,
              }))
            }
            step="1"
            min="0"
            max="600"
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#018190] focus:border-transparent transition-all"
          />
        </div>

        {/* Acceptance Radius */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Radius (m)
          </label>
          <input
            type="number"
            value={missionParams.radius}
            onChange={(e) =>
              setMissionParams((prev) => ({
                ...prev,
                radius: parseFloat(e.target.value) || 0,
              }))
            }
            step="0.5"
            min="0.5"
            max="20"
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#018190] focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default MissionParameters;
