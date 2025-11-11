import Dropdown from "../Dropdown";

const VehicleDropdown = ({
  vehicles,
  selectedVehicle,
  onVehicleChange,
  placeholder = "Select a vessel to view details",
  className = "",
}) => {
  // Get status indicator color
  const getStatusColor = (status) => {
    switch (status) {
      case "online":
      case "idle":
      case "on_mission":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "maintenance":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // Custom render function for selected item
  const renderSelectedItem = (vehicle) => (
    <>
      <div
        className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.status)}`}
      />
      <span className="font-medium text-gray-900 dark:text-white">
        {vehicle.name}
      </span>
    </>
  );

  // Custom render function for dropdown items
  const renderItem = (vehicle, isSelected) => (
    <>
      <div
        className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.status)}`}
      />
      <div className="flex-1">
        <div className="text-gray-900 dark:text-white font-medium">
          {vehicle.name}
        </div>
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          {vehicle.code}
        </div>
      </div>
      {isSelected && (
        <div className="text-blue-600 dark:text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </>
  );

  return (
    <Dropdown
      items={vehicles}
      selectedItem={selectedVehicle}
      onItemChange={onVehicleChange}
      placeholder={placeholder}
      renderItem={renderItem}
      renderSelectedItem={renderSelectedItem}
      getItemKey={(vehicle) => vehicle.id}
      className={className}
    />
  );
};

export default VehicleDropdown;
