import { useEffect } from "react";
import { FaUserShield } from "react-icons/fa6";
import { TableSkeleton } from "../../Skeleton";
import DataCard from "../DataCard";
import useLoadingTimeout from "../../../hooks/useLoadingTimeout";

const RoleTable = ({ roleData, page, setPage, pageSize, loading = false }) => {
  const { loading: timeoutLoading, stopLoading } = useLoadingTimeout(
    loading,
    5000
  );

  useEffect(() => {
    if (!loading || roleData.length > 0) {
      stopLoading();
    }
  }, [loading, roleData.length, stopLoading]);

  const shouldShowSkeleton = timeoutLoading && loading;

  const transformedData = roleData.map((role) => {
    return {
      id: role.id,
      name: role.name || `Role ${role.id}`,
      description: role.description || "No description",
      created: role.created_at
        ? new Date(role.created_at).toLocaleDateString()
        : "Unknown",
      updated: role.updated_at
        ? new Date(role.updated_at).toLocaleDateString()
        : "Unknown",
      roleIcon: getRoleIcon(role.name),
      roleId: `R${String(role.id).padStart(3, "0")}`,
    };
  });

  function getRoleIcon(name) {
    if (!name) return "R";
    return name.charAt(0).toUpperCase();
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
              <FaUserShield size={20} /> Role Overview
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
                <th className="py-2 px-2">Role</th>
                <th className="py-2 px-2">Description</th>
                <th className="py-2 px-2">Created</th>
                <th className="py-2 px-2">Updated</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roleData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    <div className="text-6xl mb-4 text-gray-400 dark:text-gray-500">
                      <FaUserShield size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                      No roles found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Waiting for API data or no roles available
                    </p>
                  </td>
                </tr>
              ) : (
                transformedData
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((role) => (
                    <tr
                      key={role.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {role.roleIcon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {role.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {role.roleId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-gray-900 dark:text-white max-w-xs truncate block">
                          {role.description}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-gray-600 dark:text-gray-300">
                          {role.created}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-gray-600 dark:text-gray-300">
                          {role.updated}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="View Role"
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
                            title="Edit Role"
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
                            title="Delete Role"
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
        {roleData.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, roleData.length)} of {roleData.length}{" "}
              roles
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
                Page {page} of {Math.ceil(roleData.length / pageSize)}
              </span>
              <button
                onClick={() =>
                  setPage(
                    Math.min(Math.ceil(roleData.length / pageSize), page + 1)
                  )
                }
                disabled={page === Math.ceil(roleData.length / pageSize)}
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

export default RoleTable;
