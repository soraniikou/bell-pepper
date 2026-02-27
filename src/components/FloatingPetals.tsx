import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingPetalsProps {
  active: boolean;
}

export const FloatingPetals = ({ active }: FloatingPetalsProps) => {
  const petals = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      driftX: (Math.random() - 0.5) * 150,
      driftY: 80 + Math.random() * 120,
      rotation: Math.random() * 360,
      delay: Math.random() * 6,
      duration: 7 + Math.random() * 5,
      size: 6 + Math.random() * 8,
    }))
  ).current;

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.startX}%`,
            top: "-5%",
          }}
          animate={{
            y: [0, petal.driftY, petal.driftY * 2],
            x: [0, petal.driftX * 0.5, petal.driftX],
            rotate: [0, petal.rotation, petal.rotation * 2],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: "easeInOut",
          }}
        >
          <div
            style={{
              width: petal.size,
              height: petal.size * 1.4,
              borderRadius: "50% 50% 50% 50%",
              background: `radial-gradient(ellipse, hsla(60, 20%, 97%, 0.8), hsla(60, 15%, 90%, 0.4))`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};
