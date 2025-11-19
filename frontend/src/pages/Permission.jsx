import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import useTitle from "../hooks/useTitle";
import {
  PermissionModal,
  PermissionTable,
} from "../components/Widgets/Permission";
import usePermissionData from "../hooks/usePermissionData";
import { Title } from "../ui";

const Permission = () => {
  useTitle("Permission");
  const { permissionData, loading, actions } = usePermissionData();
  const [showModal, setShowModal] = useState(false);

  const handleAddPermission = async (formData) => {
    const result = await actions.addPermission(formData);
    if (result.success) {
      setShowModal(false);
    }
    return result;
  };

  const handleEditPermission = (permission) => {
    // TODO: Implement edit permission functionality
    console.log("Edit permission:", permission);
  };

  const handleDeletePermission = (permissionId, permissionName) => {
    // TODO: Implement delete permission functionality
    console.log("Delete permission:", permissionId, permissionName);
  };

  const handleViewPermission = (permission) => {
    // TODO: Implement view permission functionality
    console.log("View permission:", permission);
  };

  const handleBulkDeletePermissions = (selectedIds) => {
    // TODO: Implement bulk delete permissions functionality
    console.log("Bulk delete permissions:", selectedIds);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title
          title="Permission Management"
          subtitle="Manage your permissions"
        />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <FaPlus size={16} />
          Add Permission
        </button>
      </div>

      {/* Permissions Table */}
      <PermissionTable
        permissionData={permissionData}
        loading={loading}
        onEdit={handleEditPermission}
        onDelete={handleDeletePermission}
        onView={handleViewPermission}
        onBulkDelete={handleBulkDeletePermissions}
      />

      {/* Add Permission Modal */}
      {showModal && (
        <PermissionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddPermission}
          title="Add New Permission"
        />
      )}
    </div>
  );
};

export default Permission;
