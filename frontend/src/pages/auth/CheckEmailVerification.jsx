import SeanoLogo from "../../assets/logo_seano.png";
import { Link } from "react-router-dom";
import { FaEnvelope, FaMoon, FaSun } from "react-icons/fa6";

export default function CheckEmailVerification({ darkMode, toggleDarkMode }) {
  return (
    <div
      className={`min-h-screen grid grid-cols-1 bg-gradient-to-br font-openSans ${
        darkMode ? "bg-black" : "bg-white"
      }`}
    >
      <div className="w-full p-10 flex flex-col">
        {/* Header Auth */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              <Link
                to="/landing"
                className="text-gray-900 font-semibold dark:text-white"
              >
                <img src={SeanoLogo} className="w-12" alt="Seano Logo" />
              </Link>
            </h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full text-lg transition cursor-pointer text-gray-900 dark:text-white"
          >
            {darkMode ? <FaMoon /> : <FaSun />}
          </button>
        </div>
        {/* End Header Auth */}

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-full mb-2">
              <FaEnvelope
                className="text-blue-500 dark:text-blue-300"
                size={48}
              />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              Check Your Email!
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
              We have sent a verification link to your email address.
              <br />
              Please check your inbox and follow the instructions to verify your
              account.
              <br />
              If you don't see the email, please check your spam or junk folder.
            </p>
            <button className="cursor-pointer mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition">
              Resend Email
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Didn't receive the email?{" "}
              <span className="font-semibold cursor-pointer text-blue-500">
                Resend
              </span>
            </p>
          </div>
        </div>
        {/* End Main Content */}
      </div>
    </div>
  );
}
