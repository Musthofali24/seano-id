import React, { useState } from "react";
import useTitle from "../hooks/useTitle";
import { Title } from "../components/ui";
import {
  EnergyConsumptionTrends,
  MissionSuccessRate,
  MissionLogs,
  MissionStats,
  MissionTable,
} from "../components/Widgets/Mission";
import useVehicleData from "../hooks/useVehicleData";

const Mission = () => {
  useTitle("Mission List");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { vehicles } = useVehicleData();

  return (
    <div className="p-6 space-y-6">
      {/* Header - filter dipindah ke panel di Mission Logs */}
      <div>
        <Title title="Missions" subtitle="Mission monitoring and analytics" />
      </div>

      {/* Mission Stats Widget */}
      <MissionStats />

      {/* Top Section - Two Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnergyConsumptionTrends />
        <MissionSuccessRate />
      </div>

      {/* Bottom Section - Mission Logs */}
      <div className="">
        <MissionLogs
          vehicles={vehicles || []}
          selectedVessel={selectedVessel}
          startDate={startDate}
          endDate={endDate}
          onVesselChange={setSelectedVessel}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Mission Table - Detail View */}
      <div className="">
        <MissionTable />
      </div>
    </div>
  );
};

export default Mission;
