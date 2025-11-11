import { useState } from "react";
import useTitle from "../hooks/useTitle";
import useSensorsData from "../hooks/useSensorsData";
import Title from "../ui/Title";
import { WidgetCardSkeleton } from "../components/Skeleton";
import { WidgetCard, SensorTable, SensorModal } from "../components/Widgets";
import { getSensorWidgetData } from "../constant";
import useLoadingTimeout from "../hooks/useLoadingTimeout";
import { TbPhotoSensor } from "react-icons/tb";

const Sensor = () => {
  useTitle("Sensor");
  const [page, setPage] = useState(1);
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);
  const pageSize = 8;
  const { sensors, loading, stats, addSensor } = useSensorsData();
  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton = timeoutLoading && loading && sensors.length === 0;
  const widgetData = getSensorWidgetData(stats, sensors);

  const handleCreateSensor = (sensorData) => {
    // Handle sensor creation logic here
    console.log("Creating sensor:", sensorData);
    addSensor(sensorData);
    setShowAddSensorModal(false);
    // Add your API call or data handling logic here
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title
          title="Sensor Management"
          subtitle="Manage and monitor all sensor devices"
        />
        <button
          onClick={() => setShowAddSensorModal(true)}
          className="font-semibold flex items-center gap-4 px-3 py-2 rounded-lg text-white hover:bg-blue-700 transition duration-300 cursor-pointer hover:shadow-lg hover:shadow-fourth/50 bg-fourth dark:hover:bg-blue-700"
        >
          <TbPhotoSensor size={20} />
          Add Sensor
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

      <SensorTable
        sensorData={sensors}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        loading={loading}
      />

      {/* Sensor Modal */}
      <SensorModal
        isOpen={showAddSensorModal}
        onClose={() => setShowAddSensorModal(false)}
        onSubmit={handleCreateSensor}
      />
    </div>
  );
};

export default Sensor;
