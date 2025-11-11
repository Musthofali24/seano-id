import { WidgetCard } from "../index";
import { WidgetCardSkeleton } from "../../Skeleton";

const DataStats = ({ cards = [], loading = false, isRefreshing = false }) => {
  return (
    <div className="px-4">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 ${
          isRefreshing ? "opacity-70 pointer-events-none" : ""
        } transition-opacity duration-300`}
      >
        {loading
          ? // Skeleton Loading for Data Management Cards
            Array.from({ length: 5 }).map((_, index) => (
              <WidgetCardSkeleton key={index} />
            ))
          : cards.map((card, index) => (
              <WidgetCard
                key={index}
                title={card.title}
                value={card.value}
                icon={card.icon}
                trendIcon={card.trendIcon}
                trendText={card.trendText}
                iconBgColor={card.iconBgColor}
              />
            ))}
      </div>
    </div>
  );
};

export default DataStats;
