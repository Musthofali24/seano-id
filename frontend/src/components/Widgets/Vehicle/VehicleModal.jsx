import { useState } from "react";
import { Modal } from "../../UI";
import { Dropdown } from "../";

const VehicleModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedPoint, setSelectedPoint] = useState("");

  const pointsOptions = [
    {
      id: "point1",
      name: "Waduk Jatigede",
      description: "Main monitoring point",
      image: "🏞️",
    },
    {
      id: "point2",
      name: "Waduk Cirata",
      description: "Secondary monitoring point",
      image: "🌊",
    },
    {
      id: "point3",
      name: "Waduk Saguling",
      description: "Patrol route checkpoint",
      image: "⛵",
    },
    {
      id: "point4",
      name: "Pantai Pangandaran",
      description: "Coastal monitoring area",
      image: "🏖️",
    },
    {
      id: "point5",
      name: "Pelabuhan Cirebon",
      description: "Port area surveillance",
      image: "🚢",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const vehicleData = {
      name: formData.get("name"),
      description: formData.get("description"),
      status: "offline", // Default status
      points_id: selectedPoint,
    };

    onSubmit(vehicleData);

    // Reset form
    e.target.reset();
    setSelectedPoint("");
  };

  const handleClose = () => {
    setSelectedPoint("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Vehicle"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Vehicle Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Vehicle Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Enter vehicle name"
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
              placeholder="Enter vehicle description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-fourth focus:border-transparent resize-none"
            />
          </div>

          {/* Points Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Points *
            </label>
            <Dropdown
              items={pointsOptions}
              selectedItem={selectedPoint}
              onItemChange={setSelectedPoint}
              placeholder="Select monitoring point"
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

          {/* Status (Disabled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Status
            </label>
            <input
              type="text"
              value="Offline"
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
            Add Vehicle
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleModal;
