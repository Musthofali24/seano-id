import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionProvider } from "./contexts/PermissionProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import RegistrationRoute from "./components/RegistrationRoute";
import useVehicleData from "./hooks/useVehicleData";

// Layout Components
import { Header, Sidebar } from "./components/Layout";
import Content from "./ui/Content";
import Main from "./ui/Main";

// Pages
import Dashboard from "./pages/Dashboard";
import Tracking from "./pages/Tracking";
import Missions from "./pages/Missions";
import Data from "./pages/Data";
import Log from "./pages/Log";
import Settings from "./pages/Settings";
import Vehicle from "./pages/Vehicle";
import Alerts from "./pages/Alerts";
import Telemetry from "./pages/Telemetry";
import Sensor from "./pages/Sensor";
import SensorType from "./pages/SensorType";
import Notification from "./pages/Notification";
import User from "./pages/User";
import Role from "./pages/Role";
import Permission from "./pages/Permission";

// Auth Pages
import Login from "./pages/auth/Login";
import EmailRegistration from "./pages/auth/EmailRegistration";
import SetAccount from "./pages/auth/SetAccount";
import CheckEmailVerification from "./pages/auth/CheckEmailVerification";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Other
import Landing from "./pages/Landing";
import ErrorPage from "./components/Error/ErrorPage";
import Profile from "./pages/Profile";

function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const { vehicles } = useVehicleData();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      // Don't auto-select first vehicle anymore, let user choose
      // Only validate if selected vehicle still exists
      if (
        selectedVehicleId &&
        !vehicles.find((v) => v.id === selectedVehicleId)
      ) {
        // If selected vehicle no longer exists, reset to null
        setSelectedVehicleId(null);
      }
    } else if (vehicles && vehicles.length === 0) {
      // Reset when no vehicles (logout)
      setSelectedVehicleId(null);
      initializedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles]); // Only depend on vehicles, not selectedVehicleId

  // Get selected vehicle object from ID (always synced with vehicles array)
  const selectedVehicle = selectedVehicleId
    ? vehicles.find((v) => v.id === selectedVehicleId)
    : null;

  // Initialize sidebar state
  useEffect(() => {
    const savedSidebar = localStorage.getItem("sidebarOpen");
    if (savedSidebar !== null) {
      setIsSidebarOpen(savedSidebar === "true");
    } else {
      setIsSidebarOpen(window.innerWidth >= 768);
    }
  }, []);

  // Initialize dark mode
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode);
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarOpen", newState);
      return newState;
    });
  };

  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/email-registration",
    "/auth/set-account",
    "/auth/email-verification",
    "/verify-email",
  ];

  const protectedRoutes = [
    "/dashboard",
    "/tracking",
    "/missions",
    "/telemetry",
    "/data",
    "/profile",
    "/sensor",
    "/sensor-type",
    "/logs",
    "/settings",
    "/vehicle",
    "/alerts",
    "/notification",
    "/user",
    "/role",
    "/permission",
  ];

  const isPublicRoute = publicRoutes.includes(location.pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  // Handle 404 page separately without any layout
  if (location.pathname === "/404") {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black">
        <ErrorPage code={404} />
      </div>
    );
  }

  // Render public routes without layout
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/auth/login"
            element={
              <PublicRoute>
                <Login darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/email-registration"
            element={
              <PublicRoute>
                <EmailRegistration
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/set-account"
            element={
              <PublicRoute>
                <RegistrationRoute requiredStep="set-account">
                  <SetAccount
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                  />
                </RegistrationRoute>
              </PublicRoute>
            }
          />
          <Route
            path="/auth/email-verification"
            element={
              <PublicRoute>
                <RegistrationRoute requiredStep="email-verification">
                  <CheckEmailVerification
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                  />
                </RegistrationRoute>
              </PublicRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicRoute>
                <RegistrationRoute requiredStep="verify-email">
                  <VerifyEmail
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                  />
                </RegistrationRoute>
              </PublicRoute>
            }
          />
          {/* Catch-all route - redirect to /404 */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    );
  }

  // Render error page without layout for unknown routes
  if (!isProtectedRoute) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black">
        <ErrorPage
          code={404}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>
    );
  }

  // Render protected routes with layout
  return (
    <div className="font-openSans flex bg-white dark:bg-black">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          toggleSidebar={toggleSidebar}
        />
        <Main
          isSidebarOpen={isSidebarOpen}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={(vehicle) => {
            console.log("🚗 App.jsx - Setting selected vehicle:", vehicle);
            if (vehicle && vehicle.id) {
              setSelectedVehicleId(vehicle.id);
            } else if (vehicle) {
              // Handle case where vehicle might be just an ID
              setSelectedVehicleId(vehicle);
            }
          }}
          darkMode={darkMode}
        >
          <Content>
            <Routes>
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tracking"
                element={
                  <ProtectedRoute>
                    <Tracking
                      darkMode={darkMode}
                      selectedVehicle={selectedVehicle}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/missions"
                element={
                  <ProtectedRoute>
                    <Missions
                      darkMode={darkMode}
                      isSidebarOpen={isSidebarOpen}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/telemetry"
                element={
                  <ProtectedRoute>
                    <Telemetry
                      darkMode={darkMode}
                      isSidebarOpen={isSidebarOpen}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data"
                element={
                  <ProtectedRoute>
                    <Data darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sensor"
                element={
                  <ProtectedRoute>
                    <Sensor darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sensor-type"
                element={
                  <ProtectedRoute>
                    <SensorType darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/logs"
                element={
                  <ProtectedRoute>
                    <Log darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicle"
                element={
                  <ProtectedRoute>
                    <Vehicle darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <Alerts darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notification"
                element={
                  <ProtectedRoute>
                    <Notification darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <User darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/role"
                element={
                  <ProtectedRoute>
                    <Role darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/permission"
                element={
                  <ProtectedRoute>
                    <Permission darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              {/* Catch-all route - redirect to /404 */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Content>
        </Main>
      </div>
    </div>
  );
}

// Wrap with Router and AuthProvider
const AppWithRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <PermissionProvider>
        <App />
      </PermissionProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default AppWithRouter;
