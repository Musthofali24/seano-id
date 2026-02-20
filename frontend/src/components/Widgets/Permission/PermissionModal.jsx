import { Modal } from "../../ui";

const PermissionModal = ({ isOpen, onClose, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const permissionData = {
      name: formData.get("name"),
      description: formData.get("description"),
    };

    onSubmit(permissionData);

    // Reset form
    e.target.reset();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Permission"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Permission Name */}
          <div>
            <label
              htmlFor="permission-name"
              className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
            >
              Permission Name *
            </label>
            <input
              id="permission-name"
              type="text"
              name="name"
              required
              placeholder="Enter permission name (e.g. users.read, posts.create)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-fourth focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="permission-description"
              className="block text-sm font-medium text-gray-700 dark:text-white mb-1"
            >
              Description
            </label>
            <textarea
              id="permission-description"
              name="description"
              rows="3"
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
            Add Permission
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PermissionModal;
