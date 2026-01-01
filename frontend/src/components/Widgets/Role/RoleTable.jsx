import { useState } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { DataTable } from "../../UI";
import DataCard from "../DataCard";
import RoleTableSkeleton from "../../Skeleton/RoleTableSkeleton";

const RoleTable = ({
  roleData,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

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

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(transformedData.map((row) => row.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle individual checkbox
  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Define columns for DataTable
  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={
            selectedIds.length === transformedData.length &&
            transformedData.length > 0
          }
          onChange={handleSelectAll}
          className="appearance-none w-4 h-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-fourth cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-fourth focus:ring-offset-0 hover:border-gray-400 dark:hover:border-gray-500 checked:bg-fourth checked:border-fourth dark:checked:bg-fourth dark:checked:border-fourth checked:hover:bg-blue-700 dark:checked:hover:bg-blue-700"
          style={{
            backgroundImage:
              selectedIds.length === transformedData.length &&
              transformedData.length > 0
                ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
                : "none",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      ),
      accessorKey: "checkbox",
      className: "w-12 text-center",
      cellClassName: "text-center",
      sortable: false,
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectOne(row.id)}
          onClick={(e) => e.stopPropagation()}
          className="appearance-none w-4 h-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-fourth cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-fourth focus:ring-offset-0 hover:border-gray-400 dark:hover:border-gray-500 checked:bg-fourth checked:border-fourth dark:checked:bg-fourth dark:checked:border-fourth checked:hover:bg-blue-700 dark:checked:hover:bg-blue-700"
          style={{
            backgroundImage: selectedIds.includes(row.id)
              ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
              : "none",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      ),
    },
    {
      header: "Role",
      accessorKey: "name",
      cell: (row) => (
            <div className="font-medium text-gray-900 dark:text-white">
              {row.name}
        </div>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (row) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {row.description}
        </span>
      ),
    },
    {
      header: "Created",
      accessorKey: "created",
      cell: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {row.created}
        </span>
      ),
    },
    {
      header: "Last Updated",
      accessorKey: "updated",
      cell: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {row.updated}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      className: "text-center w-40",
      cellClassName: "text-center whitespace-nowrap",
      sortable: false,
      cell: (row) => (
        <div className="flex items-center justify-center gap-3 w-full h-full">
          {onView && (
            <button
              onClick={() => onView(row)}
              className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-pointer"
              title="View role"
            >
              <FaEye size={16} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(row)}
              className="inline-flex items-center justify-center p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors rounded hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
              title="Edit role"
            >
              <FaEdit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(row.id, row.name)}
              className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              title="Delete role"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataCard
      headerContent={
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Role Management
          </h2>
          {selectedIds.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedIds.length} selected
            </span>
          )}
        </div>
      }
    >
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/40">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedIds.length} role{selectedIds.length > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2">
            {onBulkDelete && (
              <button
                onClick={() => {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }}
                className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete Selected
              </button>
            )}
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-900/20"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
      <DataTable
        data={transformedData}
        columns={columns}
        searchKeys={["name", "description"]}
        pageSize={10}
        loading={loading && transformedData.length === 0}
        skeletonRows={5}
        SkeletonComponent={RoleTableSkeleton}
      />
    </DataCard>
  );
};

export default RoleTable;
