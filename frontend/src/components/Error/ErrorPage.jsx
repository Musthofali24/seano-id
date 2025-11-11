import { ERROR_MESSAGES } from "../../constant";

const ErrorPage = ({ code = 404 }) => {
  const error = ERROR_MESSAGES[code] || ERROR_MESSAGES.default;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="grid lg:grid-cols-1 gap-12 items-center">
          <div className="text-center lg:text-left space-y-2">
            <div className="relative text-center">
              <div className="text-[12rem] lg:text-[16rem] font-black text-blue-600 dark:text-blue-400 leading-none select-none">
                {code}
              </div>
              <div className="absolute inset-0 text-[12rem] lg:text-[16rem] font-black text-blue-200 dark:text-blue-800 animate-pulse leading-none opacity-30">
                {code}
              </div>
            </div>
            <div className="space-y-4 text-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 dark:text-white">
                {error.title}
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                {error.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
