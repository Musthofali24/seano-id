import { MissionPlanner } from "../components/Widgets/Mission";

const Missions = ({ isSidebarOpen, darkMode }) => {
  return <MissionPlanner isSidebarOpen={isSidebarOpen} darkMode={darkMode} />;
};

export default Missions;
