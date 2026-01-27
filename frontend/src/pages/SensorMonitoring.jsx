import React from "react";
import useTitle from "../hooks/useTitle";
import { Title } from "../components/ui";

const SensorMonitoring = () => {
  useTitle("Sensor");

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <Title title="Sensor" subtitle="Monitoring USV Sensor" />
      </div>
    </div>
  );
};

export default SensorMonitoring;
