import { motion } from "framer-motion";

interface BreathingStarProps {
  opacity: number;
}

export const BreathingStar = ({ opacity }: BreathingStarProps) => {
  if (opacity < 0.01) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: "18%",
        right: "28%",
        opacity,
      }}
    >
      <motion.div
        className="relative"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Star core */}
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: "hsl(45, 80%, 85%)",
            boxShadow: `
              0 0 10px 3px hsla(45, 80%, 85%, 0.6),
              0 0 30px 8px hsla(45, 80%, 85%, 0.3),
              0 0 60px 15px hsla(45, 60%, 80%, 0.15)
            `,
          }}
        />
      </motion.div>
    </div>
  );
};
