import {
  FaEdit,
  FaTrash,
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
} from "react-icons/fa";
import { DataTable } from "../../UI";
import DataCard from "../DataCard";

const VehicleTable = ({ vehicleData, loading = false, onEdit, onDelete }) => {
  // Transform vehicle data
  const transformedData = vehicleData.map((veh) => {
    // Map status to display format
    let displayStatus = "Offline";
    if (veh.status === "on_mission") displayStatus = "Deployed";
    else if (veh.status === "idle") displayStatus = "Online";
    else if (veh.status === "maintenance") displayStatus = "Maintenance";
    else if (veh.status === "offline") displayStatus = "Offline";

    return {
      id: veh.id,
      name: veh.name || `Vehicle ${veh.id}`,
      description: veh.description || "",
      code: veh.code || `USV-${String(veh.id).padStart(3, "0")}`,
      status: displayStatus,
      statusRaw: veh.status,
      position:
        veh.latitude && veh.longitude
          ? `${veh.latitude.toFixed(4)}, ${veh.longitude.toFixed(4)}`
          : veh.position || "Unknown",
      battery: veh.battery_level
        ? `${veh.battery_level}%`
        : veh.battery || "0%",
      batteryLevel: veh.battery_level || 0,
      signal: veh.signal_strength
        ? `${veh.signal_strength}%`
        : veh.signal || "0%",
      temperature: veh.temperature
        ? `${veh.temperature}°C`
        : veh.temperature || "0°C",
      lastSeen: veh.last_seen
        ? new Date(veh.last_seen).toLocaleString()
        : veh.lastSeen || "Unknown",
      user_id: veh.user_id,
      points_id: veh.points_id,
      created_at: veh.created_at,
      updated_at: veh.updated_at,
    };
  });

  // Get battery icon based on level
  const getBatteryIcon = (level) => {
    if (level >= 80) return <FaBatteryFull className="text-green-500" />;
    if (level >= 60)
      return <FaBatteryThreeQuarters className="text-yellow-500" />;
    if (level >= 40) return <FaBatteryHalf className="text-orange-500" />;
    if (level >= 20) return <FaBatteryQuarter className="text-red-500" />;
    return <FaBatteryEmpty className="text-red-600" />;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      Online:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Deployed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Maintenance:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Offline: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };

    return (
      <span
        className={`px-4 py-1 text-xs font-medium rounded-full ${
          statusClasses[status] || statusClasses.Offline
        }`}
      >
        {status}
      </span>
    );
  };

  // Define columns for DataTable
  const columns = [
    {
      header: "Vehicle",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.code}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: "Position",
      accessorKey: "position",
      cell: (row) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {row.position}
        </span>
      ),
    },
    {
      header: "Battery",
      accessorKey: "battery",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {getBatteryIcon(row.batteryLevel)}
          <span className="text-sm">{row.battery}</span>
        </div>
      ),
    },
    {
      header: "Signal",
      accessorKey: "signal",
      cell: (row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.signal}
        </span>
      ),
    },
    {
      header: "Temperature",
      accessorKey: "temperature",
      cell: (row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.temperature}
        </span>
      ),
    },
    {
      header: "Last Seen",
      accessorKey: "lastSeen",
      cell: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {row.lastSeen}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      className: "text-center w-32",
      cellClassName: "text-center whitespace-nowrap",
      cell: (row) => (
        <div className="flex items-center justify-center gap-3 w-full h-full">
          <button
            onClick={() => onEdit(row)}
            className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Edit vehicle"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(row.id, row.name)}
            className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete vehicle"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading && transformedData.length === 0) {
    return (
      <DataCard title="Vehicle Management">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DataCard>
    );
  }

  return (
    <DataCard title="Vehicle Management">
      <DataTable
        columns={columns}
        data={transformedData}
        searchPlaceholder="Search vehicles by name, code, or status..."
        searchKeys={["name", "code", "status", "position"]}
        pageSize={10}
        showPagination={true}
        emptyMessage="No vehicles found. Click 'Add Vehicle' to create one."
      />
    </DataCard>
  );
};

export default VehicleTable;
