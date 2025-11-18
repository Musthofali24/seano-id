import React from "react";
import { dashboardLink, menuGroups, linksbottom } from "../../../constant";
import LinkItem from "./LinkItem";
import MenuGroup from "./MenuGroup";

const Sidebar = ({ isSidebarOpen }) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen pt-18 bg-white border-r border-gray-200 dark:bg-black dark:border-gray-700 transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0 w-64" : "w-16"
      }`}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col relative">
        {/* Scrollable Content Area */}
        <div
          className="flex-1 px-3 pt-2 overflow-y-auto scrollbar-hide"
          style={{ paddingBottom: "120px" }}
        >
          {/* Dashboard - Root Level */}
          <div className="mb-6">
            <ul className="space-y-2 font-semibold">
              <LinkItem isSidebarOpen={isSidebarOpen} {...dashboardLink} />
            </ul>
          </div>

          {/* Menu Groups */}
          <div className="space-y-1 font-semibold">
            {menuGroups.map((group, index) => (
              <MenuGroup
                key={index}
                title={group.title}
                items={group.items}
                isSidebarOpen={isSidebarOpen}
              />
            ))}
          </div>
        </div>

        {/* Fixed Bottom Menu */}
        <div
          className={`absolute left-0 bottom-0 w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-black z-40 text-gray-700 dark:text-white ${
            isSidebarOpen ? "p-4" : "py-4 px-2"
          }`}
        >
          <ul className="space-y-2 font-semibold">
            {linksbottom.map((Link, index) => (
              <LinkItem isSidebarOpen={isSidebarOpen} key={index} {...Link} />
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
