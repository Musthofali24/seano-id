import { useEffect } from "react";
import { FaShip, FaLocationDot } from "react-icons/fa6";
import { TableSkeleton } from "../../Skeleton";
import DataCard from "../DataCard";
import useLoadingTimeout from "../../../hooks/useLoadingTimeout";

const VehicleTable = ({
  vehicleData,
  page,
  setPage,
  pageSize,
  getBatteryIcon,
  loading = false,
}) => {
  const { loading: timeoutLoading, stopLoading } = useLoadingTimeout(
    loading,
    5000
  );

  useEffect(() => {
    if (!loading || vehicleData.length > 0) {
      stopLoading();
    }
  }, [loading, vehicleData.length, stopLoading]);

  const shouldShowSkeleton = timeoutLoading && loading;

  const transformedData = vehicleData.map((veh) => {
    return {
      id: veh.id,
      name: veh.name || `Vehicle ${veh.id}`,
      code: veh.code || `USV-${String(veh.id).padStart(3, "0")}`,
      type: veh.type || "USV",
      role: veh.role || "Patrol",
      status:
        veh.status === "on_mission"
          ? "Deployed"
          : veh.status === "online"
          ? "Online"
          : veh.status === "maintenance"
          ? "Maintenance"
          : "Offline",
      position:
        veh.latitude && veh.longitude
          ? `${veh.latitude}, ${veh.longitude}`
          : veh.position || "Unknown",
      battery: veh.battery_level
        ? `${veh.battery_level}%`
        : veh.battery || "0%",
      batteryColor:
        veh.battery_level >= 80
          ? "#27ae60"
          : veh.battery_level >= 60
          ? "#f39c12"
          : veh.battery_level >= 40
          ? "#e67e22"
          : "#e74c3c",
      signal: veh.signal_strength
        ? `${veh.signal_strength}%`
        : veh.signal || "0%",
      temperature: veh.temperature
        ? `${veh.temperature}°C`
        : veh.temperature || "0°C",
      lastSeen: veh.last_seen
        ? new Date(veh.last_seen).toLocaleString()
        : veh.lastSeen || "Unknown",
      actions: veh.actions || [],
    };
  });

  // Show skeleton only if still loading and within timeout
  if (shouldShowSkeleton) {
    return <TableSkeleton rows={3} />;
  }

  return (
    <div className="px-4">
      <DataCard
        title="Vehicle Overview"
        headerContent={
          <div className="flex items-center justify-between w-full">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <FaShip size={20} /> Vehicle Overview
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                <th className="py-3 px-2">Vehicle</th>
                <th className="py-3 px-0 max-w-xs whitespace-nowrap">Status</th>
                <th className="py-3 px-2">Position</th>
                <th className="py-3 px-2">Battery</th>
                <th className="py-3 px-2">Signal</th>
                <th className="py-3 px-2">Temperature</th>
                <th className="py-3 px-2">Last Seen</th>
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transformedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                      <FaShip size={48} className="opacity-50" />
                      <p className="text-lg font-medium">No vehicles found</p>
                      <p className="text-sm">
                        Waiting for API data or no vehicles available
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transformedData
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((veh) => (
                    <tr
                      key={veh.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      {/* Info */}
                      <td className="py-3 px-0 max-w-xs whitespace-nowrap">
                        <div className="flex items-center justify-start gap-5">
                          <FaShip
                            size={25}
                            className="text-blue-500 dark:text-blue-400"
                          />
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-black dark:text-white">
                              {veh.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {veh.code} - {veh.type}
                            </span>
                            <span className="text-xs text-blue-600 dark:text-blue-300 underline cursor-pointer">
                              {veh.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2">
                        {veh.status === "Deployed" && (
                          <span className="bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 w-fit">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>{" "}
                            Deployed
                          </span>
                        )}
                        {veh.status === "Online" && (
                          <span className="bg-green-100 dark:bg-green-600 text-green-700 dark:text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 w-fit">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>{" "}
                            Online
                          </span>
                        )}
                        {veh.status === "Maintenance" && (
                          <span className="bg-yellow-100 dark:bg-yellow-500 text-yellow-700 dark:text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 w-fit">
                            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>{" "}
                            Maintenance
                          </span>
                        )}
                        {veh.status === "Offline" && (
                          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 w-fit">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>{" "}
                            Offline
                          </span>
                        )}
                      </td>

                      {/* Position */}
                      <td className="py-3 px-2 text-gray-700 dark:text-gray-200">
                        <span className="flex items-center gap-1">
                          <FaLocationDot /> {veh.position}
                        </span>
                      </td>

                      {/* Battery */}
                      <td
                        className="py-3 px-2 font-bold"
                        style={{ color: veh.batteryColor }}
                      >
                        <span className="flex items-center gap-3">
                          {getBatteryIcon(parseInt(veh.battery))}
                          {veh.battery}
                        </span>
                      </td>

                      {/* Signal */}
                      <td className="py-3 px-2 text-gray-700 dark:text-gray-200 font-semibold">
                        {veh.signal}
                      </td>

                      {/* Temp */}
                      <td className="py-3 px-2 text-gray-700 dark:text-gray-200 font-semibold">
                        {veh.temperature}
                      </td>

                      {/* Last Seen */}
                      <td className="py-3 px-2 text-gray-500 dark:text-gray-400 font-semibold">
                        {veh.lastSeen}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          {veh.actions.map((act, i) => (
                            <button
                              key={i}
                              className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white p-2 rounded-lg"
                              title={act.label}
                            >
                              {act.icon}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Only show if data exceeds pageSize */}
        {transformedData.length > pageSize && (
          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing{" "}
              {Math.min((page - 1) * pageSize + 1, transformedData.length)} to{" "}
              {Math.min(page * pageSize, transformedData.length)} of{" "}
              {transformedData.length} vehicles
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-gray-700 dark:text-gray-300 mx-2">
                Page {page} of {Math.ceil(transformedData.length / pageSize)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === Math.ceil(transformedData.length / pageSize)}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </DataCard>
    </div>
  );
};

export default VehicleTable;
