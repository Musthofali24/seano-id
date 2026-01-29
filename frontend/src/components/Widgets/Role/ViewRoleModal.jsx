import { Modal } from "../../ui";

const ViewRoleModal = ({ isOpen, onClose, role, permissionData = [] }) => {
  if (!role) return null;

  // Get role's permissions - handle both array and object formats
  const rolePermissions = Array.isArray(role.permissions)
    ? role.permissions
    : role.permissions
      ? [role.permissions]
      : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="View Role Details"
      size="lg"
    >
      <div className="space-y-4">
        {/* Role Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Role Name
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
            {role.name}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Description
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white min-h-[80px]">
            {role.description || "No description"}
          </div>
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Permissions ({rolePermissions.length})
          </label>
          <div className="border border-gray-300 dark:border-slate-600 rounded-xl p-3 space-y-2 bg-gray-50 dark:bg-gray-800/50 max-h-64 overflow-y-auto custom-scrollbar">
            {rolePermissions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No permissions assigned
              </p>
            ) : (
              rolePermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="p-2 rounded-lg bg-white dark:bg-gray-700/50"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {permission.name}
                  </div>
                  {permission.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {permission.description}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Created
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              {role.created_at
                ? new Date(role.created_at).toLocaleDateString("en-GB", {
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
              {role.updated_at
                ? new Date(role.updated_at).toLocaleDateString("en-GB", {
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
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ViewRoleModal;
