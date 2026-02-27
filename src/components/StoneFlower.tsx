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
              {/* Stem - organic curved path */}
              <motion.div
                className="relative flex flex-col items-center"
                initial={{ height: 0 }}
                animate={{
                  height: stage === "blooming" ? 200 : stage === "growing" ? 110 : 35,
                }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <svg
                  width="30"
                  height="100%"
                  viewBox="0 0 30 100"
                  preserveAspectRatio="none"
                  style={{ height: "100%", overflow: "visible" }}
                >
                  <path
                    d="M15 100 C13 80, 18 65, 14 45 C11 30, 16 15, 15 0"
                    stroke="hsl(120, 35%, 40%)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
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
                  className="absolute -top-14 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                >
                  {/* Star-shaped petals like real paprika flower */}
                  <svg width="120" height="120" viewBox="-60 -60 120 120" style={{ overflow: "visible" }}>
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                      <motion.path
                        key={angle}
                        d={`M0,0 C${-6},${-12} ${-10},${-38} 0,${-48} C${10},${-38} ${6},${-12} 0,0`}
                        transform={`rotate(${angle})`}
                        fill="url(#petalGrad)"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.95 }}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.12 }}
                      />
                    ))}
                    <defs>
                      <radialGradient id="petalGrad" cx="50%" cy="30%">
                        <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.99)" />
                        <stop offset="60%" stopColor="hsla(0, 0%, 97%, 0.95)" />
                        <stop offset="100%" stopColor="hsla(60, 8%, 92%, 0.85)" />
                      </radialGradient>
                    </defs>
                    {/* Center pistil */}
                    <motion.circle
                      cx="0" cy="0" r="8"
                      fill="url(#centerGrad)"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, delay: 1.5 }}
                    />
                    <defs>
                      <radialGradient id="centerGrad">
                        <stop offset="0%" stopColor="hsl(55, 80%, 75%)" />
                        <stop offset="100%" stopColor="hsl(90, 40%, 55%)" />
                      </radialGradient>
                    </defs>
                    {/* Small stamens */}
                    {[0, 72, 144, 216, 288].map((a) => (
                      <motion.line
                        key={`s${a}`}
                        x1="0" y1="0"
                        x2={Math.sin(a * Math.PI / 180) * 12}
                        y2={-Math.cos(a * Math.PI / 180) * 12}
                        stroke="hsl(55, 60%, 65%)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ delay: 1.8 }}
                      />
                    ))}
                  </svg>
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

        {/* Stone - shrinks as flower grows, disappears when blooming */}
        {stage !== "blooming" && (
          <motion.div
            className="relative"
            animate={{
              scale: isDragging
                ? Math.max(0, 1 - growthLevel * 1.1) * 0.97
                : Math.max(0, 1 - growthLevel * 1.1),
              opacity: Math.max(0, 1 - growthLevel * 1.3),
            }}
            transition={{ duration: 0.3 }}
          >
            <svg width="70" height="45" viewBox="0 0 70 45">
              <ellipse cx="35" cy="25" rx="32" ry="18" fill={stoneColor} stroke="none" />
              <ellipse cx="35" cy="25" rx="32" ry="18" fill="url(#stoneGrad)" />
              <ellipse cx="28" cy="20" rx="12" ry="6" fill="hsla(0, 0%, 100%, 0.08)" />
              <defs>
                <radialGradient id="stoneGrad" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.1)" />
                  <stop offset="100%" stopColor="hsla(0, 0%, 0%, 0.15)" />
                </radialGradient>
              </defs>
            </svg>
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
        )}
      </div>
    </div>
  );
};
