import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import useTitle from "../hooks/useTitle";
import { RoleModal, RoleTable } from "../components/Widgets/Role";
import useRoleData from "../hooks/useRoleData";
import { Title } from "../ui";

const Role = () => {
  useTitle("Role");
  const { roleData, loading, actions } = useRoleData();
  const [showModal, setShowModal] = useState(false);

  const handleAddRole = async (formData) => {
    const result = await actions.addRole(formData);
    if (result.success) {
      setShowModal(false);
    }
    return result;
  };

  const handleEditRole = (role) => {
    // TODO: Implement edit role functionality
    console.log("Edit role:", role);
  };

  const handleDeleteRole = (roleId, roleName) => {
    // TODO: Implement delete role functionality
    console.log("Delete role:", roleId, roleName);
  };

  const handleViewRole = (role) => {
    // TODO: Implement view role functionality
    console.log("View role:", role);
  };

  const handleBulkDeleteRoles = (selectedIds) => {
    // TODO: Implement bulk delete roles functionality
    console.log("Bulk delete roles:", selectedIds);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title title="Role Management" subtitle="Manage your roles" />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <FaPlus size={16} />
          Add Role
        </button>
      </div>

      {/* Roles Table */}
      <RoleTable
        roleData={roleData}
        loading={loading}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
        onView={handleViewRole}
        onBulkDelete={handleBulkDeleteRoles}
      />

      {/* Add Role Modal */}
      {showModal && (
        <RoleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddRole}
          title="Add New Role"
        />
      )}
    </div>
  );
};

export default Role;
