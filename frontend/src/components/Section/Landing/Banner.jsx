import React from "react";
import { HiArrowRight } from "react-icons/hi";
import seanoBoat from "../../../assets/seanoBoat.webp";
import Gradient1 from "../../../assets/Gradient1.webp";

const Banner = () => {
  return (
    <div className="relative min-h-screen w-full from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="flex flex-col items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center justify-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 bg-transparent rounded-full border border-primary/30">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-200">
                NEW FEATURE : REAL-TIME MONITORING
              </span>
            </div>
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-center">
              <span className="text-white">Autonomous Ocean</span>{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Intelligence
              </span>
              <br />
              <span className="text-white">
                for{" "}
                <span className="bg-gradient-to-b from-red-600 via-red-500 to-white to-gray-200 bg-clip-text text-transparent font-extrabold">
                  Indonesia's
                </span>{" "}
                Future
              </span>
            </h1>
            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              SEANO enables real-time ocean monitoring and autonomous missions
              across Indonesian waters—supporting research, security, and
              national resilience.
            </p>
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#learn-more"
                className="group relative px-8 py-4 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] bg-left hover:bg-right text-white rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out inline-flex items-center gap-2 w-full sm:w-auto justify-center transform hover:scale-105"
              >
                Learn More
                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>

              <a
                href="#watch-demo"
                className="group px-8 py-4 bg-transparent border-2 border-gray-700 hover:border-primary text-white rounded-full font-semibold transition-all duration-300 ease-in-out inline-flex items-center gap-2 w-full sm:w-auto justify-center hover:shadow-lg"
              >
                Watch Demo
                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>
          <div className="flex-1 relative w-full mt-10">
            <div className="relative">
              {/* Boat Image */}
              <img
                src={seanoBoat}
                alt="SEANO Boat"
                className="relative z-10 w-full h-auto drop-shadow-2xl scale-125"
              />
            </div>
          </div>
        </div>
      </div>
      <img
        src={Gradient1}
        alt="Gradient Background"
        className="absolute inset-x-0 top-60 w-full h-full object-cover scale-130"
      />
      {/* Dark Gradient Overlay in Front of Boat (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/30 to-transparent z-20 pointer-events-none"></div>
    </div>
  );
};

export default Banner;
