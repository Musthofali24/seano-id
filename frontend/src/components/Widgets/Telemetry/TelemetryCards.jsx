import React from "react";
import WidgetCard from "../WidgetCard";
import WidgetCardSkeleton from "../../Skeleton/WidgetCardSkeleton";

const TelemetryCards = ({
  telemetryData = [],
  isLoading = false,
  skeletonCount = 12,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <WidgetCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {telemetryData.map((data) => (
        <WidgetCard
          key={data.id}
          title={data.title}
          value={data.value}
          icon={data.icon}
          trendIcon={data.trendIcon}
          trendText={data.trendText}
        />
      ))}
    </div>
  );
};

export default TelemetryCards;
