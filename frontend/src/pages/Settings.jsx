import React from "react";
import useTitle from "../hooks/useTitle";
import Title from "../ui/Title";

const Settings = () => {
  useTitle("Settings");

  return (
    <div>
      <Title
        title="Application Settings"
        subtitle="Configure system preferences and user settings"
      />
      <div className="p-4">
        <p className="text-gray-500 dark:text-gray-400">
          Settings configuration will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default Settings;
