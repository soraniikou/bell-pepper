import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StoneFlowerProps {
  skyProgress: number; // 0=rain, 0.5=night, 1=clear
  growthLevel: number; // 0-1 how much the stone has been nurtured
  onNurture: () => void;
}

export const StoneFlower = ({ skyProgress, growthLevel, onNurture }: StoneFlowerProps) => {
  const [isDragging, setIsDragging] = useState(false);

  // Determine visual stage based on growth and sky
  const stage = useMemo(() => {
    if (growthLevel < 0.2) return "stone";
    if (growthLevel < 0.5) return "sprouting";
    if (growthLevel < 0.8 || skyProgress < 0.8) return "growing";
    return "blooming";
  }, [growthLevel, skyProgress]);

  const handlePointerMove = useCallback(() => {
    if (isDragging) {
      onNurture();
    }
  }, [isDragging, onNurture]);

  // Stone color shifts slightly with sky
  const stoneColor = useMemo(() => {
    const baseL = 45 + skyProgress * 15;
    return `hsl(30, ${8 + skyProgress * 4}%, ${baseL}%)`;
  }, [skyProgress]);

  return (
    <div
      className="absolute bottom-[22%] left-1/2 -translate-x-1/2 cursor-pointer"
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
      onPointerMove={handlePointerMove}
      style={{ touchAction: "none" }}
    >
      <div className="relative flex flex-col items-center">
        {/* Flower / Growing elements */}
        <AnimatePresence>
          {stage !== "stone" && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ marginBottom: -8 }}
            >
              {/* Stem */}
              <motion.div
                className="relative flex flex-col items-center"
                initial={{ height: 0 }}
                animate={{
                  height: stage === "blooming" ? 90 : stage === "growing" ? 60 : 25,
                }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <div
                  className="w-[2.5px] rounded-full"
                  style={{
                    height: "100%",
                    background: `linear-gradient(to top, hsl(120, 30%, 35%), hsl(120, 40%, 50%))`,
                  }}
                />
                {/* Leaves */}
                {(stage === "growing" || stage === "blooming") && (
                  <>
                    <motion.div
                      className="absolute"
                      style={{ top: "40%", left: 1 }}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: -35 }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 8,
                          borderRadius: "0 80% 0 80%",
                          background: "hsl(120, 35%, 45%)",
                          transformOrigin: "left center",
                        }}
                      />
                    </motion.div>
                    <motion.div
                      className="absolute"
                      style={{ top: "60%", right: 1 }}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 35 }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 7,
                          borderRadius: "80% 0 80% 0",
                          background: "hsl(120, 32%, 48%)",
                          transformOrigin: "right center",
                        }}
                      />
                    </motion.div>
                  </>
                )}
              </motion.div>

              {/* Flower head */}
              {stage === "blooming" && (
                <motion.div
                  className="absolute -top-10 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                >
                  {/* Petals */}
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <motion.div
                      key={angle}
                      className="absolute"
                      style={{
                        transform: `rotate(${angle}deg) translateY(-14px)`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.95 }}
                      transition={{ duration: 1.2, delay: 0.5 + i * 0.15 }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 22,
                          borderRadius: "50% 50% 50% 50%",
                          background: `radial-gradient(ellipse, 
                            hsla(60, 20%, 97%, 0.95), 
                            hsla(60, 15%, 92%, 0.8))`,
                          boxShadow: "0 0 8px hsla(60, 20%, 95%, 0.4)",
                        }}
                      />
                    </motion.div>
                  ))}
                  {/* Center */}
                  <motion.div
                    className="relative z-10 rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      background: "radial-gradient(circle, hsl(50, 70%, 65%), hsl(45, 60%, 50%))",
                      boxShadow: "0 0 6px hsla(50, 70%, 65%, 0.5)",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                  />
                </motion.div>
              )}

              {/* Bud for growing stage */}
              {stage === "growing" && (
                <motion.div
                  className="absolute -top-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 12,
                      borderRadius: "50% 50% 30% 30%",
                      background: "linear-gradient(to top, hsl(120, 30%, 40%), hsl(80, 25%, 60%))",
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stone */}
        <motion.div
          className="relative"
          animate={{
            scale: isDragging ? 0.97 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <svg width="70" height="45" viewBox="0 0 70 45">
            <ellipse
              cx="35"
              cy="25"
              rx="32"
              ry="18"
              fill={stoneColor}
              stroke="none"
            />
            <ellipse
              cx="35"
              cy="25"
              rx="32"
              ry="18"
              fill="url(#stoneGrad)"
            />
            {/* Highlight */}
            <ellipse
              cx="28"
              cy="20"
              rx="12"
              ry="6"
              fill="hsla(0, 0%, 100%, 0.08)"
            />
            <defs>
              <radialGradient id="stoneGrad" cx="40%" cy="35%">
                <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.1)" />
                <stop offset="100%" stopColor="hsla(0, 0%, 0%, 0.15)" />
              </radialGradient>
            </defs>
          </svg>
          {/* Nurturing glow */}
          {isDragging && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, hsla(45, 60%, 80%, 0.2), transparent 70%)",
              }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};
