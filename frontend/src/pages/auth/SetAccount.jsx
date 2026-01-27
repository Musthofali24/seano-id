import SeanoLogo from "../../assets/logo_seano.webp";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaMoon, FaSun, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { LoadingDots } from "../../components/ui";

export default function SetAccount({ darkMode, toggleDarkMode }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { setCredentials, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: "", message: "" });

    if (!username || !password || !confirm) {
      setAlert({
        show: true,
        type: "error",
        message: "Please fill in all fields."
      });
      return;
    }

    if (username.length < 3) {
      setAlert({
        show: true,
        type: "error",
        message: "Username must be at least 3 characters long."
      });
      return;
    }

    if (password.length < 6) {
      setAlert({
        show: true,
        type: "error",
        message: "Password must be at least 6 characters long."
      });
      return;
    }

    if (password !== confirm) {
      setAlert({
        show: true,
        type: "error",
        message: "Passwords do not match. Please re-enter your password."
      });
      return;
    }

    const result = await setCredentials(token, username, password);

    if (result.success) {
      setAlert({
        show: true,
        type: "success",
        message: result.message || "Account created successfully! Redirecting to login..."
      });
      // Clear registration data from localStorage
      localStorage.removeItem("registrationEmail");
      setTimeout(() => navigate("/auth/login"), 2000);
    } else {
      setAlert({
        show: true,
        type: "error",
        message: result.error || "Failed to create account. Please try again."
      });
    }
  };

  return (
    <div
      className={`min-h-screen grid grid-cols-1 
        bg-gradient-to-br font-openSans
        ${darkMode ? "bg-black" : "bg-white"}`}
    >
      <div className="w-full p-10 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link to="/">
            <img src={SeanoLogo} className="w-12" alt="Seano Logo" />
          </Link>

          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full text-lg transition cursor-pointer text-gray-900 dark:text-white"
          >
            {darkMode ? <FaMoon /> : <FaSun />}
          </button>
        </div>

        {/* Form */}
        <div className="flex justify-center h-full flex-col items-center">
          <div className="w-full xl:w-3/5 max-w-lg text-center mb-8">
            <h1 className="text-5xl text-gray-900 dark:text-white font-semibold mb-4">
              Set Up Your Account
            </h1>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-xl">
              Create your username and secure password to start monitoring your{" "}
              <span className="text-blue-500 font-semibold">USV</span>.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full xl:w-3/5 max-w-lg flex flex-col gap-4"
          >
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded-xl py-2 px-3 border-gray-700 text-black dark:text-white"
                placeholder="Choose a unique username"
                minLength={3}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl py-2 px-3 border-gray-700 text-black dark:text-white pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full border rounded-xl py-2 px-3 border-gray-700 text-black dark:text-white pr-10"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-xl mt-4 cursor-pointer hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingDots size="sm" color="white"/>
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Alert Box */}
            {alert.show && (
              <div
                className={`mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3 animate-fadeIn ${
                  alert.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300"
                }`}
              >
                <div className="mt-0.5">
                  {alert.type === "success" ? (
                    <FaCheckCircle className="text-xl" />
                  ) : (
                    <FaExclamationCircle className="text-xl" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
