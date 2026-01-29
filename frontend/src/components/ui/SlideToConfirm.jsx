import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";

const SlideToConfirm = ({
  onConfirm,
  text = "Slide to confirm",
  confirmText = "Confirmed!",
  icon: IconComponent = FaChevronRight,
  variant = "danger", // danger, primary, success
  className = "",
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const x = useMotionValue(0);
  const slideProgress = useTransform(x, [0, containerWidth - 48], [0, 1]);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragEnd = () => {
    setIsDragging(false);
    const maxDistance = containerWidth - 48;
    const currentPosition = x.get();

    // Jika lebih dari 50%, auto-complete ke kanan
    // Jika kurang dari 50%, balik ke kiri
    if (currentPosition >= maxDistance * 0.5) {
      // Confirmed!
      animate(x, maxDistance, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
      setIsConfirmed(true);

      setTimeout(() => {
        onConfirm();
      }, 300);
    } else {
      // Reset ke kiri
      animate(x, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          bg: "bg-red-100 dark:bg-red-950",
          border: "border-red-300 dark:border-red-700",
          text: "text-red-600 dark:text-red-400",
          thumb: "bg-red-600 dark:bg-red-500",
          progress: "bg-red-200 dark:bg-red-900",
        };
      case "primary":
        return {
          bg: "bg-blue-100 dark:bg-blue-950",
          border: "border-blue-300 dark:border-blue-700",
          text: "text-blue-600 dark:text-blue-400",
          thumb: "bg-blue-600 dark:bg-blue-500",
          progress: "bg-blue-200 dark:bg-blue-900",
        };
      case "success":
        return {
          bg: "bg-green-100 dark:bg-green-950",
          border: "border-green-300 dark:border-green-700",
          text: "text-green-600 dark:text-green-400",
          thumb: "bg-green-600 dark:bg-green-500",
          progress: "bg-green-200 dark:bg-green-900",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          border: "border-gray-300 dark:border-gray-600",
          text: "text-gray-600 dark:text-gray-400",
          thumb: "bg-gray-600 dark:bg-gray-500",
          progress: "bg-gray-200 dark:bg-gray-700",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      ref={containerRef}
      className={`relative h-12 rounded-full border ${styles.border} ${styles.bg} overflow-hidden select-none ${className}`}
    >
      {/* Progress Background */}
      <motion.div
        className={`absolute inset-0 ${styles.progress}`}
        style={{
          scaleX: slideProgress,
          transformOrigin: "left",
        }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`font-medium text-sm ${styles.text} transition-opacity duration-200 ${
            isDragging || isConfirmed ? "opacity-0" : "opacity-100"
          }`}
        >
          {text}
        </span>
        {isConfirmed && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`font-medium text-sm ${styles.text}`}
          >
            {confirmText}
          </motion.span>
        )}
      </div>

      {/* Draggable Thumb */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: containerWidth - 48 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 ${styles.thumb} rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg transition-shadow hover:shadow-xl`}
      >
        <motion.div
          animate={{
            x: isDragging ? [0, 3, 0] : 0,
          }}
          transition={{
            repeat: isDragging ? Infinity : 0,
            duration: 0.5,
          }}
        >
          <IconComponent className="text-white text-xl" />
        </motion.div>
      </motion.div>

      {/* Chevron Indicators */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.text}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              x: [0, 5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: i * 0.2,
            }}
          >
            <FaChevronRight className="text-xs" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SlideToConfirm;
