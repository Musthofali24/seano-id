import React, { useState, useMemo } from "react";
import useTitle from "../hooks/useTitle";
import useVehicleData from "../hooks/useVehicleData";
import useBatteryData from "../hooks/useBatteryData";
import Title from "../ui/Title";
import {
  BatteryDisplay,
  DualUnitAnalytics,
  IndividualCellVoltages,
  SystemHealth,
  PeakLoadTemp,
  BatteryLog,
} from "../components/Widgets/Battery";

const Battery = () => {
  useTitle("Battery Monitoring");

  const { vehicles, selectedVehicleId, setSelectedVehicleId, loading: vehicleLoading } = useVehicleData();
  const { batteryData } = useBatteryData();

  // Get selected vehicle object
  const selectedVehicle = useMemo(() => {
    if (!selectedVehicleId || !vehicles || vehicles.length === 0) {
      return vehicles?.[0] || null;
    }
    return vehicles.find((v) => v.id === parseInt(selectedVehicleId)) || vehicles[0] || null;
  }, [selectedVehicleId, vehicles]);

  // Get battery data for selected vehicle
  const vehicleBatteries = batteryData[selectedVehicle?.id] || { 1: null, 2: null };
  const batteryA = vehicleBatteries[1] || {
    percentage: 84,
    voltage: 12.6,
    status: "charging",
    temperature: 32,
    timestamp: new Date().toISOString(),
  };
  const batteryB = vehicleBatteries[2] || {
    percentage: 62,
    voltage: 11.9,
    status: "active",
    temperature: 34,
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Title title="Battery Monitoring" subtitle="System Batteries Monitoring" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BatteryDisplay unit="A" battery={batteryA} index={0} />
            <BatteryDisplay unit="B" battery={batteryB} index={1} />
          </div>
          <div className="">
            <IndividualCellVoltages
              selectedVehicle={selectedVehicle}
              batteryData={batteryData}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <SystemHealth selectedVehicle={selectedVehicle} batteryData={batteryData} />
            <PeakLoadTemp selectedVehicle={selectedVehicle} batteryData={batteryData} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <DualUnitAnalytics selectedVehicle={selectedVehicle} />
          <BatteryLog selectedVehicle={selectedVehicle} />
        </div>
      </div>
    </div>
  );
};

export default Battery;
