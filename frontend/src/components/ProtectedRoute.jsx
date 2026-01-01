import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { LoadingScreen } from "../components/UI";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
