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
import toast from "../components/ui/toast";

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
      toast.success("User created successfully!");
      setShowAddModal(false);
    } else {
      toast.error(result.error || "Failed to create user");
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
      toast.success("User updated successfully!");
      setShowEditModal(false);
      setSelectedUser(null);
    } else {
      toast.error(result.error || "Failed to update user");
    }
    return result;
  };

  const handleDeleteUser = (id, name) => {
    setSelectedUser({ id, name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser || selectedUser.isBulk) return;

    const result = await actions.deleteUser(selectedUser.id);
    if (result.success) {
      toast.success("User deleted successfully!");
      setShowDeleteModal(false);
      setSelectedUser(null);
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleBulkDeleteUsers = (ids) => {
    setSelectedUser({ ids, isBulk: true });
    setShowDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (!selectedUser || !selectedUser.ids) return;
    
    try {
      for (const id of selectedUser.ids) {
        await actions.deleteUser(id);
      }
      toast.success(`${selectedUser.ids.length} user(s) deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      actions.refreshData();
    } catch (error) {
      toast.error("Failed to delete some users");
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
          onConfirm={selectedUser.isBulk ? handleConfirmBulkDelete : handleConfirmDelete}
          title="Delete User"
          itemName={selectedUser.isBulk ? `${selectedUser.ids.length} user(s)` : selectedUser.name}
          itemType="user"
        />
      )}
    </div>
  );
};

export default User;
