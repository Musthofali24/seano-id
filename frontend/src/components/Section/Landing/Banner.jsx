import { HiArrowRight } from "react-icons/hi";
import { motion } from "framer-motion";
import seanoBoat from "../../../assets/seanoBoat.webp";
import Gradient1 from "../../../assets/Gradient1.webp";

/**
 * PANDUAN PENGATURAN ANIMASI (TUNING GUIDE):
 *
 * 1. Animasi Kapal Mengapung (motion.img):
 *    - animate={{ y: [0, -20, 0] }}: Mengatur gerakan vertikal. Ubah -20 menjadi -30 untuk gerakan yang lebih jauh.
 *    - transition={{ duration: 6, ... }}: Mengatur kecepatan. Angka lebih kecil = mengapung lebih cepat.
 *
 * 2. Animasi Teks Muncul (variants):
 *    - hidden: { opacity: 0, y: 30 }: Kondisi awal. Perbesar nilai y untuk efek geser ke atas yang lebih jauh.
 *    - visible: { opacity: 1, y: 0 }: Kondisi akhir (muncul sepenuhnya).
 *    - transition={{ duration: 0.8, delay: ... }}: Mengatur kecepatan muncul dan jeda antar elemen.
 */

const Banner = () => {
  // Animation variants for staggered text reveal
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: custom * 0.2, // Stagger delay based on index
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full from-gray-950 via-gray-900 to-gray-950 overflow-hidden px-4">
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="flex flex-col items-center justify-between gap-12">
          <div className="flex-1 lg:text-center text-start justify-center space-y-8">
            {/* Badge */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-transparent rounded-full border border-primary/30"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-200">
                NEW FEATURE : REAL-TIME MONITORING
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight lg:text-center"
            >
              <span className="text-white">Autonomous Ocean</span>{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Intelligence
              </span>
              <br />
              <span className="text-white">
                for{" "}
                <span className="bg-gradient-to-b from-red-600 via-red-500 to-white bg-clip-text text-transparent font-extrabold">
                  Indonesia's
                </span>{" "}
                Maritime Future
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              SEANO enables real-time ocean monitoring and autonomous missions
              across Indonesian waters—supporting research, security, and
              national resilience.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="flex flex-row items-center justify-center gap-4 pt-4"
            >
              <a
                href="#learn-more"
                className="group relative px-7 py-4 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] bg-left hover:bg-right text-white rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out inline-flex items-center gap-2 w-full sm:w-auto justify-center transform hover:scale-105"
              >
                Learn More
                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>

              <a
                href="#watch-demo"
                className="group px-7 py-4 bg-transparent border-2 border-gray-700 hover:border-primary text-white rounded-full font-semibold transition-all duration-300 ease-in-out inline-flex items-center gap-2 w-full sm:w-auto justify-center hover:shadow-lg"
              >
                Watch Demo
                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </motion.div>
          </div>

          <div className="flex-1 relative w-full mt-10">
            <div className="relative">
              {/* Boat Image with Floating Animation */}
              <motion.img
                src={seanoBoat}
                alt="SEANO Autonomous Boat"
                width={800}
                height={600}
                fetchpriority="high"
                loading="eager"
                decoding="async"
                className="relative z-10 w-full h-auto drop-shadow-2xl scale-125"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <img
        src={Gradient1}
        alt="Ocean Gradient Background"
        width={1920}
        height={1080}
        fetchpriority="high"
        loading="eager"
        decoding="async"
        className="absolute inset-x-0 top-60 w-full h-full object-cover scale-130"
      />
      {/* Dark Gradient Overlay in Front of Boat (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 h-3/3 bg-gradient-to-t from-black via-black/50 to-transparent z-20 pointer-events-none"></div>
    </div>
  );
};

export default Banner;
