import { useState } from "react";
import useTitle from "../hooks/useTitle";
import useVehicleData from "../hooks/useVehicleData";
import Title from "../ui/Title";
import { WidgetCardSkeleton } from "../components/Skeleton";
import { WidgetCard, VehicleTable, VehicleModal } from "../components/Widgets";
import { getWidgetData } from "../constant";
import useLoadingTimeout from "../hooks/useLoadingTimeout";
import {
  FaBatteryEmpty,
  FaBatteryQuarter,
  FaBatteryHalf,
  FaBatteryThreeQuarters,
  FaBatteryFull,
  FaShip,
} from "react-icons/fa";

const Vehicle = () => {
  useTitle("Vehicle");
  const [page, setPage] = useState(1);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const pageSize = 8;
  const { vehicles, loading, stats } = useVehicleData();
  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton = timeoutLoading && loading && vehicles.length === 0;
  const widgetData = getWidgetData(stats, vehicles);

  const handleCreateVehicle = (vehicleData) => {
    console.log("Creating vehicle:", vehicleData);
    setShowAddVehicleModal(false);
  };

  function getBatteryIcon(percent) {
    if (percent >= 80) return <FaBatteryFull />;
    if (percent >= 60) return <FaBatteryThreeQuarters />;
    if (percent >= 40) return <FaBatteryHalf />;
    if (percent >= 20) return <FaBatteryQuarter />;
    return <FaBatteryEmpty />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title
          title="Vehicle Management"
          subtitle="Manage and monitor all USV vehicles"
        />
        <button
          onClick={() => setShowAddVehicleModal(true)}
          className="font-semibold flex items-center gap-4 px-3 py-2 rounded-lg text-white hover:bg-blue-700 transition duration-300 cursor-pointer hover:shadow-lg hover:shadow-fourth/50 bg-fourth dark:hover:bg-blue-700"
        >
          <FaShip size={20} />
          Add Vehicle
        </button>
      </div>
      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-4 pb-4">
        {shouldShowSkeleton
          ? // Skeleton Loading with timeout
            Array.from({ length: 5 }).map((_, idx) => (
              <WidgetCardSkeleton key={idx} />
            ))
          : widgetData.map((item, idx) => <WidgetCard key={idx} {...item} />)}
      </div>

      <VehicleTable
        vehicleData={vehicles}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        getBatteryIcon={getBatteryIcon}
        loading={loading}
      />

      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
        onSubmit={handleCreateVehicle}
      />
    </div>
  );
};

export default Vehicle;
