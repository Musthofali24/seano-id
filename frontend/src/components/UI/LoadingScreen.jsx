import React from "react";
import LoadingDots from "./LoadingDots";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
      <LoadingDots size="lg" />
    </div>
  );
};

export default LoadingScreen;

