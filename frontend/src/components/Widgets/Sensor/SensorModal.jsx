import { useState } from "react";
import { Modal } from "../../UI";
import { Dropdown } from "../";

const SensorModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedSensorType, setSelectedSensorType] = useState("");

  // Sensor types data
  const sensorTypeOptions = [
    {
      id: "hidrografi",
      name: "Hidrografi Sensor",
      description: "Measures water level and flow",
      image: "�",
    },
    {
      id: "oseanografi",
      name: "Oseanografi Sensor",
      description: "Measures ocean parameters",
      image: "🌀",
    },
    {
      id: "pressure",
      name: "Pressure Sensor",
      description: "Measures atmospheric pressure",
      image: "📊",
    },
    {
      id: "ph",
      name: "pH Sensor",
      description: "Measures water pH levels",
      image: "🧪",
    },
    {
      id: "turbidity",
      name: "Turbidity Sensor",
      description: "Measures water clarity",
      image: "💧",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const sensorData = {
      name: formData.get("name"),
      sensor_type_id: selectedSensorType,
      description: formData.get("description"),
      is_active: true, // Default active status
    };

    onSubmit(sensorData);

    // Reset form
    e.target.reset();
    setSelectedSensorType("");
  };

  const handleClose = () => {
    setSelectedSensorType("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Sensor"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Sensor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Sensor Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Enter sensor name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-fourth focus:border-transparent"
            />
          </div>

          {/* Sensor Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Sensor Type *
            </label>
            <Dropdown
              items={sensorTypeOptions}
              selectedItem={selectedSensorType}
              onItemChange={setSelectedSensorType}
              placeholder="Select sensor type"
              className="w-full"
              renderSelectedItem={(item) => (
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.image}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                </div>
              )}
              renderItem={(item, isSelected) => (
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.image}</span>
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-white font-medium">
                      {item.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {item.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-blue-600 dark:text-white">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              )}
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
              placeholder="Enter sensor description"
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
            Add Sensor
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SensorModal;
