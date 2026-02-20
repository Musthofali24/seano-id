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
    xl: "w-[48rem] max-w-4xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className={`fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-out ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      style={{ zIndex: 99999 }}
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
            <h3
              id="modal-title"
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
