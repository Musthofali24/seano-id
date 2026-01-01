import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../../../hooks/useAuthContext";

const LinkItem = ({
  href,
  icon: Icon,
  text,
  badge,
  isSidebarOpen,
  size,
  type,
  action,
}) => {
  const { logout } = useAuthContext();

  // Handle button action (for logout)
  const handleClick = () => {
    if (type === "button" && action === "logout") {
      logout();
    }
  };

  if (type === "button") {
    // Special styling for logout button
    const isLogout = action === "logout";
    return (
      <li>
        <div
          onClick={handleClick}
          className={`flex items-center p-2 rounded-lg gap-2 transition-colors duration-200 cursor-pointer
          ${!isSidebarOpen ? "justify-center" : ""}
          ${
            isLogout
              ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Icon size={size} />
          <span className={`me-3 ${isSidebarOpen ? "flex-1" : "hidden"}`}>
            {text}
          </span>
        </div>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={href}
        className={({ isActive }) =>
          `flex items-center p-2 rounded-lg gap-2 transition-colors duration-200
          ${!isSidebarOpen ? "justify-center" : ""}
          ${
            isActive
              ? "bg-blue-600 text-white dark:bg-blue-500"
              : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          }`
        }
      >
        <Icon size={size} />
        <span className={`me-3 ${isSidebarOpen ? "flex-1" : "hidden"}`}>
          {text}
        </span>
        {badge && (
          <span
            className={`inline-flex items-center justify-center px-2 ms-3 text-sm font-medium rounded-full ${badge.color} ${badge.darkColor}`}
          >
            {badge.text}
          </span>
        )}
      </NavLink>
    </li>
  );
};

export default LinkItem;
