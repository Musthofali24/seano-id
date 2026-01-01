import { Modal } from "../../UI";

const ViewPermissionModal = ({ isOpen, onClose, permission }) => {
  if (!permission) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="View Permission Details" size="md">
      <div className="space-y-4">
        {/* Permission Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Permission Name
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
            {permission.name}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Description
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white min-h-[80px]">
            {permission.description || "No description"}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Created
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              {permission.created_at
                ? new Date(permission.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Unknown"}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Last Updated
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              {permission.updated_at
                ? new Date(permission.updated_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Unknown"}
            </div>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ViewPermissionModal;

