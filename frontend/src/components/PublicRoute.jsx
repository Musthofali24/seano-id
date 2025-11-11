import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import LoadingWrapper from "./LoadingWrapper";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthContext();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingWrapper />;
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard/user" replace />;
  }

  // User not logged in, allow access to public route
  return children;
};

export default PublicRoute;
