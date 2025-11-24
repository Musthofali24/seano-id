import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Gradient1 from "../../../assets/Gradient1.webp";

const timelineData = [
  {
    title: "Hull Design & Fabrication",
    date: "Months 1–8 | Phase 1",
    focus: "Structural Foundation",
    description:
      "SEANO begins with the design and fabrication of a stable catamaran hull optimized for Indonesian marine conditions.",
    outputs: [
      "3D CAD Hull Model (Catamaran Design)",
      "CFD Simulation & Hydrodynamic Testing",
      "Corrosion-Resistant Composite Prototype",
    ],
    targets: [
      "Drag Coefficient < 0.05 @ 5 knots",
      "Stable dynamic performance",
    ],
  },
  {
    title: "Data Acquisition System Development",
    date: "Months 6–12 | Phase 1",
    focus: "Sensor Integration & MVP System",
    description:
      "Development of an integrated data acquisition system for oceanographic measurements.",
    outputs: [
      "CTD, ADCP & Meteorological Sensor Integration",
      "PCB Design & Data Logger System",
      "Calibration & Functional Testing",
    ],
    targets: [
      "CTD Accuracy ±0.01 mS/cm",
      "Power Consumption < 15W",
      "Endurance 3 days continuous operation",
    ],
  },
  {
    title: "Controlled Environment Testing",
    date: "Months 10–12 | Phase 1",
    focus: "Prototype Validation in Lake/Reservoir",
    description:
      "Testing SEANO prototype in semi-real conditions for stability and system reliability.",
    outputs: [
      "Stability & Buoyancy Testing",
      "Waypoint Autonomous Tracking",
      "Continuous Data Logging (72 hours)",
    ],
    targets: [
      "Hull Inclination < 15°",
      "Navigation Deviation < 3m",
      "Packet Loss < 5%",
    ],
  },
  {
    title: "Full System Assembly & Integration",
    date: "Months 13–16 | Phase 2",
    focus: "System Unification",
    description:
      "Mechanical, electrical, propulsion, and communication systems integrated into one operational prototype.",
    outputs: [
      "Fully Assembled Prototype",
      "Waterproof & System Validation",
      "Wiring & Troubleshooting Manual",
    ],
    targets: ["Waterproof Test 24h @ 1m", "Communication Latency < 2s (LoRa)"],
  },
  {
    title: "IoT & Web Dashboard Development",
    date: "Months 13–22 | Phase 2",
    focus: "Real-Time Monitoring Platform",
    description:
      "Development of SEANO's web-based real-time monitoring and control dashboard.",
    outputs: [
      "IoT Architecture & Database Design",
      "Live Web Dashboard",
      "Backend & Frontend System Integration",
    ],
    targets: [
      "System Uptime 99.9%",
      "Dashboard Load < 2s",
      "User Satisfaction ≥ 4/5",
    ],
  },
  {
    title: "Open Sea Operational Testing",
    date: "Months 17–22 | Phase 2",
    focus: "Real Environment Validation",
    description: "Full operational testing in open sea environments.",
    outputs: [
      "Autonomous Navigation Test",
      "Sensor Data Comparison with BMKG",
      "Reliability & Endurance Analysis",
    ],
    targets: [
      "Hull Stability < 20° (4m waves)",
      "Navigation Deviation < 5m",
      "Autonomous Operation 7 days",
    ],
  },
];

const TimelineCard = ({ item, index, progress }) => {
  // Calculate trigger points based on index
  // Total 6 items. Range 0 to 1.
  // We want the item to start appearing slightly before the line reaches it.
  const start = index / timelineData.length;
  const end = start + 0.1; // Animation duration in terms of scroll progress

  const opacity = useTransform(progress, [start, end], [0, 1]);
  const scale = useTransform(progress, [start, end], [0.5, 1]);
  const x = useTransform(
    progress,
    [start, end],
    [index % 2 === 0 ? -50 : 50, 0]
  );

  return (
    <div
      className={`flex flex-col lg:flex-row items-center justify-between w-full ${
        index % 2 === 0 ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* Empty Space for alignment */}
      <div className="hidden lg:block w-5/12"></div>

      {/* Center Dot */}
      <motion.div
        style={{ scale, opacity }}
        className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-[#0B1120] z-10 hidden lg:block shadow-[0_0_10px_rgba(56,189,248,0.5)]"
      ></motion.div>

      {/* Card */}
      <motion.div style={{ opacity, x }} className="w-full lg:w-5/12">
        <div className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:border-white/20 shadow-lg">
          {/* Date Badge */}
          <div className="absolute -top-4 right-8 bg-primary border border-primary/30 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
            {item.date}
          </div>

          <div className="space-y-4 mt-2">
            <div>
              <h4 className="text-primary text-sm font-medium tracking-wide uppercase mb-1">
                {item.focus}
              </h4>
              <h3 className="text-2xl font-bold text-white">{item.title}</h3>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              {item.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">
                  Key Outputs
                </h5>
                <ul className="space-y-1">
                  {item.outputs.map((output, i) => (
                    <li
                      key={i}
                      className="text-gray-400 text-xs flex items-start gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                      {output}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">
                  Targets
                </h5>
                <ul className="space-y-1">
                  {item.targets.map((target, i) => (
                    <li
                      key={i}
                      className="text-gray-400 text-xs flex items-start gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></span>
                      {target}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Timeline = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden px-4 lg:px-0 pt-20 pb-40"
      id="timeline"
    >
      {/* Gradient Background Left */}
      <div className="absolute top-1/4 left-0 w-[800px] h-[800px] pointer-events-none z-0 opacity-40">
        <img
          src={Gradient1}
          alt="Gradient"
          className="w-full h-full object-contain blur-[100px]"
        />
      </div>
      {/* Gradient Background Right */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] pointer-events-none z-0 opacity-40">
        <img
          src={Gradient1}
          alt="Gradient"
          className="w-full h-full object-contain blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="textstart lg:text-center mb-20 space-y-4"
        >
          <div className="inline-block border border-gray-700 py-2 px-4 rounded-full bg-white/5 backdrop-blur-sm">
            <h3 className="text-gray-400 text-sm font-semibold tracking-wider uppercase">
              Roadmap
            </h3>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            SEANO Development Timeline
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A strategic roadmap from concept to open-sea deployment, ensuring
            precision, reliability, and innovation at every stage.
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div ref={ref} className="relative">
          {/* Vertical Line Background (Static) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-white/10 hidden lg:block"></div>

          {/* Vertical Line Animated */}
          <motion.div
            style={{ scaleY, originY: 0 }}
            className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary via-blue-400 to-primary hidden lg:block shadow-[0_0_15px_rgba(56,189,248,0.6)]"
          ></motion.div>

          <div className="space-y-12 lg:space-y-0">
            {timelineData.map((item, index) => (
              <TimelineCard
                key={index}
                item={item}
                index={index}
                progress={scaleY}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
