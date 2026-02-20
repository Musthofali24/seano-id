import { lazy, Suspense } from "react";
import {
  WidgetCard,
  VehicleDropdown,
  ViewMap,
  RecentMissions,
  VehicleQuickView,
  LatestAlerts,
} from "../components/Widgets";
import useTitle from "../hooks/useTitle";
import useVehicleData from "../hooks/useVehicleData";
import useMissionData from "../hooks/useMissionData";
import useNotificationData from "../hooks/useNotificationData";
import { Title } from "../components/ui";
import { WidgetCardSkeleton } from "../components/Skeleton";
import useLoadingTimeout from "../hooks/useLoadingTimeout";
import { getOverviewCardsData } from "../constant";

// Lazy load komponen berat (Maps & Charts)
const OverviewMap = lazy(
  () => import("../components/Widgets/Dashboard/OverviewMap"),
);
const MissionAnalytics = lazy(
  () => import("../components/Widgets/Dashboard/MissionAnalytics"),
);

function Dashboard({ darkMode }) {
  useTitle("Dashboard");

  // Data hooks
  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    loading: vehicleLoading,
  } = useVehicleData();
  const { missionData: missions, loading: missionLoading } = useMissionData();
  const { notifications: alerts, loading: alertLoading } =
    useNotificationData();

  // Combine all loading states
  const loading = vehicleLoading || missionLoading || alertLoading;

  // Use loading timeout to prevent infinite skeleton loading
  const { loading: timeoutLoading } = useLoadingTimeout(loading, 5000);

  // Show skeleton only if still loading and within timeout, and no data yet
  const shouldShowSkeleton = timeoutLoading && loading && vehicles.length === 0;

  // Get overview cards data
  const overviewData = getOverviewCardsData(vehicles, missions, alerts);

  return (
    <div className="p-4">
      {/* Header */}
      <Title
        title="Dashboard"
        subtitle="Real-time monitoring and control of unmanned surface vehicles"
      />

      {/* Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pb-4">
        {shouldShowSkeleton
          ? // Skeleton Loading with timeout
            Array.from({ length: 5 }).map((_, idx) => (
              <WidgetCardSkeleton key={idx} />
            ))
          : overviewData.map((item, idx) => <WidgetCard key={idx} {...item} />)}
      </div>

      {/* Vehicle and Map Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VehicleQuickView
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          setSelectedVehicleId={setSelectedVehicleId}
        />
        <Suspense
          fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <OverviewMap
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            darkMode={darkMode}
          />
        </Suspense>
      </div>

      {/* Mission Analytic and Mission Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
        <RecentMissions />
        <Suspense
          fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <MissionAnalytics />
        </Suspense>
      </div>

      {/* Latest Alerts */}
      <div className="grid grid-cols-1 gap-4 my-4">
        <LatestAlerts />
      </div>

      {/* Realtime MBES 3D Waterfall (Testing)
      <div className="grid grid-cols-1 gap-4 my-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <RealtimeMBES />
        </div>
      </div> */}
    </div>
  );
}

export default Dashboard;
