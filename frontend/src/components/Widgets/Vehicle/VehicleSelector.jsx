const VehicleSelector = ({ vehicles, selectedVehicle, onVehicleChange }) => {
  return (
    <div className="bg-white dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-3xl shadow p-4 col-span-1">
      <h3 className="text-lg font-bold mb-2 dark:text-white">Select Vehicle</h3>
      <div className="w-full p-2 rounded-lg border dark:bg-transparent dark:border-1 dark:border-gray-700 text-black dark:text-white">
        <select
          className="w-full bg-transparent outline-none"
          value={selectedVehicle}
          onChange={(e) => onVehicleChange(e.target.value)}
        >
          <option className="dark:bg-secondary" value="">
            -- Choose Vehicle --
          </option>
          {vehicles.map((v) => (
            <option className="dark:bg-secondary" key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VehicleSelector;
