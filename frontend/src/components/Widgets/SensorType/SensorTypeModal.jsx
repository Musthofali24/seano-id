import { Modal } from "../../UI";

const SensorTypeModal = ({ isOpen, onClose, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const sensorTypeData = {
      name: formData.get("name"),
      description: formData.get("description"),
      is_active: true, // Default active status
    };

    onSubmit(sensorTypeData);

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
      title="Add New Sensor Type"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Sensor Type Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Sensor Type Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Enter sensor type name"
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
              rows="3"
              placeholder="Enter sensor type description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-fourth focus:border-transparent resize-none"
            />
          </div>

          {/* Active Status (Disabled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Status
            </label>
            <input
              type="text"
              value="Active"
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-transparent text-gray-400 cursor-not-allowed"
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
            Add Sensor Type
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SensorTypeModal;
