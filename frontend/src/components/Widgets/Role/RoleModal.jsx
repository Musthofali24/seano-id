import { useState, useEffect } from "react";
import { Modal } from "../../ui";

const RoleModal = ({ isOpen, onClose, onSubmit, permissionData = [] }) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Reset selected permissions when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPermissions([]);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const roleData = {
      name: formData.get("name"),
      description: formData.get("description"),
      permissions: selectedPermissions, // Include selected permissions
    };

    onSubmit(roleData);

    // Reset form
    e.target.reset();
    setSelectedPermissions([]);
  };

  const handleClose = () => {
    setSelectedPermissions([]);
    onClose();
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === permissionData.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(permissionData.map((p) => p.id));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Role" size="xl">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          {/* Left Side - Form */}
        <div className="space-y-4">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Role Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Enter role name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-fourth focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Description
            </label>
            <textarea
              name="description"
                rows="6"
              placeholder="Enter role description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-fourth focus:border-transparent resize-none"
            />
            </div>
          </div>

          {/* Right Side - Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Permissions
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {selectedPermissions.length === permissionData.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="border border-gray-300 dark:border-slate-600 rounded-xl p-3 space-y-2 bg-gray-50 dark:bg-gray-800/50 h-[280px] overflow-y-auto">
              {permissionData.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No permissions available
                </p>
              ) : (
                permissionData.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {permission.name}
                      </div>
                      {permission.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {permission.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
            {selectedPermissions.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {selectedPermissions.length} permission(s) selected
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-white bg-red-600 border border-red-500 rounded-xl hover:bg-red-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-fourth text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Add Role
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal;
