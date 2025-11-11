import { useState, useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  size = "md",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10); // Small delay to trigger animation
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300); // Wait for animation to complete
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: "w-80 max-w-sm",
    md: "w-96 max-w-md",
    lg: "w-[32rem] max-w-lg",
    xl: "w-[40rem] max-w-xl",
  };

  return (
    <div
      className={`fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-out ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      style={{ zIndex: 10003 }}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-black border-2 border-gray-300 dark:border-slate-600 rounded-2xl p-6 ${
          sizeClasses[size]
        } mx-4 shadow-2xl ${className} transition-all duration-300 ease-out transform ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Modal Content */}
        <div className="text-gray-900 dark:text-white">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
