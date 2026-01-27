import { useState, useEffect } from "react";
import { Modal } from "../../ui";

const EditPermissionModal = ({ isOpen, onClose, onSubmit, permission }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen && permission) {
      setFormData({
        name: permission.name || "",
        description: permission.description || "",
      });
    }
  }, [isOpen, permission]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    onClose();
  };

  if (!permission) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Permission" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Permission Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Permission Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter permission name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-fourth focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              placeholder="Enter permission description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-fourth focus:border-transparent resize-none"
            />
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
            Update Permission
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPermissionModal;

