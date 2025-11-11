import useTitle from "../hooks/useTitle";
import Title from "../ui/Title";

const Notification = () => {
  useTitle("Notification");
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <Title title="Alerts" subtitle="System alerts and notifications" />
      </div>
      <div className="px-4">
        <p className="text-gray-500 dark:text-gray-400">
          Alert content will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default Notification;
