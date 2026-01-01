import { useState } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { DataTable } from "../../UI";
import DataCard from "../DataCard";
import PermissionTableSkeleton from "../../Skeleton/PermissionTableSkeleton";

const PermissionTable = ({
  permissionData,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

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
      header: "Permission",
      accessorKey: "name",
      cell: (row) => (
            <div className="font-medium text-gray-900 dark:text-white">
              {row.name}
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.typeColor}`}
        >
          {row.type}
        </span>
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
              title="View permission"
            >
              <FaEye size={16} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(row)}
              className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
              title="Edit permission"
            >
              <FaEdit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(row.id, row.name)}
              className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              title="Delete permission"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataCard title="Permission Management">
      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-fourth">
              {selectedIds.length}
            </span>{" "}
            permission(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (onBulkDelete) {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FaTrash size={14} />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        data={transformedData}
        searchPlaceholder="Search permissions by name, type, or description..."
        searchKeys={["name", "type", "description", "permissionId"]}
        pageSize={10}
        showPagination={true}
        emptyMessage="No permissions found. Click 'Add Permission' to create one."
        loading={loading && transformedData.length === 0}
        skeletonRows={5}
        SkeletonComponent={PermissionTableSkeleton}
      />
    </DataCard>
  );
};

export default PermissionTable;
