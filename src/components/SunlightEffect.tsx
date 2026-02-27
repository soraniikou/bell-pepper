import { motion } from "framer-motion";

interface SunlightEffectProps {
  opacity: number;
}

export const SunlightEffect = ({ opacity }: SunlightEffectProps) => {
  if (opacity < 0.01) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity }}>
      {/* Soft diagonal light rays */}
      <motion.div
        className="absolute"
        style={{
          top: "-20%",
          right: "-10%",
          width: "60%",
          height: "140%",
          background: `linear-gradient(
            135deg,
            hsla(45, 50%, 90%, 0.15) 0%,
            hsla(45, 40%, 95%, 0.08) 40%,
            transparent 70%
          )`,
          transform: "rotate(-15deg)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Secondary softer ray */}
      <motion.div
        className="absolute"
        style={{
          top: "-10%",
          right: "10%",
          width: "40%",
          height: "120%",
          background: `linear-gradient(
            140deg,
            hsla(40, 40%, 92%, 0.1) 0%,
            transparent 50%
          )`,
          transform: "rotate(-20deg)",
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
};
