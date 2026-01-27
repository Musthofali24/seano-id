import { FaExclamationTriangle } from "react-icons/fa";
import Modal from "./Modal";
import LoadingDots from "./LoadingDots";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // danger, warning, info
  isLoading = false,
}) => {
  const typeStyles = {
    danger: {
      icon: "text-red-500",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "text-yellow-500",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: "text-blue-500",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const currentStyle = typeStyles[type] || typeStyles.danger;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        {/* Icon */}
        <div
          className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${currentStyle.iconBg} mb-4`}
        >
          <FaExclamationTriangle className={`${currentStyle.icon} text-3xl`} />
        </div>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${currentStyle.button}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingDots size="sm" color="white" text="" />
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
