import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaMoon,
  FaSun,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import SeanoLogo from "../../assets/logo_seano.webp";
import useAuth from "../../hooks/useAuth";
import { LoadingDots } from "../../components/ui";

export default function EmailRegistration({ darkMode, toggleDarkMode }) {
  const [email, setEmail] = useState("");
  const { registerEmail, loading } = useAuth();
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: "", message: "" });

    // Email validation
    if (!email || email.trim() === "") {
      setAlert({
        show: true,
        type: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlert({
        show: true,
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    const result = await registerEmail(email);

    if (result.success) {
      setAlert({
        show: true,
        type: "success",
        message:
          result.message || "Verification email sent! Please check your inbox.",
      });
      // Save email to localStorage for registration flow protection
      localStorage.setItem("registrationEmail", email);
      setTimeout(() => {
        navigate("/auth/email-verification", { state: { email } });
      }, 1500);
    } else {
      setAlert({
        show: true,
        type: "error",
        message: result.error || "Failed to register. Please try again.",
      });
    }
  };

  return (
    <div
      className={`min-h-screen grid grid-cols-1 bg-gradient-to-br font-openSans ${
        darkMode ? "bg-black" : "bg-white"
      }`}
    >
      <div className="w-full p-10 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link to="/" aria-label="Go to homepage">
            <img
              src={SeanoLogo}
              className="w-12"
              alt="SEANO Logo"
              width="48"
              height="48"
              loading="eager"
            />
          </Link>
          <button
            onClick={toggleDarkMode}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            className="p-3 rounded-full text-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {darkMode ? (
              <FaMoon aria-hidden="true" />
            ) : (
              <FaSun aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Form */}
        <main className="flex justify-center items-center flex-col h-full">
          <div className="w-full xl:w-3/5 max-w-lg text-center mb-8">
            <h1 className="text-5xl text-gray-900 dark:text-white font-semibold">
              Create Your Account!
            </h1>
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mt-2">
              Sign up with your email to monitor your{" "}
              <span className="text-blue-700 dark:text-blue-400 font-semibold">
                USV
              </span>
              .
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full xl:w-3/5 max-w-lg flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="registration-email"
                className="text-black dark:text-white"
              >
                Email
              </label>
              <input
                id="registration-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Enter your email address"
                className="w-full rounded-xl py-2 px-3 border border-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-label="Register with email"
              className={`bg-blue-600 text-white py-3 rounded-xl mt-4 hover:bg-blue-700 transition-all duration-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading && "opacity-70 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingDots size="sm" color="white" />
                </span>
              ) : (
                "Register"
              )}
            </button>

            {/* Alert Box */}
            {alert.show && (
              <div
                role="alert"
                aria-live="polite"
                className={`mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3 animate-fadeIn ${
                  alert.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300"
                    : alert.type === "error"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300"
                }`}
              >
                <div className="mt-0.5">
                  {alert.type === "success" ? (
                    <FaCheckCircle className="text-xl" aria-hidden="true" />
                  ) : alert.type === "error" ? (
                    <FaExclamationCircle
                      className="text-xl"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaInfoCircle className="text-xl" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            )}

            <p className="text-gray-800 dark:text-gray-200 text-sm text-center mt-6">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-blue-700 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              >
                Login
              </Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
