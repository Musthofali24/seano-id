import { Dropdown } from "../";

const VehicleSelector = ({ vehicles, selectedVehicle, onVehicleChange }) => {
  return (
    <div className="bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-3xl shadow p-4 col-span-1">
      <h3 className="text-lg font-bold mb-2 dark:text-white">Select Vehicle</h3>
      <Dropdown
        items={vehicles}
        selectedItem={
          selectedVehicle
            ? vehicles.find((v) => v.id === parseInt(selectedVehicle))
            : null
        }
        onItemChange={(vehicle) =>
          onVehicleChange(vehicle ? vehicle.id.toString() : "")
        }
        placeholder="-- Choose Vehicle --"
        getItemKey={(item) => item.id}
        renderSelectedItem={(vehicle) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {vehicle.name}
          </span>
        )}
        renderItem={(vehicle, isSelected) => (
          <>
            <span className="text-gray-900 dark:text-white font-medium">
              {vehicle.name}
            </span>
            {isSelected && (
              <div className="text-[#018190] dark:text-white">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </>
        )}
      />
    </div>
  );
};

export default VehicleSelector;
