import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import useTitle from "../hooks/useTitle";
import { WidgetCard } from "../components/Widgets";
import {
  PermissionModal,
  PermissionTable,
} from "../components/Widgets/Permission";
import usePermissionData from "../hooks/usePermissionData";
import { getPermissionWidgetData } from "../constant";
import { Title } from "../ui";
import { WidgetCardSkeleton } from "../components/Skeleton";
import useLoadingTimeout from "../hooks/useLoadingTimeout";

const Permission = () => {
  useTitle("Permission");
  const { permissionData, loading, stats, actions } = usePermissionData();
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton =
    timeoutLoading && loading && permissionData.length === 0;
  const widgetData = getPermissionWidgetData(stats, permissionData);

  const handleAddPermission = async (formData) => {
    const result = await actions.addPermission(formData);
    if (result.success) {
      setShowModal(false);
    }
    return result;
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

      {/* Permissions Table */}
      <PermissionTable
        permissionData={permissionData}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        loading={loading}
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
