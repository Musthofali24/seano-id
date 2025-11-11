import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import useTitle from "../hooks/useTitle";
import { WidgetCard } from "../components/Widgets";
import { PointModal, PointTable } from "../components/Widgets/Point";
import usePointData from "../hooks/usePointData";
import { getPointWidgetData } from "../constant";
import { Main, Content, Title } from "../ui";
import { WidgetCardSkeleton } from "../components/Skeleton";
import useLoadingTimeout from "../hooks/useLoadingTimeout";

const Point = () => {
  useTitle("Point");
  const { pointData, loading, stats, actions } = usePointData();
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);
  const shouldShowSkeleton =
    timeoutLoading && loading && pointData.length === 0;
  const widgetData = getPointWidgetData(stats, pointData);

  const handleAddPoint = async (formData) => {
    const result = await actions.addPoint(formData);
    if (result.success) {
      setShowModal(false);
      // Optionally show success notification
    }
    return result;
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Title
          title="Point Management"
          subtitle="Manage and configure your point for usv tracking"
        />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <FaPlus size={16} />
          Add Point
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

      {/* Points Table */}
      <PointTable
        pointData={pointData}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        loading={loading}
      />

      {/* Add Point Modal */}
      {showModal && (
        <PointModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddPoint}
          title="Add New Point"
        />
      )}
    </div>
  );
};

export default Point;
