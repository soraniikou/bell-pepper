import { useRef } from "react";

interface FloatingPetalsProps {
  active: boolean;
}

export const FloatingPetals = ({ active }: FloatingPetalsProps) => {
  if (!active) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * 360;
        const rad = (angle * Math.PI) / 180;
        const distance = 150;
        const dx = Math.cos(rad) * distance;
        const dy = Math.sin(rad) * distance;
        const delay = i * 0.15;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 20,
              height: 32,
              background: "white",
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              opacity: 0,
              animation: `petalBurst 3s ease-out ${delay}s infinite`,
              transform: `rotate(${angle}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes petalBurst {
          0% { opacity: 0; transform: translate(0, 0) scale(0.3); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translate(${150}px, 0) scale(1); }
        }
      `}</style>
    </div>
  );
};
