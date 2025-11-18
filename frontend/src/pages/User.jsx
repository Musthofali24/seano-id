import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import useTitle from "../hooks/useTitle";
import { WidgetCard } from "../components/Widgets";
import { UserModal, UserTable } from "../components/Widgets/User";
import useUserData from "../hooks/useUserData";
import { getUserWidgetData } from "../constant";
import { Title } from "../ui";
import { WidgetCardSkeleton } from "../components/Skeleton";
import useLoadingTimeout from "../hooks/useLoadingTimeout";

const User = () => {
  useTitle("User");
  const { userData, loading, stats, actions } = useUserData();
  const [showModal, setShowModal] = useState(false);

  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton = timeoutLoading && loading && userData.length === 0;
  const widgetData = getUserWidgetData(stats, userData);

  const handleAddUser = async (formData) => {
    const result = await actions.addUser(formData);
    if (result.success) {
      setShowModal(false);
    }
    return result;
  };

  const handleEditUser = (user) => {
    console.log("Editing user:", user);
    // TODO: Implement edit functionality
  };

  const handleDeleteUser = (id, name) => {
    console.log("Deleting user:", id, name);
    // TODO: Implement delete functionality
  };

  const handleViewUser = (user) => {
    console.log("Viewing user:", user);
    // TODO: Implement view functionality
  };

  const handleBulkDeleteUsers = (ids) => {
    console.log("Bulk deleting users:", ids);
    // TODO: Implement bulk delete functionality
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title title="User Management" subtitle="Manage your user" />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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
      {showModal && (
        <UserModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddUser}
          title="Add New User"
        />
      )}
    </div>
  );
};

export default User;
