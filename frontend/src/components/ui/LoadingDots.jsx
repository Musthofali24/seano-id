import React from "react";

const LoadingDots = ({ 
  size = "md", 
  color = "fourth",
  className = "",
  text = ""
}) => {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const colorClasses = {
    fourth: "bg-fourth",
    blue: "bg-blue-500",
    white: "bg-white",
    gray: "bg-gray-500",
  };

  const dotSize = sizeClasses[size] || sizeClasses.md;
  const dotColor = colorClasses[color] || colorClasses.fourth;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center gap-2">
        <div
          className={`${dotSize} ${dotColor} rounded-full`}
          style={{
            animation: "wave 1.4s ease-in-out infinite",
            animationDelay: "0s",
          }}
        />
        <div
          className={`${dotSize} ${dotColor} rounded-full`}
          style={{
            animation: "wave 1.4s ease-in-out infinite",
            animationDelay: "0.2s",
          }}
        />
        <div
          className={`${dotSize} ${dotColor} rounded-full`}
          style={{
            animation: "wave 1.4s ease-in-out infinite",
            animationDelay: "0.4s",
          }}
        />
        <div
          className={`${dotSize} ${dotColor} rounded-full`}
          style={{
            animation: "wave 1.4s ease-in-out infinite",
            animationDelay: "0.6s",
          }}
        />
      </div>
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );
};

export default LoadingDots;

