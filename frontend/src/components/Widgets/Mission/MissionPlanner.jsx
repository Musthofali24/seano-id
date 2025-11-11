import { useState } from "react";
import useTitle from "../../../hooks/useTitle";
import MissionSidebar from "./MissionSidebar";
import MissionMap from "./MissionMap";
import MissionModals from "./MissionModals";
import MissionParameters from "./MissionParameters";

const MissionPlanner = ({ isSidebarOpen, darkMode }) => {
  useTitle("Missions");

  // Main mission state
  const [homeLocation, setHomeLocation] = useState(null);
  const [isSettingHome, setIsSettingHome] = useState(false);
  const [activeMission, setActiveMission] = useState(null);
  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [showLoadMissionModal, setShowLoadMissionModal] = useState(false);

  // Waypoints state
  const [waypoints, setWaypoints] = useState([]);
  const [generatedPaths, setGeneratedPaths] = useState([]);
  const [planningMode, setPlanningMode] = useState("path");
  const [hasGeneratedWaypoints, setHasGeneratedWaypoints] = useState(false);

  // Edit waypoints state
  const [isEditingWaypoints, setIsEditingWaypoints] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState(null);

  // FeatureGroup ref for programmatic layer management
  const [featureGroupRef, setFeatureGroupRef] = useState(null);

  // Mission Parameters state
  const [missionParams, setMissionParams] = useState({
    speed: 2.5,
    delay: 0,
    loiter: 10,
    radius: 2,
    action: "waypoint",
  });

  // Helper functions
  const getActualWaypointCount = (waypointsList) => {
    return waypointsList.filter((wp) => wp.type !== "zone").length;
  };

  const isPointInPolygon = (point, vertices) => {
    const x = point.lng,
      y = point.lat;
    let inside = false;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].lng,
        yi = vertices[i].lat;
      const xj = vertices[j].lng,
        yj = vertices[j].lat;

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Mission handlers
  const handleNewMission = () => {
    setShowNewMissionModal(true);
  };

  const handleLoadMission = () => {
    setShowLoadMissionModal(true);
  };

  const handleCreateMission = (missionData) => {
    setActiveMission({
      name: missionData.name,
      status: "Draft",
      waypoints: 0,
      description: missionData.description,
    });
    setShowNewMissionModal(false);
    resetMissionState();
  };

  const handleSelectMission = (mission) => {
    setActiveMission(mission);
    setShowLoadMissionModal(false);
    resetMissionState();
  };

  const resetMissionState = () => {
    setIsSettingHome(false);
    setHasGeneratedWaypoints(false);
    setWaypoints([]);
    setGeneratedPaths([]);
    if (featureGroupRef) {
      featureGroupRef.clearLayers();
    }
  };

  // Shared props for child components
  const sharedProps = {
    // State
    homeLocation,
    setHomeLocation,
    isSettingHome,
    setIsSettingHome,
    activeMission,
    setActiveMission,
    waypoints,
    setWaypoints,
    generatedPaths,
    setGeneratedPaths,
    planningMode,
    setPlanningMode,
    hasGeneratedWaypoints,
    setHasGeneratedWaypoints,
    isEditingWaypoints,
    setIsEditingWaypoints,
    editingWaypoint,
    setEditingWaypoint,
    featureGroupRef,
    setFeatureGroupRef,
    missionParams,
    setMissionParams,

    // Modals
    showNewMissionModal,
    setShowNewMissionModal,
    showLoadMissionModal,
    setShowLoadMissionModal,

    // Handlers
    handleNewMission,
    handleLoadMission,
    handleCreateMission,
    handleSelectMission,

    // Helper functions
    getActualWaypointCount,
    isPointInPolygon,

    // UI props
    isSidebarOpen,
    darkMode,
  };

  return (
    <div className="-mt-4 -mr-4">
      <MissionSidebar {...sharedProps} />

      <div className={`${isSidebarOpen ? "md:ml-68" : "ml-68"}`}>
        <MissionMap {...sharedProps} />
        <MissionParameters {...sharedProps} />
      </div>

      <MissionModals {...sharedProps} />
    </div>
  );
};

export default MissionPlanner;
