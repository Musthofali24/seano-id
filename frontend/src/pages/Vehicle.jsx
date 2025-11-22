import { useState, useEffect } from "react";
import useTitle from "../hooks/useTitle";
import Title from "../ui/Title";
import { WidgetCardSkeleton } from "../components/Skeleton";
import { WidgetCard, VehicleTable, VehicleModal } from "../components/Widgets";
import { AddVehicleWizard } from "../components/Widgets/Vehicle";
import { ConfirmModal } from "../components/UI";
import { getWidgetData } from "../constant";
import useLoadingTimeout from "../hooks/useLoadingTimeout";
import axios from "../utils/axiosConfig";
import { API_ENDPOINTS } from "../config";
import toast from "react-hot-toast";
import { FaShip } from "react-icons/fa";

const Vehicle = () => {
  useTitle("Vehicle");
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton = timeoutLoading && loading && vehicles.length === 0;
  const widgetData = getWidgetData(stats, vehicles);

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.VEHICLES.LIST);

        console.log("=== RAW API RESPONSE ===");
        console.log("Response data:", response.data);

        const data = response.data;
        const processedVehicles = Array.isArray(data)
          ? data.map((vehicle) => {
              console.log("Processing vehicle:", vehicle);
              console.log("Vehicle code from API:", vehicle.code);
              return {
                ...vehicle,
                code:
                  vehicle.code || `USV-${String(vehicle.id).padStart(3, "0")}`,
                type: vehicle.type || "USV",
                role: vehicle.role || "Patrol",
                battery_level: vehicle.battery_level || 0,
              };
            })
          : [];

        console.log("Processed vehicles:", processedVehicles);
        setVehicles(processedVehicles);

        // Calculate stats
        const totalVehicles = processedVehicles.length;
        const onMission = processedVehicles.filter(
          (v) => v.status === "on_mission"
        ).length;
        const online = processedVehicles.filter(
          (v) => v.status === "idle" || v.status === "on_mission"
        ).length;
        const offline = processedVehicles.filter(
          (v) => v.status === "offline"
        ).length;
        const maintenance = processedVehicles.filter(
          (v) => v.status === "maintenance"
        ).length;

        setStats({
          totalToday: totalVehicles,
          totalYesterday: 0,
          onMissionToday: onMission,
          onMissionYesterday: 0,
          onlineToday: online,
          onlineYesterday: 0,
          offlineToday: offline,
          offlineYesterday: 0,
          maintenanceToday: maintenance,
          maintenanceYesterday: 0,
        });
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [refreshTrigger]);

  // Force refresh vehicle data
  const refreshVehicles = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCreateOrUpdateVehicle = async (vehicleData, vehicleId = null) => {
    try {
      console.log("Submitting vehicle data:", vehicleData);

      if (vehicleId) {
        // Update existing vehicle
        const response = await axios.put(
          API_ENDPOINTS.VEHICLES.UPDATE(vehicleId),
          vehicleData
        );
        console.log("Update response:", response.data);
        toast.success("Vehicle updated successfully!");
      } else {
        // Create new vehicle
        const response = await axios.post(
          API_ENDPOINTS.VEHICLES.CREATE,
          vehicleData
        );
        console.log("Create response:", response.data);
        toast.success("Vehicle created successfully!");
      }

      // Close modal first
      setShowVehicleModal(false);
      setEditingVehicle(null);

      // Refresh vehicle list immediately
      refreshVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      console.error("Error response:", error.response);

      let errorMessage = "Failed to save vehicle";

      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((e) => e.msg || e.message || JSON.stringify(e))
            .join(", ");
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleEditVehicle = (vehicle) => {
    // Prepare vehicle data for editing
    const editData = {
      id: vehicle.id,
      name: vehicle.name,
      code: vehicle.code,
      description: vehicle.description,
      status: vehicle.statusRaw || vehicle.status.toLowerCase(),
      user_id: vehicle.user_id,
    };
    console.log("handleEditVehicle - editData:", editData);
    setEditingVehicle(editData);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = (vehicleId, vehicleName) => {
    setVehicleToDelete({ id: vehicleId, name: vehicleName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(API_ENDPOINTS.VEHICLES.DELETE(vehicleToDelete.id));
      toast.success(`Vehicle "${vehicleToDelete.name}" deleted successfully!`);

      // Close modal and reset state
      setShowDeleteModal(false);
      setVehicleToDelete(null);

      // Refresh vehicle list immediately
      refreshVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);

      let errorMessage = "Failed to delete vehicle";
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };

  const handleBulkDelete = async (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return;

    const confirmBulk = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} vehicle(s)? This action cannot be undone.`
    );

    if (!confirmBulk) return;

    try {
      // Delete all selected vehicles
      await Promise.all(
        selectedIds.map((id) => axios.delete(API_ENDPOINTS.VEHICLES.DELETE(id)))
      );

      toast.success(`${selectedIds.length} vehicle(s) deleted successfully!`);
      refreshVehicles();
    } catch (error) {
      console.error("Error bulk deleting vehicles:", error);
      toast.error("Failed to delete some vehicles");
    }
  };

  const handleCloseModal = () => {
    setShowVehicleModal(false);
    setEditingVehicle(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title
          title="Vehicle Management"
          subtitle="Manage and monitor all USV vehicles"
        />
        <button
          onClick={() => setShowWizard(true)}
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
        loading={loading}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
        onBulkDelete={handleBulkDelete}
      />

      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={showVehicleModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateOrUpdateVehicle}
        editData={editingVehicle}
      />

      {/* Add Vehicle Wizard */}
      <AddVehicleWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={refreshVehicles}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Vehicle"
        message={
          vehicleToDelete
            ? `Are you sure you want to delete "${vehicleToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this vehicle?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Vehicle;
