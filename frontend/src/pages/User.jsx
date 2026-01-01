import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import useTitle from "../hooks/useTitle";
import { WidgetCard } from "../components/Widgets";
import { UserModal, EditUserModal, ViewUserModal, UserTable } from "../components/Widgets/User";
import DeleteConfirmModal from "../components/Widgets/DeleteConfirmModal";
import useUserData from "../hooks/useUserData";
import useRoleData from "../hooks/useRoleData";
import usePermissionData from "../hooks/usePermissionData";
import { getUserWidgetData } from "../constant";
import { Title } from "../ui";
import { WidgetCardSkeleton } from "../components/Skeleton";
import useLoadingTimeout from "../hooks/useLoadingTimeout";

const User = () => {
  useTitle("User");
  const { userData, loading, stats, actions } = useUserData();
  const { roleData } = useRoleData();
  const { permissionData } = usePermissionData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton = timeoutLoading && loading && userData.length === 0;
  const widgetData = getUserWidgetData(
    stats,
    userData,
    roleData,
    permissionData
  );

  const handleAddUser = async (formData) => {
    const result = await actions.addUser(formData);
    if (result.success) {
      setShowAddModal(false);
    }
    return result;
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (formData) => {
    if (!selectedUser) return { success: false };

    const result = await actions.updateUser(selectedUser.id, {
      username: formData.username,
    });

    if (result.success) {
      setShowEditModal(false);
      setSelectedUser(null);
    }
    return result;
  };

  const handleDeleteUser = (id, name) => {
    setSelectedUser({ id, name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    const result = await actions.deleteUser(selectedUser.id);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedUser(null);
    } else {
      alert(`Failed to delete user: ${result.error}`);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleBulkDeleteUsers = async (ids) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} user(s)?`)) {
      for (const id of ids) {
        await actions.deleteUser(id);
      }
      actions.refreshData();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title title="User Management" subtitle="Manage your user" />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          <FaPlus size={16} />
          Add User
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

      {/* Users Table */}
      <UserTable
        userData={userData}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onView={handleViewUser}
        onBulkDelete={handleBulkDeleteUsers}
      />

      {/* Add User Modal */}
      {showAddModal && (
        <UserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddUser}
          title="Add New User"
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateUser}
          user={selectedUser}
        />
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <ViewUserModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && selectedUser && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete User"
          itemName={selectedUser.name}
          itemType="user"
        />
      )}
    </div>
  );
};

export default User;
