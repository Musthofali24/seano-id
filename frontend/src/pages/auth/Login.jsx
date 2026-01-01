import { useState } from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import SeanoLogo from "../../assets/logo_seano.webp";
import { useAuthContext } from "../../hooks/useAuthContext";
import { LoadingDots } from "../../components/UI";

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
        message: "Please enter both email and password."
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
        message: errorMsg
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
              Welcome Back
            </h1>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-xl">
              Sign in to access your{" "}
              <span className="text-blue-500 font-semibold">USV</span>{" "}
              monitoring dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full xl:w-3/5 max-w-lg flex flex-col gap-4"
          >
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-xl py-2 px-3 border-gray-700 text-black dark:text-white bg-transparent"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl py-2 px-3 border-gray-700 text-black dark:text-white bg-transparent pr-10"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-xl mt-4 cursor-pointer hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 font-semibold"
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

            {/* Register Link */}
            <p className="text-center text-gray-700 dark:text-gray-300 mt-4">
              Don't have an account?{" "}
              <Link
                to="/auth/email-registration"
                className="text-blue-500 hover:underline"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
