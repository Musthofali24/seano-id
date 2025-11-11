import React, { useEffect, useState } from "react";
import useVehicleData from "../../../hooks/useVehicleData";
import useMissionData from "../../../hooks/useMissionData";
import { VehicleDropdown } from "../../Widgets";
import {
  FaBatteryEmpty,
  FaBatteryQuarter,
  FaBatteryHalf,
  FaBatteryThreeQuarters,
  FaBatteryFull,
  FaMapMarkerAlt,
  FaWifi,
  FaRoute,
} from "react-icons/fa";
import { FaLocationDot, FaLocationPin, FaMapLocation } from "react-icons/fa6";

const Topbar = ({ isSidebarOpen, selectedVehicle, setSelectedVehicle }) => {
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [rssiLevel, setRssiLevel] = useState(-45);
  const { vehicles, loading } = useVehicleData();
  const { getActiveMissions } = useMissionData();
  const usvStatus = "online";

  // Get current active mission for selected vehicle
  const getCurrentMission = () => {
    if (!selectedVehicle) return null;

    const activeMissions = getActiveMissions();
    return activeMissions.find(
      (mission) =>
        mission.vehicle === selectedVehicle.name ||
        mission.vehicle === selectedVehicle.id ||
        mission.vehicle === selectedVehicle.vehicle_name
    );
  };

  const currentMission = getCurrentMission();

  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        setBatteryLevel(battery.level);
        battery.addEventListener("levelchange", () =>
          setBatteryLevel(battery.level)
        );
      });
    }
  }, []);

  const renderBatteryIcon = () => {
    if (batteryLevel <= 0.1)
      return <FaBatteryEmpty size={30} className="text-red-500" />;
    if (batteryLevel <= 0.3)
      return <FaBatteryQuarter size={30} className="text-orange-500" />;
    if (batteryLevel <= 0.6)
      return <FaBatteryHalf size={30} className="text-yellow-500" />;
    if (batteryLevel <= 0.9)
      return <FaBatteryThreeQuarters size={30} className="text-green-400" />;
    return <FaBatteryFull size={30} className="text-green-500" />;
  };

  const renderRssiIcon = () => {
    if (rssiLevel >= -50)
      return (
        <FaWifi size={20} className="text-green-500" title="Excellent Signal" />
      );
    if (rssiLevel >= -60)
      return (
        <FaWifi size={20} className="text-green-400" title="Good Signal" />
      );
    if (rssiLevel >= -70)
      return (
        <FaWifi size={20} className="text-yellow-500" title="Fair Signal" />
      );
    if (rssiLevel >= -80)
      return (
        <FaWifi size={20} className="text-orange-500" title="Poor Signal" />
      );
    return (
      <FaWifi size={20} className="text-red-500" title="Very Poor Signal" />
    );
  };

  // RSSI data should come from selected vehicle API data
  useEffect(() => {
    if (selectedVehicle && selectedVehicle.rssi) {
      setRssiLevel(selectedVehicle.rssi);
    }
  }, [selectedVehicle]);

  return (
    <div
      className={`fixed z-30 top-14 right-0 bg-white
                  h-15 sm:h-15 py-2 px-4 border-b border-gray-200
                  dark:bg-black dark:border-gray-700
                  flex flex-col sm:flex-row space-y-1 md:space-y-0 sm:items-center sm:justify-between
                  ${isSidebarOpen ? "md:left-64 left-16" : "left-16"}`}
    >
      <div className="flex items-center gap-4 dark:text-white text-sm">
        <div className="flex items-center gap-2">
          <span
            className={`relative flex items-center gap-2 px-2.5 py-1.5 text-sm font-semibold rounded-full ${
              usvStatus === "online"
                ? "bg-green-100 text-green-600"
                : usvStatus === "offline"
                ? "bg-gray-200 text-gray-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {/* Bullet with pulse */}
            <span className="relative flex w-3 h-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                  usvStatus === "online"
                    ? "bg-green-400"
                    : usvStatus === "offline"
                    ? "bg-gray-400"
                    : "bg-red-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full w-3 h-3 ${
                  usvStatus === "online"
                    ? "bg-green-500"
                    : usvStatus === "offline"
                    ? "bg-gray-500"
                    : "bg-red-500"
                }`}
              ></span>
            </span>

            {/* 🔹 Teks status */}
            {usvStatus}
          </span>
        </div>
        <div className="min-w-[200px]">
          <VehicleDropdown
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onVehicleChange={setSelectedVehicle}
            placeholder={loading ? "Loading vehicles..." : "Select Vehicle"}
            className="text-sm"
          />
        </div>
      </div>

      {/* Indikator */}
      <div className="flex items-center gap-4 dark:text-white text-sm">
        {/* Waypoint Progress - show always when vehicle is selected */}
        {selectedVehicle && (
          <div
            className={`flex items-center gap-3 px-2 py-1 bg-transparent`}
            title={
              currentMission
                ? `Mission: ${currentMission.title || "Active Mission"}`
                : "No active mission"
            }
          >
            <FaMapLocation
              size={20}
              className={currentMission ? "text-blue-500" : "text-gray-400"}
            />
            <span
              className={`font-mono font-medium ${
                currentMission
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {currentMission
                ? `WP ${currentMission.current_waypoint || 0}/${
                    currentMission.waypoints || 0
                  }`
                : "WP -- / --"}
            </span>
            {/* Progress indicator */}
          </div>
        )}

        <div className="flex items-center gap-2">
          {renderRssiIcon()}
          <span>{rssiLevel} dBm</span>
        </div>
        <div className="flex items-center gap-2">
          {renderBatteryIcon()}
          <span>{Math.round(batteryLevel * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-400" />
          <span>Jakarta, Indonesia</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
