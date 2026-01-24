import { FaMoon, FaSun, FaRegUser, FaRegBell, FaBell } from "react-icons/fa";
import { HiOutlineMenuAlt2, HiX } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import SeanoLogo from "../../../assets/logo_seano.webp";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../../hooks/useAuthContext";

const Header = ({ darkMode, toggleDarkMode, toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuthContext();
  const [time, setTime] = useState(new Date());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Get initials for avatar (same logic as Profile page)
  const getInitials = (username, email) => {
    if (username) {
      return username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const handleUserClick = () => {
    setIsUserMenuOpen((prev) => !prev);
    setIsNotificationsOpen(false);
  };

  const handleNotificationsClick = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Tutup menu kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsUserMenuOpen(false);
      setIsNotificationsOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 dark:bg-black dark:border-gray-700"
      style={{ zIndex: 10001 }}
    >
      <div className="px-2 py-2 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end gap-2">
            <a href="#" className="flex gap-2">
              <img src={SeanoLogo} className="w-8" alt="seano_logo" />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white hidden sm:block">
                SeaPortal
              </span>
            </a>
            <button
              className="inline-flex items-center p-1.5 ml-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 cursor-pointer transition-colors"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <HiX className="text-2xl" />
              ) : (
                <HiOutlineMenuAlt2 className="text-2xl" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-4 relative justify-between">
            {/* Tanggal & Waktu */}
            <div className="dark:text-white text-sm font-medium hidden md:flex md:items-center">
              {time.toLocaleTimeString("id-ID")} •{" "}
              {time.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-4">
              <button
                className="dark:bg-slate-50 dark:text-slate-700 rounded-full p-2 transition-all duration-300 cursor-pointer"
                onClick={toggleDarkMode}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>

              {/* Notifications */}
              <div ref={notificationsRef} className="relative">
                <button onClick={handleNotificationsClick}>
                  {isNotificationsOpen ? (
                    <FaBell className="mt-1 text-xl dark:text-white cursor-pointer duration-300" />
                  ) : (
                    <FaRegBell className="mt-1 text-xl dark:text-white cursor-pointer duration-300" />
                  )}
                </button>
                {isNotificationsOpen && (
                  <div
                    className="absolute right-0 top-12 mt-2 w-72 bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 transition-all duration-300"
                    style={{ zIndex: 10002 }}
                  >
                    <ul className="space-y-2">
                      <li className="text-center dark:text-white font-semibold px-2 py-1">
                        No new notifications
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  className="rounded-full transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={handleUserClick}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fourth to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user?.username, user?.email)}
                  </div>
                </button>
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2"
                    style={{ zIndex: 10002 }}
                  >
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                      <p className="text-sm font-semibold dark:text-white">
                        {user?.username || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>

                    <ul className="space-y-1">
                      <li>
                        <a
                          href="/profile"
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white font-medium rounded px-3 py-2 transition"
                        >
                          <FaRegUser />
                          <span>Profile</span>
                        </a>
                      </li>
                      <li className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded px-3 py-2 transition"
                        >
                          <FiLogOut />
                          <span>Logout</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
