import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa6";
import SeanoLogo from "../../assets/logo_seano.png";
import useAuth from "../../hooks/useAuth";

export default function EmailRegistration({ darkMode, toggleDarkMode }) {
  const [email, setEmail] = useState("");
  const { registerEmail, loading } = useAuth();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const result = await registerEmail(email);

    if (result.success) {
      setMessage(result.message);
      // Save email to localStorage for registration flow protection
      localStorage.setItem("registrationEmail", email);
      setTimeout(() => {
        navigate("/auth/email-verification", { state: { email } });
      }, 100);
    } else {
      setMessage(result.error);
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
            <img src={SeanoLogo} className="w-12" alt="logo" />
          </Link>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full text-lg text-gray-900 dark:text-white"
          >
            {darkMode ? <FaMoon /> : <FaSun />}
          </button>
        </div>

        {/* Form */}
        <div className="flex justify-center items-center flex-col h-full">
          <div className="w-full xl:w-3/5 max-w-lg text-center mb-8">
            <h1 className="text-5xl text-gray-900 dark:text-white font-semibold">
              Create Your Account!
            </h1>
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-2">
              Sign up with your email to monitor your{" "}
              <span className="text-blue-500 font-semibold">USV</span>.
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full xl:w-3/5 max-w-lg flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label className="text-black dark:text-white">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl py-2 px-3 border border-gray-700 text-black dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white py-2 rounded-xl mt-4 hover:bg-blue-700 transition ${
                loading && "opacity-70 cursor-not-allowed"
              }`}
            >
              {loading ? "Sending..." : "Register"}
            </button>

            {message && (
              <p className="text-center text-sm text-gray-700 dark:text-gray-300 mt-3">
                {message}
              </p>
            )}

            <p className="text-black dark:text-gray-400 text-sm text-center mt-4">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-blue-600">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
