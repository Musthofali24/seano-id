const Title = ({ title, subtitle, children }) => {
  if (children) {
    return (
      <h2 className="font-bold text-gray-700 text-2xl dark:text-gray-400">
        {children}
      </h2>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-black text-3xl font-bold dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <h2 className="text-gray-600 dark:text-gray-400">{subtitle}</h2>
        )}
      </div>
    </div>
  );
};

export default Title;
