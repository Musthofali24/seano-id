import React from "react";
import useTitle from "../hooks/useTitle";
import Title from "../ui/Title";

const Settings = () => {
  useTitle("Settings");

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <Title
          title="Application Settings"
          subtitle="Configure system preferences and user settings"
        />
      </div>
    </div>
  );
};

export default Settings;
