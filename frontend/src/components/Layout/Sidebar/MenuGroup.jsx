import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import LinkItem from "./LinkItem";

const MenuGroup = ({ title, items, isSidebarOpen }) => {
  // Load initial state from localStorage, default to true (expanded)
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(`menuGroup_${title}_expanded`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      `menuGroup_${title}_expanded`,
      JSON.stringify(isExpanded)
    );
  }, [isExpanded, title]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-3">
      {/* Group Title - Only show when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="px-3 py-2 mb-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 flex items-center justify-between"
          onClick={toggleExpanded}
        >
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
          <div className="text-gray-400 dark:text-gray-500">
            {isExpanded ? (
              <FaChevronDown className="w-3 h-3" />
            ) : (
              <FaChevronRight className="w-3 h-3" />
            )}
          </div>
        </div>
      )}

      {/* Group Items - Collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? isExpanded
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0"
            : ""
        }`}
      >
        <ul
          className={`space-y-1 ${
            !isSidebarOpen
              ? "border-t border-gray-200 dark:border-gray-700 pt-3 mt-3"
              : ""
          }`}
        >
          {items.map((item, index) => (
            <LinkItem key={index} isSidebarOpen={isSidebarOpen} {...item} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MenuGroup;
