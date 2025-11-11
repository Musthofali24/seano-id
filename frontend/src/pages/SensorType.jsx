import { useState } from "react";
import useTitle from "../hooks/useTitle";
import useSensorTypesData from "../hooks/useSensorTypesData";
import Title from "../ui/Title";
import { WidgetCardSkeleton } from "../components/Skeleton";
import {
  WidgetCard,
  SensorTypeTable,
  SensorTypeModal,
} from "../components/Widgets";
import { getSensorTypeWidgetData } from "../constant";
import useLoadingTimeout from "../hooks/useLoadingTimeout";
import { TbCategory } from "react-icons/tb";

const SensorType = () => {
  useTitle("Sensor Type");
  const [page, setPage] = useState(1);
  const [showAddSensorTypeModal, setShowAddSensorTypeModal] = useState(false);
  const pageSize = 8;
  const { sensorTypes, loading, stats, addSensorType } = useSensorTypesData();
  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton =
    timeoutLoading && loading && sensorTypes.length === 0;
  const widgetData = getSensorTypeWidgetData(stats, sensorTypes);

  const handleCreateSensorType = (sensorTypeData) => {
    // Handle sensor type creation logic here
    console.log("Creating sensor type:", sensorTypeData);
    addSensorType(sensorTypeData);
    setShowAddSensorTypeModal(false);
    // Add your API call or data handling logic here
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title
          title="Sensor Type Management"
          subtitle="Manage and configure sensor type categories"
        />
        <button
          onClick={() => setShowAddSensorTypeModal(true)}
          className="font-semibold flex items-center gap-4 px-3 py-2 rounded-lg text-white hover:bg-blue-700 transition duration-300 cursor-pointer hover:shadow-lg hover:shadow-fourth/50 bg-fourth dark:hover:bg-blue-700"
        >
          <TbCategory size={20} />
          Add Sensor Type
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

      <SensorTypeTable
        sensorTypeData={sensorTypes}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        loading={loading}
      />

      {/* SensorType Modal */}
      <SensorTypeModal
        isOpen={showAddSensorTypeModal}
        onClose={() => setShowAddSensorTypeModal(false)}
        onSubmit={handleCreateSensorType}
      />
    </div>
  );
};

export default SensorType;
