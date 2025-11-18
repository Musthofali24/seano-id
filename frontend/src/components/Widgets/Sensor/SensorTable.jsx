import { useEffect } from "react";
import { TbPhotoSensor } from "react-icons/tb";
import { TableSkeleton } from "../../Skeleton";
import DataCard from "../DataCard";
import useLoadingTimeout from "../../../hooks/useLoadingTimeout";

const SensorTable = ({
  sensorData,
  page,
  setPage,
  pageSize,
  loading = false,
}) => {
  const { loading: timeoutLoading, stopLoading } = useLoadingTimeout(
    loading,
    5000
  );

  useEffect(() => {
    if (!loading || sensorData.length > 0) {
      stopLoading();
    }
  }, [loading, sensorData.length, stopLoading]);

  const shouldShowSkeleton = timeoutLoading && loading;

  const transformedData = sensorData.map((sensor) => {
    return {
      id: sensor.id,
      name: sensor.name || `Sensor ${sensor.id}`,
      code: sensor.code || `SNS-${String(sensor.id).padStart(3, "0")}`,
      type: sensor.sensor_type_id || sensor.type || "Unknown",
      description: sensor.description || "No description",
      status: sensor.is_active ? "Active" : "Inactive",
      statusColor: sensor.is_active
        ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
        : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
      created: sensor.created_at
        ? new Date(sensor.created_at).toLocaleDateString()
        : "Unknown",
      updated: sensor.updated_at
        ? new Date(sensor.updated_at).toLocaleDateString()
        : "Unknown",
      typeIcon: getSensorTypeIcon(sensor.sensor_type_id || sensor.type),
    };
  });

  function getSensorTypeIcon(type) {
    const icons = {
      hidrografi: "🌊",
      oseanografi: "🌀",
      pressure: "📊",
      ph: "🧪",
      turbidity: "💧",
      default: "📡",
    };
    return icons[type] || icons.default;
  }

  if (shouldShowSkeleton) {
    return <TableSkeleton />;
  }

  return (
    <div className="px-4">
      <DataCard
        headerContent={
          <div className="flex items-center justify-between w-full">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <TbPhotoSensor size={20} /> Sensor Overview
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                <th className="py-3 px-2">Sensor</th>
                <th className="py-3 px-0 max-w-xs whitespace-nowrap">Status</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2">Created</th>
                <th className="py-3 px-2">Last Seen</th>
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sensorData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="text-6xl mb-4 text-gray-400 dark:text-gray-500">
                      <TbPhotoSensor size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                      No sensors found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Waiting for API data or no sensors available
                    </p>
                  </td>
                </tr>
              ) : (
                transformedData
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((sensor) => (
                    <tr
                      key={sensor.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{sensor.typeIcon}</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {sensor.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {sensor.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-0">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sensor.statusColor}`}
                        >
                          {sensor.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-gray-900 dark:text-white capitalize">
                          {sensor.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 max-w-xs">
                        <span className="text-gray-600 dark:text-gray-300 truncate block">
                          {sensor.description}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-gray-600 dark:text-gray-300">
                          {sensor.created}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-gray-600 dark:text-gray-300">
                          {sensor.updated}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="View Details"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Edit Sensor"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete Sensor"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v-1a1 1 0 10-2 0v1zm4 0a1 1 0 102 0v-1a1 1 0 10-2 0v1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sensorData.length > pageSize && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {Math.min((page - 1) * pageSize + 1, sensorData.length)}{" "}
              to {Math.min(page * pageSize, sensorData.length)} of{" "}
              {sensorData.length} sensors
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {Math.ceil(sensorData.length / pageSize)}
              </span>
              <button
                onClick={() =>
                  setPage(
                    Math.min(Math.ceil(sensorData.length / pageSize), page + 1)
                  )
                }
                disabled={page === Math.ceil(sensorData.length / pageSize)}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default SensorTable;
