import React from "react";
import useTitle from "../hooks/useTitle";
import Title from "../ui/Title";

const Settings = () => {
  useTitle("Settings");

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <Title
          title="Settings"
          subtitle="Configure system preferences"
        />
      </div>
    </div>
  );
};

export default Settings;
