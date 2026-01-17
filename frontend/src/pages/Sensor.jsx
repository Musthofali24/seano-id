import { useState } from "react";
import useTitle from "../hooks/useTitle";
import useSensorsData from "../hooks/useSensorsData";
import { usePermission } from "../hooks/usePermission";
import Title from "../ui/Title";
import { WidgetCardSkeleton } from "../components/Skeleton";
import { WidgetCard, SensorTable, SensorModal } from "../components/Widgets";
import { getSensorWidgetData } from "../constant";
import useLoadingTimeout from "../hooks/useLoadingTimeout";
import { TbPhotoSensor } from "react-icons/tb";
import toast from "react-hot-toast";
import axios from "../utils/axiosConfig";
import { API_ENDPOINTS } from "../config";

const Sensor = () => {
  useTitle("Sensor");
  const { hasPermission } = usePermission();
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);
  const [showEditSensorModal, setShowEditSensorModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const { sensors, loading, stats, addSensor, fetchSensors } = useSensorsData();
  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton = timeoutLoading && loading && sensors.length === 0;
  const widgetData = getSensorWidgetData(stats, sensors);

  const handleCreateSensor = (sensorData) => {
    console.log("Creating sensor:", sensorData);
    addSensor(sensorData);
    setShowAddSensorModal(false);
  };

  const handleEditSensor = (sensor) => {
    setEditData({
      id: sensor.id,
      name: sensor.name,
      code: sensor.code,
      sensor_type_id: sensor.type,
      description: sensor.description,
      is_active: sensor.statusRaw,
    });
    setShowEditSensorModal(true);
  };

  const handleUpdateSensor = async (sensorData) => {
    try {
      await axios.put(
        `${API_ENDPOINTS.SENSOR.UPDATE(editData.id)}`,
        sensorData,
      );
      toast.success("Sensor updated successfully!");
      fetchSensors();
      setShowEditSensorModal(false);
      setEditData(null);
    } catch (error) {
      console.error("Error updating sensor:", error);
      toast.error(error.response?.data?.detail || "Failed to update sensor");
    }
  };

  const handleDeleteSensor = async (sensorId, sensorName) => {
    if (
      window.confirm(`Are you sure you want to delete sensor "${sensorName}"?`)
    ) {
      try {
        await axios.delete(API_ENDPOINTS.SENSOR.DELETE(sensorId));
        toast.success("Sensor deleted successfully!");
        fetchSensors();
      } catch (error) {
        console.error("Error deleting sensor:", error);
        toast.error(error.response?.data?.detail || "Failed to delete sensor");
      }
    }
  };

  const handleBulkDelete = async (sensorIds) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${sensorIds.length} sensor(s)?`,
      )
    ) {
      try {
        await Promise.all(
          sensorIds.map((id) => axios.delete(API_ENDPOINTS.SENSOR.DELETE(id))),
        );
        toast.success(`${sensorIds.length} sensor(s) deleted successfully!`);
        fetchSensors();
      } catch (error) {
        console.error("Error deleting sensors:", error);
        toast.error("Failed to delete some sensors");
      }
    }
  };

  const handleViewSensor = (sensor) => {
    console.log("Viewing sensor:", sensor);
    // TODO: Implement view sensor details
    toast.success(`Viewing sensor: ${sensor.name}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title
          title="Sensor Management"
          subtitle="Manage and monitor all sensor devices"
        />
        {hasPermission("sensor:create") && (
          <button
            onClick={() => setShowAddSensorModal(true)}
            className="font-semibold flex items-center gap-4 px-3 py-2 rounded-lg text-white hover:bg-blue-700 transition duration-300 cursor-pointer hover:shadow-lg hover:shadow-fourth/50 bg-fourth dark:hover:bg-blue-700"
          >
            <TbPhotoSensor size={20} />
            Add Sensor
          </button>
        )}
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
        loading={loading}
        onEdit={handleEditSensor}
        onDelete={handleDeleteSensor}
        onView={handleViewSensor}
        onBulkDelete={handleBulkDelete}
      />

      {/* Create Sensor Modal */}
      <SensorModal
        isOpen={showAddSensorModal}
        onClose={() => setShowAddSensorModal(false)}
        onSubmit={handleCreateSensor}
      />

      {/* Edit Sensor Modal */}
      <SensorModal
        isOpen={showEditSensorModal}
        onClose={() => {
          setShowEditSensorModal(false);
          setEditData(null);
        }}
        onSubmit={handleUpdateSensor}
        editData={editData}
      />
    </div>
  );
};

export default Sensor;
