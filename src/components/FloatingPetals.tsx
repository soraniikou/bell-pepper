import { useRef } from "react";
import { motion } from "framer-motion";

interface FloatingPetalsProps {
  active: boolean;
}
export const FloatingPetals = ({ active }: FloatingPetalsProps) => {
  const petals = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      angle: (i / 16) * 360, // 均等に360度に配置
      distance: 80 + Math.random() * 120,
      rotation: Math.random() * 720,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 3,
      size: 10 + Math.random() * 12,
    }))
  ).current;

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {petals.map((petal) => {
        const rad = (petal.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * petal.distance;
        const dy = Math.sin(rad) * petal.distance;

        return (
          <motion.div
            key={petal.id}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [0, dx * 0.5, dx],
              y: [0, dy * 0.5, dy],
              rotate: [0, petal.rotation],
              opacity: [0, 1, 0],
              scale: [0.3, 1.2, 0.8],
            }}
            transition={{
              duration: petal.duration,
              repeat: Infinity,
              delay: petal.delay,
              ease: "easeOut",
            }}
          >
            <svg
              width={petal.size}
              height={petal.size * 1.6}
              viewBox="0 0 20 32"
              style={{ filter: "drop-shadow(0 0 6px hsla(0,0%,100%,0.6))" }}
            >
              <path
                d="M10,0 C4,8 0,18 10,32 C20,18 16,8 10,0Z"
                fill="hsla(0, 0%, 100%, 0.95)"
              />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
};
