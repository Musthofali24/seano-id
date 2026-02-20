import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMoon,
  FaSun,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import SeanoLogo from "../../assets/logo_seano.webp";
import { useAuthContext } from "../../hooks/useAuthContext";
import { LoadingDots } from "../../components/ui";

export default function Login({ darkMode, toggleDarkMode }) {
  const { login } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: "", message: "" });

    if (!email || !password) {
      setAlert({
        show: true,
        type: "error",
        message: "Please enter both email and password.",
      });
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      // Ensure error is a string
      const errorMsg =
        typeof result.error === "string"
          ? result.error
          : "Login failed. Please check your credentials and try again.";
      setAlert({
        show: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  return (
    <div
      className={`min-h-screen grid grid-cols-1 bg-linear-to-br font-openSans ${
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
            className="p-3 rounded-full text-lg transition cursor-pointer text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {darkMode ? (
              <FaMoon aria-hidden="true" />
            ) : (
              <FaSun aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Form */}
        <main className="flex justify-center h-full flex-col items-center">
          <div className="w-full xl:w-3/5 max-w-lg text-center mb-8">
            <h1 className="text-5xl text-gray-900 dark:text-white font-semibold mb-4">
              Welcome Back
            </h1>
            <p className="font-medium text-gray-800 dark:text-gray-200 text-xl">
              Sign in to access your{" "}
              <span className="text-blue-700 dark:text-blue-400 font-semibold">
                USV
              </span>{" "}
              monitoring dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full xl:w-3/5 max-w-lg flex flex-col gap-4"
          >
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-black dark:text-white">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-xl py-2 px-3 border-gray-700 text-black dark:text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-black dark:text-white">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl py-2 px-3 border-gray-700 text-black dark:text-white bg-transparent pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-2 min-w-11 min-h-11 flex items-center justify-center hover:text-blue-600 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <FaEyeSlash aria-hidden="true" className="text-lg" />
                  ) : (
                    <FaEye aria-hidden="true" className="text-lg" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-xl mt-4 cursor-pointer hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingDots size="sm" color="white" text="" />
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Alert Box */}
            {alert.show && (
              <div
                role="alert"
                aria-live="assertive"
                className={`mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3 animate-fadeIn ${
                  alert.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300"
                }`}
              >
                <div className="mt-0.5">
                  {alert.type === "success" ? (
                    <FaCheckCircle className="text-xl" aria-hidden="true" />
                  ) : (
                    <FaExclamationCircle
                      className="text-xl"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            )}

            {/* Register Link */}
            <p className="text-center text-gray-800 dark:text-gray-200 mt-4">
              Don't have an account?{" "}
              <Link
                to="/auth/email-registration"
                className="text-blue-700 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              >
                Register here
              </Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
