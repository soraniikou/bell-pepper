import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StoneFlowerProps {
  skyProgress: number;
  growthLevel: number;
  onNurture: () => void;
}

export const StoneFlower = ({ skyProgress, growthLevel, onNurture }: StoneFlowerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fallingPetal, setFallingPetal] = useState(false);
  const [showWishPetal, setShowWishPetal] = useState(false);
  const [wishText, setWishText] = useState("");
  const [rainbowProgress, setRainbowProgress] = useState(0);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const rainbowAnimRef = useRef<number | null>(null);

  const stage = useMemo(() => {
    if (growthLevel < 0.2) return "stone";
    if (growthLevel < 0.5) return "sprouting";
    if (growthLevel < 0.8 || skyProgress < 0.8) return "growing";
    return "blooming";
  }, [growthLevel, skyProgress]);

  // After blooming, trigger one petal to fall after a delay
  useEffect(() => {
    if (stage === "blooming" && !fallingPetal) {
      const timer = setTimeout(() => {
        setFallingPetal(true);
        const audio = new Audio("/audio/voice.m4a");
        audio.volume = 0.8;
        voiceRef.current = audio;

        // Gradually decrease volume & animate rainbow
        const startTime = Date.now();
        const fadeInterval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          const duration = audio.duration || 30;
          const progress = Math.min(1, elapsed / duration);
          
          // Fade volume
          audio.volume = Math.max(0, 0.8 * (1 - progress * 0.7));
          
          // Rainbow progress
          setRainbowProgress(progress);
          
          if (progress >= 1) clearInterval(fadeInterval);
        }, 100);

        audio.addEventListener("ended", () => {
          clearInterval(fadeInterval);
          setRainbowProgress(1);
          // Show wish petal after voice ends
          setTimeout(() => {
            setShowWishPetal(true);
          }, 1500);
        });
        
        audio.play().catch(() => {});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stage, fallingPetal]);

  const handlePointerMove = useCallback(() => {
    if (isDragging) {
      onNurture();
    }
  }, [isDragging, onNurture]);

  const stoneColor = useMemo(() => {
    const baseL = 45 + skyProgress * 15;
    return `hsl(30, ${8 + skyProgress * 4}%, ${baseL}%)`;
  }, [skyProgress]);

  // 5 petals at 72° intervals
  const petalAngles = [0, 72, 144, 216, 288];

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
        <AnimatePresence>
          {stage !== "stone" && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ marginBottom: -8 }}
            >
              {/* Stem - much longer */}
              <motion.div
                className="relative flex flex-col items-center"
                initial={{ height: 0 }}
                animate={{
                  height: stage === "blooming" ? 320 : stage === "growing" ? 140 : 45,
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
                      style={{ top: "35%", left: 1 }}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: -35 }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 10,
                          borderRadius: "0 80% 0 80%",
                          background: "hsl(120, 35%, 45%)",
                          transformOrigin: "left center",
                        }}
                      />
                    </motion.div>
                    <motion.div
                      className="absolute"
                      style={{ top: "55%", right: 1 }}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 35 }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 9,
                          borderRadius: "80% 0 80% 0",
                          background: "hsl(120, 32%, 48%)",
                          transformOrigin: "right center",
                        }}
                      />
                    </motion.div>
                    <motion.div
                      className="absolute"
                      style={{ top: "75%", left: 1 }}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: -30 }}
                      transition={{ duration: 1.5, delay: 1.1 }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 8,
                          borderRadius: "0 80% 0 80%",
                          background: "hsl(120, 30%, 50%)",
                          transformOrigin: "left center",
                        }}
                      />
                    </motion.div>
                  </>
                )}
              </motion.div>

              {/* Flower head - 5 petals paprika style */}
              {stage === "blooming" && (
                <motion.div
                  className="absolute -top-14 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                >
                  <svg width="360" height="360" viewBox="-180 -180 360 360" style={{ overflow: "visible" }}>
                    {petalAngles.map((angle, i) => {
                      // Skip the falling petal (index 2 = 144°)
                      if (fallingPetal && i === 2) return null;
                      const petalHue = (i * 72) + rainbowProgress * 360;
                      return (
                        <motion.path
                          key={angle}
                          d={`M0,0 C${-22},${-40} ${-35},${-120} 0,${-150} C${35},${-120} ${22},${-40} 0,0`}
                          transform={`rotate(${angle})`}
                          fill={rainbowProgress > 0 ? `url(#petalGrad${i})` : "url(#petalGradWhite)"}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.95 }}
                          transition={{ duration: 1.2, delay: 0.5 + i * 0.15 }}
                        />
                      );
                    })}
                    <defs>
                      {/* White gradient for before rainbow */}
                      <radialGradient id="petalGradWhite" cx="50%" cy="30%">
                        <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.99)" />
                        <stop offset="60%" stopColor="hsla(0, 0%, 97%, 0.95)" />
                        <stop offset="100%" stopColor="hsla(60, 8%, 92%, 0.85)" />
                      </radialGradient>
                      {/* Individual rainbow gradients per petal */}
                      {petalAngles.map((_, i) => {
                        const hue = (i * 72) + rainbowProgress * 360;
                        const sat = Math.min(85, 85 * rainbowProgress);
                        const lit = 70 - rainbowProgress * 20;
                        return (
                          <radialGradient key={`pg${i}`} id={`petalGrad${i}`} cx="50%" cy="30%">
                            <stop offset="0%" stopColor={`hsla(${hue}, ${sat}%, ${lit + 15}%, 0.95)`} />
                            <stop offset="50%" stopColor={`hsla(${hue + 30}, ${sat}%, ${lit}%, 0.9)`} />
                            <stop offset="100%" stopColor={`hsla(${hue + 60}, ${sat - 10}%, ${lit - 5}%, 0.85)`} />
                          </radialGradient>
                        );
                      })}
                    </defs>
                    {/* Center pistil */}
                    <motion.circle
                      cx="0" cy="0" r="24"
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
                    {/* Stamens */}
                    {[0, 72, 144, 216, 288].map((a) => (
                      <motion.line
                        key={`s${a}`}
                        x1="0" y1="0"
                        x2={Math.sin(a * Math.PI / 180) * 36}
                        y2={-Math.cos(a * Math.PI / 180) * 36}
                        stroke="hsl(55, 60%, 65%)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ delay: 1.8 }}
                      />
                    ))}
                  </svg>

                  {/* Falling petal */}
                  <AnimatePresence>
                    {fallingPetal && (
                      <motion.div
                        className="absolute"
                        style={{ top: 0, left: "50%", marginLeft: -20 }}
                        initial={{ 
                          y: -120, 
                          x: 0, 
                          rotate: 144,
                          opacity: 0.95 
                        }}
                        animate={{
                          y: [-120, 50, 200, 400, 650],
                          x: [0, 40, -20, 60, 30],
                          rotate: [144, 200, 160, 250, 300],
                          opacity: [0.95, 0.9, 0.8, 0.5, 0],
                        }}
                        transition={{
                          duration: 6,
                          ease: "easeIn",
                        }}
                      >
                        <svg width="40" height="60" viewBox="-20 -30 40 60">
                          <path
                            d={`M0,-25 C${-12},${-15} ${-18},${5} 0,${25} C${18},${5} ${12},${-15} 0,-25`}
                            fill="hsla(0, 0%, 100%, 0.9)"
                            style={{ filter: "drop-shadow(0 2px 6px hsla(0,0%,80%,0.3))" }}
                          />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

      {/* Wish Petal - large petal that slides in from behind for writing wishes */}
      <AnimatePresence>
        {showWishPetal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: "hsla(0, 0%, 0%, 0.15)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            />
            
            {/* Container for hands + petal */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ scale: 0, y: 300, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            >
              {/* Hands photo */}
              <img
                src="/images/hands.png"
                alt="両手で花びらを包む"
                className="w-[340px] h-auto pointer-events-none select-none"
                style={{ filter: "drop-shadow(0 8px 24px hsla(0,0%,60%,0.3))" }}
                draggable={false}
              />

              {/* Large white petal floating above hands */}
              <motion.div
                className="absolute flex items-center justify-center"
                style={{ top: "-35%" }}
                initial={{ scale: 0, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 1, ease: "easeOut" }}
              >
                <svg
                  width="280"
                  height="380"
                  viewBox="-140 -190 280 380"
                  style={{ filter: "drop-shadow(0 6px 20px hsla(0,0%,75%,0.4))" }}
                >
                  <path
                    d={`M0,-175 C-65,-130 -115,-30 -105,50 C-95,115 -55,160 0,180 C55,160 95,115 105,50 C115,-30 65,-130 0,-175`}
                    fill="hsla(0, 0%, 100%, 0.94)"
                    stroke="hsla(0, 0%, 88%, 0.5)"
                    strokeWidth="1"
                  />
                  <path d="M0,-160 C-3,-80 -2,0 0,165" stroke="hsla(60, 10%, 85%, 0.5)" strokeWidth="1" fill="none" />
                  <path d="M0,-120 C-25,-60 -40,0 -32,80" stroke="hsla(60, 10%, 88%, 0.3)" strokeWidth="0.8" fill="none" />
                  <path d="M0,-120 C25,-60 40,0 32,80" stroke="hsla(60, 10%, 88%, 0.3)" strokeWidth="0.8" fill="none" />
                </svg>

                {/* Text input on the petal */}
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center px-14"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5, duration: 1.5 }}
                >
                  <p
                    className="text-sm tracking-[0.3em] mb-4 font-serif-elegant italic"
                    style={{ color: "hsla(210, 15%, 45%, 0.65)" }}
                  >
                    あなたの願いを
                  </p>
                  <textarea
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="ここに願いを書いてください..."
                    className="w-40 h-28 bg-transparent border-none outline-none resize-none text-center font-serif-elegant italic text-base leading-relaxed"
                    style={{
                      color: "hsla(210, 20%, 30%, 0.85)",
                      caretColor: "hsla(210, 20%, 50%, 0.6)",
                    }}
                    maxLength={200}
                    autoFocus
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
