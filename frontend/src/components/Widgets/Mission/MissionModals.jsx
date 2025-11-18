const MissionModals = ({
  showNewMissionModal,
  setShowNewMissionModal,
  showLoadMissionModal,
  setShowLoadMissionModal,
  handleCreateMission,
  handleSelectMission,
}) => {
  return (
    <>
      {/* New Mission Modal */}
      {showNewMissionModal && (
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-xs bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 10003 }}
        >
          <div className="bg-white dark:bg-secondary rounded-2xl p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Create New Mission
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleCreateMission({
                  name: formData.get("name"),
                  description: formData.get("description"),
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mission Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter mission name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#018190] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Enter mission description"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#018190] focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewMissionModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#018190] text-white rounded-xl hover:bg-[#016b78] transition-colors"
                >
                  Create Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Load Mission Modal */}
      {showLoadMissionModal && (
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-xs bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 10003 }}
        >
          <div className="bg-white dark:bg-secondary rounded-2xl p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Load Mission
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              {[
                {
                  id: 1,
                  name: "Mission Jatigede 1",
                  status: "Draft",
                  waypoints: 3,
                  lastModified: "2025-10-11",
                },
                {
                  id: 2,
                  name: "Mission Cirata Survey",
                  status: "Draft",
                  waypoints: 5,
                  lastModified: "2025-10-10",
                },
                {
                  id: 3,
                  name: "Mission Patrol Route A",
                  status: "Draft",
                  waypoints: 8,
                  lastModified: "2025-10-09",
                },
              ].map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => handleSelectMission(mission)}
                  className="p-3 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {mission.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {mission.waypoints} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {mission.lastModified}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      {mission.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowLoadMissionModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MissionModals;
