import { memo } from "react";
import useTitle from "../hooks/useTitle";
import { ViewMap, Gyroscope3D } from "../components/Widgets";
import {
  VehicleStatusPanel,
  TelemetryPanel,
  VehicleLogChart,
  SensorDataChart,
  BatteryMonitoring,
  RawDataLog,
  SensorDataLog,
  LatestAlerts,
} from "../components/Widgets/Tracking";

const Tracking = memo(
  ({ darkMode, selectedVehicle }) => {
    useTitle("Tracking");

    return (
      <div className="w-full grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-5">
        <div className="col-span-4 grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-10">
          {/* Left Side - Vehicle Status Panel */}
          <div className="min-h-[480px] h-auto order-2 lg:order-1 lg:grid-cols-2 xl:col-span-2 w-full bg-white border-1 border-gray-200 dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-2xl overflow-hidden">
            <VehicleStatusPanel selectedVehicle={selectedVehicle} />
          </div>
          {/* Center - Map */}
          <div className="z-0 min-h-[360px] h-[360px] md:h-[660px] col-span-1 order-1 lg:order-2 md:col-span-2 lg:col-span-6 bg-white border-1 border-gray-200 dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-2xl overflow-hidden">
            <ViewMap darkMode={darkMode} selectedVehicle={selectedVehicle} />
          </div>
          {/* Right Side - Telemetry Panel */}
          <div className="min-h-[480px] h-auto order-2 lg:order-3 lg:grid-cols-2 xl:col-span-2 w-full bg-white border-1 border-gray-200 dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-2xl overflow-hidden">
            <TelemetryPanel selectedVehicle={selectedVehicle} />
          </div>
        </div>
        <div className="col-span-4 grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-4">
          {/* Sensor Log Chart (multiple sensor type) */}
          {/* <div className="h-[700px] col-span-3 xl:col-span-2 bg-white border-1 border-gray-200 dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-2xl">
            <SensorDataChart selectedVehicle={selectedVehicle} />
          </div> */}
          {/* Vehicle Log Chart (battery, volt, speed, etc)*/}
          {/* <div className="h-[700px] col-span-3 xl:col-span-2 bg-white border-1 border-gray-200 dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-2xl">
            <VehicleLogChart selectedVehicle={selectedVehicle} />
          </div> */}
        </div>
        <div className="col-span-4 grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-6">
          {/* Battery Monitoring */}
          <div className="min-h-[400px] h-auto col-span-3 xl:col-span-3 bg-white border-1 border-gray-200 dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-2xl overflow-hidden">
            <BatteryMonitoring selectedVehicle={selectedVehicle} />
          </div>
          {/* Latest Alerts */}
          <div className="min-h-[320px] h-[360px] md:h-[400px] col-span-3 xl:col-span-3 bg-white border-1 border-gray-200 dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-2xl overflow-hidden">
            <LatestAlerts selectedVehicle={selectedVehicle} />
          </div>
        </div>
        <div className="col-span-4 grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-4">
          {/* Raw Data Log */}
          <div className="min-h-[280px] h-72 md:h-80 col-span-3 xl:col-span-2 bg-white border-1 border-gray-200 dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-2xl overflow-hidden">
            <RawDataLog selectedVehicle={selectedVehicle} />
          </div>
          {/* Sensor Data Log */}
          <div className="min-h-[280px] h-72 md:h-80 col-span-3 xl:col-span-2 bg-white border-1 border-gray-200 dark:bg-transparent dark:border-1 dark:border-gray-700 rounded-2xl overflow-hidden">
            <SensorDataLog selectedVehicle={selectedVehicle} />
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.darkMode === nextProps.darkMode &&
      prevProps.selectedVehicle === nextProps.selectedVehicle
    );
  },
);

Tracking.displayName = "Tracking";

export default Tracking;
