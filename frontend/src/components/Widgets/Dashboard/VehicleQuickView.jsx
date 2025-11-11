import React from "react";
import {
  FaShip,
  FaBatteryFull,
  FaGaugeHigh,
  FaCompass,
  FaMapPin,
  FaCrosshairs,
  FaGear,
} from "react-icons/fa6";
import { VehicleDropdown } from "../";

const VehicleQuickView = ({
  vehicles,
  selectedVehicleId,
  setSelectedVehicleId,
}) => {
  // Find selected vehicle from vehicles array
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Use actual data from selected vehicle if available
  const vehicleDetails = selectedVehicle
    ? {
        status: selectedVehicle.status || "Unknown",
        lastUpdate: selectedVehicle.updated_at || new Date().toISOString(),
        battery: selectedVehicle.battery_level || 0,
        speed: selectedVehicle.speed || "0 kts",
        heading: selectedVehicle.heading || "N/A",
        gps: selectedVehicle.gps_status || "No GPS",
        armed: selectedVehicle.armed_status || "Unknown",
        mode: selectedVehicle.mode || "Manual",
        coordinates:
          selectedVehicle.latitude && selectedVehicle.longitude
            ? `${selectedVehicle.latitude.toFixed(
                4
              )}, ${selectedVehicle.longitude.toFixed(4)}`
            : "N/A",
      }
    : {
        status: "No Vehicle Selected",
        lastUpdate: "N/A",
        battery: 0,
        speed: "0 kts",
        heading: "N/A",
        gps: "No GPS",
        armed: "N/A",
        mode: "N/A",
        coordinates: "N/A",
      };

  const statusCards = [
    {
      icon: FaBatteryFull,
      title: "Battery",
      value: `${vehicleDetails.battery}%`,
      color: "green",
      bgColor: "bg-green-500/20",
    },
    {
      icon: FaGaugeHigh,
      title: "Speed",
      value: vehicleDetails.speed,
      color: "blue",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: FaCompass,
      title: "Heading",
      value: vehicleDetails.heading,
      color: "purple",
      bgColor: "bg-purple-500/20",
    },
    {
      icon: FaCrosshairs,
      title: "GPS",
      value: vehicleDetails.gps,
      color: "yellow",
      bgColor: "bg-yellow-500/20",
    },
    {
      icon: FaGear,
      title: "Armed",
      value: vehicleDetails.armed,
      color: "orange",
      bgColor: "bg-orange-500/20",
    },
    {
      icon: FaGear,
      title: "Mode",
      value: vehicleDetails.mode,
      color: "cyan",
      bgColor: "bg-cyan-500/20",
    },
  ];

  return (
    <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-slate-600 p-8 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <FaShip size={30} className="text-blue-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Vessels Quick View
        </h1>
      </div>
      <VehicleDropdown
        vehicles={vehicles}
        selectedVehicle={selectedVehicleId}
        onVehicleChange={setSelectedVehicleId}
        placeholder="Select a vessel to view details"
      />{" "}
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-gray-900 dark:text-white font-semibold">Status</h1>
        <div className="flex items-center gap-2 px-2 rounded-3xl">
          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
          <h1 className="text-gray-900 dark:text-white">
            {vehicleDetails.status}
          </h1>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-gray-900 dark:text-white font-semibold">
          Last Update
        </h1>
        <div className="flex items-center gap-2 px-2 rounded-3xl">
          <h1 className="text-gray-900 dark:text-white">
            {vehicleDetails.lastUpdate}
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {statusCards.map((card, index) => (
          <div
            key={index}
            className="bg-transparent border border-gray-200 dark:border-slate-600 rounded-xl p-4 flex items-center gap-3 dark:hover:bg-slate-600 transition-colors duration-200"
          >
            <div className={`${card.bgColor} p-3 rounded-full`}>
              <card.icon size={24} className={`text-${card.color}-500`} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                {card.title}
              </h3>
              <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                {card.value}
              </h2>
            </div>
          </div>
        ))}
      </div>
      {/* Coordinates Card */}
      <div className="bg-transparent border border-gray-200 dark:border-slate-600 rounded-xl p-4 flex items-center gap-3 dark:hover:bg-slate-600 transition-colors duration-200 mt-4">
        <div className="bg-red-500/20 p-3 rounded-full">
          <FaMapPin size={24} className="text-red-500" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            Coordinates
          </h3>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold">
            {vehicleDetails.coordinates}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default VehicleQuickView;
