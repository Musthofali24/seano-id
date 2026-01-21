import useTitle from "../hooks/useTitle";
import Title from "../ui/Title";

const Control = () => {
  useTitle("Control");
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <Title title="Control" subtitle="System Controls" />
      </div>
      <div className="px-4">
        <p className="text-gray-500 dark:text-gray-400">
          Control content will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default Control;
