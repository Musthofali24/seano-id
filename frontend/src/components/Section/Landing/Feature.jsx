import { FaRegCompass, FaWifi, FaMicrochip } from "react-icons/fa6";
import Gradient1 from "../../../assets/Gradient1.webp";
import { GoArrowUpRight } from "react-icons/go";

const Feature = () => {
  const features = [
    {
      icon: <FaRegCompass className="w-6 h-6 text-white" />,
      title: "Autonomous Survey Intelligence",
      description:
        "SEANO performs fully autonomous marine missions with intelligent waypoint navigation, obstacle avoidance, and remote operational control for precise and efficient ocean surveys.",
    },
    {
      icon: <FaWifi className="w-6 h-6 text-white" />,
      title: "Real-Time Ocean Data Control",
      description:
        "Live telemetry powered by MQTT & WebSocket delivers instant sensor data visualization and direct vehicle control through an integrated web dashboard.",
    },
    {
      icon: <FaMicrochip className="w-6 h-6 text-white" />,
      title: "Multi-Sensor Scientific Payload",
      description:
        "Advanced oceanographic sensors including CTD, ADCP, GPS, IMU, and meteorological modules provide accurate, high-resolution marine data for research and analysis.",
    },
  ];

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden px-8 lg:px-0"
      id="about"
    >
      {/* Gradient Background for Glass Effect */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none z-0 opacity-50">
        <img
          src={Gradient1}
          alt="Gradient"
          className="w-full h-full object-contain blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-32 pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            <div className="border border-gray-700 flex-1 w-fit py-2 px-4 rounded-full bg-transparent backdrop-blur-sm">
              <h3 className="text-gray-400 text-sm font-semibold tracking-wider">
                TOP FEATURE
              </h3>
            </div>
            <h1 className="text-4xl md:text-6xl leading-tight font-semibold text-white">
              Unleashing SEANO's Intelligence Through Advanced Features
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
              SEANO is an autonomous surface vehicle platform designed for
              precision ocean observation and intelligent marine surveys.
              Equipped with advanced navigation, multi-sensor payloads, and
              real-time communication, SEANO transforms how marine data is
              collected, monitored, and controlled.
            </p>
            <button className="relative px-8 py-3 text-white rounded-full font-medium shadow-lg hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300 ease-in-out inline-block overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] bg-left hover:bg-right">
              Explore Capabilities
            </button>
          </div>

          {/* Right Cards */}
          <div className="flex-1 space-y-6 w-full">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition-colors">
                    {feature.icon}
                  </div>
                  <GoArrowUpRight
                    size={30}
                    className="text-gray-500 group-hover:text-white transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feature;
