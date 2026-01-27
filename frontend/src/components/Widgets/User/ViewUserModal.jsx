import { Modal } from "../../ui";

const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const userData = user.originalUser || user;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="View User Details" size="md">
      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Username
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
            {userData.username || "Not set"}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Email
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
            {userData.email || "No email"}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Status
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                userData.is_verified
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                  : "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30"
              }`}
            >
              {userData.is_verified ? "Verified" : "Pending"}
            </span>
          </div>
        </div>

        {/* Role */}
        {userData.role && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Role
            </label>
            <div className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
              {userData.role.name || "No role"}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Created
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              {userData.created_at
                ? new Date(userData.created_at).toLocaleDateString("en-GB", {
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
              {userData.updated_at
                ? new Date(userData.updated_at).toLocaleDateString("en-GB", {
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

export default ViewUserModal;

