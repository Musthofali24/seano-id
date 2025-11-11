import { useState } from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun, FaEye, FaEyeSlash } from "react-icons/fa6";
import SeanoLogo from "../../assets/logo_seano.png";
import { useAuthContext } from "../../hooks/useAuthContext";

export default function Login({ darkMode, toggleDarkMode }) {
  const { login } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Please fill in all fields.");
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
          : "Login failed. Please try again.";
      setMessage(errorMsg);
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

            {/* Message */}
            {message && (
              <p className="text-center text-red-500 mt-3">{message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded-xl mt-4 cursor-pointer hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

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
