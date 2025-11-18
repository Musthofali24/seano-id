import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import useTitle from "../hooks/useTitle";
import { WidgetCard } from "../components/Widgets";
import { RoleModal, RoleTable } from "../components/Widgets/Role";
import useRoleData from "../hooks/useRoleData";
import { getRoleWidgetData } from "../constant";
import { Title } from "../ui";
import { WidgetCardSkeleton } from "../components/Skeleton";
import useLoadingTimeout from "../hooks/useLoadingTimeout";

const Role = () => {
  useTitle("Role");
  const { roleData, loading, stats, actions } = useRoleData();
  const [showModal, setShowModal] = useState(false);

  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton = timeoutLoading && loading && roleData.length === 0;
  const widgetData = getRoleWidgetData(stats, roleData);

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

      {/* Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 pb-4">
        {shouldShowSkeleton
          ? Array.from({ length: 5 }).map((_, idx) => (
              <WidgetCardSkeleton key={idx} />
            ))
          : widgetData.map((widget, index) => (
              <WidgetCard key={index} {...widget} />
            ))}
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
