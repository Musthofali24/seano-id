import useTitle from "../hooks/useTitle";
import Title from "../ui/Title";

const Log = () => {
  useTitle("Log");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <Title
          title="System Logs"
          subtitle="View system activities and operation logs"
        />
      </div>
      <div className="px-4">
        <p className="text-gray-500 dark:text-gray-400">
          System logs will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default Log;
