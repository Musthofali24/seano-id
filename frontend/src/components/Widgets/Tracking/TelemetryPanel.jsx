import React, { useState, useEffect, useMemo } from "react";
import { AttitudeIndicator, HeadingIndicator } from "react-flight-indicators";
import { useLogData } from "../../../hooks/useLogData";

const TelemetryPanel = React.memo(({ selectedVehicle = null }) => {
  const { vehicleLogs, ws } = useLogData(); // Get vehicle logs from WebSocket
  const [loading, setLoading] = useState(true);
  const [showTimeout, setShowTimeout] = useState(false);

  // Find latest vehicle log for selected vehicle
  const vehicleLog = useMemo(() => {
    if (!selectedVehicle?.id || vehicleLogs.length === 0) return null;

    // Filter by vehicle ID and get the latest (first in array, newest first)
    const filtered = vehicleLogs.filter(
      (log) => (log.vehicle?.id || log.vehicle_id) == selectedVehicle.id
    );

    const latest = filtered.length > 0 ? filtered[0] : null;

    return latest;
  }, [vehicleLogs, selectedVehicle]);

  // Set loading to false after initial load
  useEffect(() => {
    if (vehicleLogs.length > 0 || !selectedVehicle?.id) {
      setLoading(false);
    }
  }, [vehicleLogs, selectedVehicle]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setShowTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && !showTimeout) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading telemetry data...
        </div>
      </div>
    );
  }

  // Get values from vehicleLog
  const roll = vehicleLog?.roll || 0;
  const pitch = vehicleLog?.pitch || 0;
  const heading = vehicleLog?.heading || vehicleLog?.yaw || 0;

  return (
    <div className="h-full p-6 flex flex-col items-center justify-center">
      {/* Flight Indicators - Vertical Layout */}
      <div className="flex flex-col items-center gap-6">
        {/* Attitude Indicator */}
        <div className="flex justify-center">
          <AttitudeIndicator
            size={300}
            roll={roll}
            pitch={pitch}
            showBox={false}
          />
        </div>

        {/* Heading Indicator */}
        <div className="flex justify-center">
          <HeadingIndicator size={300} heading={heading} showBox={false} />
        </div>
      </div>
    </div>
  );
});

export default TelemetryPanel;
