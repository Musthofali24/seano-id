import { Navigate, useLocation } from "react-router-dom";

const RegistrationRoute = ({ children, requiredStep }) => {
  const location = useLocation();

  // Check if user has registration state (email from previous step)
  const registrationEmail =
    location.state?.email || localStorage.getItem("registrationEmail");
  const verificationToken =
    location.state?.token || new URLSearchParams(location.search).get("token");

  // Define which step requires what
  const stepRequirements = {
    "email-verification": registrationEmail, // Requires email from EmailRegistration
    "verify-email": verificationToken, // Requires token from email link
    "set-account": verificationToken, // Requires token from verify-email
  };

  // Check if user meets requirements for this step
  const hasRequiredData = stepRequirements[requiredStep];

  // If no required data, redirect to start of registration flow
  if (!hasRequiredData) {
    return <Navigate to="/auth/email-registration" replace />;
  }

  // User has required data, allow access
  return children;
};

export default RegistrationRoute;
