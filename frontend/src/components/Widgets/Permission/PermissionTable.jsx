import { useEffect } from "react";
import { FaKey } from "react-icons/fa6";
import { TableSkeleton } from "../../Skeleton";
import DataCard from "../DataCard";
import useLoadingTimeout from "../../../hooks/useLoadingTimeout";

const PermissionTable = ({
  permissionData,
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
    if (!loading || permissionData.length > 0) {
      stopLoading();
    }
  }, [loading, permissionData.length, stopLoading]);

  const shouldShowSkeleton = timeoutLoading && loading;

  const transformedData = permissionData.map((permission) => {
    return {
      id: permission.id,
      name: permission.name || `Permission ${permission.id}`,
      description: permission.description || "No description",
      type: getPermissionType(permission.name),
      typeColor: getPermissionTypeColor(permission.name),
      created: permission.created_at
        ? new Date(permission.created_at).toLocaleDateString()
        : "Unknown",
      updated: permission.updated_at
        ? new Date(permission.updated_at).toLocaleDateString()
        : "Unknown",
      permissionIcon: getPermissionIcon(permission.name),
      permissionId: `P${String(permission.id).padStart(3, "0")}`,
    };
  });

  function getPermissionIcon(name) {
    if (!name) return "P";
    const lowerName = name.toLowerCase();
    if (
      lowerName.includes("read") ||
      lowerName.includes("view") ||
      lowerName.includes("get")
    )
      return "👁";
    if (
      lowerName.includes("write") ||
      lowerName.includes("create") ||
      lowerName.includes("update") ||
      lowerName.includes("edit")
    )
      return "✏";
    if (lowerName.includes("delete") || lowerName.includes("remove"))
      return "🗑";
    return name.charAt(0).toUpperCase();
  }

  function getPermissionType(name) {
    if (!name) return "Other";
    const lowerName = name.toLowerCase();
    if (
      lowerName.includes("read") ||
      lowerName.includes("view") ||
      lowerName.includes("get")
    )
      return "Read";
    if (
      lowerName.includes("write") ||
      lowerName.includes("create") ||
      lowerName.includes("update") ||
      lowerName.includes("edit")
    )
      return "Write";
    if (lowerName.includes("delete") || lowerName.includes("remove"))
      return "Delete";
    return "Other";
  }

  function getPermissionTypeColor(name) {
    const type = getPermissionType(name);
    switch (type) {
      case "Read":
        return "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30";
      case "Write":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30";
      case "Delete":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30";
    }
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
              <FaKey size={20} /> Permission Overview
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
                <th className="py-2 px-2">Permission</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Description</th>
                <th className="py-2 px-2">Created</th>
                <th className="py-2 px-2">Updated</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissionData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-6xl mb-4 text-gray-400 dark:text-gray-500">
                      <FaKey size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                      No permissions found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Waiting for API data or no permissions available
                    </p>
                  </td>
                </tr>
              ) : (
                transformedData
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((permission) => (
                    <tr
                      key={permission.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {permission.permissionIcon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {permission.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {permission.permissionId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${permission.typeColor}`}
                        >
                          {permission.type}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-gray-900 dark:text-white max-w-xs truncate block">
                          {permission.description}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-gray-600 dark:text-gray-300">
                          {permission.created}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-gray-600 dark:text-gray-300">
                          {permission.updated}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="View Permission"
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
                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                            title="Edit Permission"
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
                            title="Delete Permission"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                                clipRule="evenodd"
                              />
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
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
        {permissionData.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, permissionData.length)} of{" "}
              {permissionData.length} permissions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                Page {page} of {Math.ceil(permissionData.length / pageSize)}
              </span>
              <button
                onClick={() =>
                  setPage(
                    Math.min(
                      Math.ceil(permissionData.length / pageSize),
                      page + 1
                    )
                  )
                }
                disabled={page === Math.ceil(permissionData.length / pageSize)}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PermissionTable;
