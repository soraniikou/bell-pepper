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
                      if (fallingPetal && i === 2) return null;
                      return (
                        <motion.g
                          key={angle}
                          transform={`rotate(${angle})`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.95 }}
                          transition={{ duration: 1.2, delay: 0.5 + i * 0.15 }}
                        >
                          <path
                            d={`M0,0 C-15,-20 -40,-60 -45,-100 C-48,-125 -35,-145 -15,-155 C-5,-160 5,-160 15,-155 C35,-145 48,-125 45,-100 C40,-60 15,-20 0,0`}
                            fill={rainbowProgress > 0 ? `url(#petalGrad${i})` : "url(#petalGradWhite)"}
                          />
                          <path
                            d={`M0,-5 C-2,-50 -5,-100 0,-148`}
                            stroke={rainbowProgress > 0 ? `hsla(0,0%,100%,0.2)` : `hsla(60,10%,85%,0.4)`}
                            strokeWidth="0.8"
                            fill="none"
                          />
                          <path
                            d={`M0,-30 C-12,-60 -22,-90 -18,-130`}
                            stroke={rainbowProgress > 0 ? `hsla(0,0%,100%,0.15)` : `hsla(60,10%,88%,0.3)`}
                            strokeWidth="0.5"
                            fill="none"
                          />
                          <path
                            d={`M0,-30 C12,-60 22,-90 18,-130`}
                            stroke={rainbowProgress > 0 ? `hsla(0,0%,100%,0.15)` : `hsla(60,10%,88%,0.3)`}
                            strokeWidth="0.5"
                            fill="none"
                          />
                        </motion.g>
                      );
                    })}
                    <defs>
                      <radialGradient id="petalGradWhite" cx="50%" cy="30%">
                        <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.99)" />
                        <stop offset="40%" stopColor="hsla(350, 5%, 97%, 0.96)" />
                        <stop offset="100%" stopColor="hsla(340, 8%, 92%, 0.88)" />
                      </radialGradient>
                      {petalAngles.map((_, i) => {
                        const hue = (i * 72) + rainbowProgress * 360;
                        const sat = Math.min(80, 80 * rainbowProgress);
                        const lit = 55 - rainbowProgress * 15;
                        return (
                          <radialGradient key={`pg${i}`} id={`petalGrad${i}`} cx="50%" cy="25%">
                            <stop offset="0%" stopColor={`hsla(${hue}, ${sat}%, ${lit + 20}%, 0.95)`} />
                            <stop offset="50%" stopColor={`hsla(${hue + 20}, ${sat}%, ${lit + 5}%, 0.92)`} />
                            <stop offset="85%" stopColor={`hsla(${hue + 40}, ${sat - 5}%, ${lit - 5}%, 0.88)`} />
                            <stop offset="100%" stopColor={`hsla(${hue + 50}, ${sat - 10}%, ${lit - 12}%, 0.82)`} />
                          </radialGradient>
                        );
                      })}
                    </defs>
                    <motion.circle cx="0" cy="0" r="22" fill="url(#centerGrad)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8, delay: 1.5 }} />
                    <motion.circle cx="0" cy="0" r="14" fill="hsla(55, 70%, 65%, 0.6)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, delay: 1.7 }} />
                    <defs>
                      <radialGradient id="centerGrad">
                        <stop offset="0%" stopColor="hsl(50, 75%, 72%)" />
                        <stop offset="60%" stopColor="hsl(65, 50%, 58%)" />
                        <stop offset="100%" stopColor="hsl(90, 35%, 48%)" />
                      </radialGradient>
                    </defs>
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                      <motion.g key={`s${a}`} initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 1.8 + a * 0.002 }}>
                        <line x1={Math.sin(a * Math.PI / 180) * 16} y1={-Math.cos(a * Math.PI / 180) * 16} x2={Math.sin(a * Math.PI / 180) * 32} y2={-Math.cos(a * Math.PI / 180) * 32} stroke="hsl(50, 55%, 60%)" strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx={Math.sin(a * Math.PI / 180) * 34} cy={-Math.cos(a * Math.PI / 180) * 34} r="2.5" fill="hsl(45, 70%, 55%)" />
                      </motion.g>
                    ))}
                  </svg>

                  {/* Falling petal */}
                  <AnimatePresence>
                    {fallingPetal && (
                      <motion.div
                        className="absolute"
                        style={{ top: 0, left: "50%", marginLeft: -25 }}
                        initial={{ y: -120, x: 0, rotate: 144, opacity: 0.95 }}
                        animate={{
                          y: [-120, 50, 200, 400, 650],
                          x: [0, 50, -30, 70, 40],
                          rotate: [144, 210, 130, 270, 340],
                          opacity: [0.95, 0.9, 0.8, 0.5, 0],
                        }}
                        transition={{ duration: 6, ease: "easeIn" }}
                      >
                        <svg width="50" height="70" viewBox="-25 -35 50 70">
                          <path
                            d={`M0,-30 C-10,-15 -22,-5 -24,10 C-25,22 -18,32 -8,34 C-3,35 3,35 8,34 C18,32 25,22 24,10 C22,-5 10,-15 0,-30`}
                            fill="hsla(0, 0%, 98%, 0.92)"
                            stroke="hsla(340, 10%, 85%, 0.4)"
                            strokeWidth="0.5"
                          />
                          <path d="M0,-25 C-1,-10 -1,5 0,30" stroke="hsla(60, 10%, 85%, 0.4)" strokeWidth="0.6" fill="none" />
                          <path d="M0,-15 C-8,-5 -12,5 -10,20" stroke="hsla(60, 10%, 88%, 0.25)" strokeWidth="0.4" fill="none" />
                          <path d="M0,-15 C8,-5 12,5 10,20" stroke="hsla(60, 10%, 88%, 0.25)" strokeWidth="0.4" fill="none" />
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

        {/* Stone on hands */}
        {stage !== "blooming" && (
          <motion.div
            className="relative flex flex-col items-center"
            animate={{
              scale: isDragging
                ? Math.max(0.3, 1 - growthLevel * 0.7) * 0.97
                : Math.max(0.3, 1 - growthLevel * 0.7),
              opacity: Math.max(0, 1 - growthLevel * 1.3),
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Stone */}
            <svg width="70" height="45" viewBox="0 0 70 45" style={{ marginBottom: -18, zIndex: 2, position: "relative" }}>
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
            {/* Hands image */}
            <img
              src="/images/hands.png"
              alt="手のひら"
              className="w-[200px] h-auto pointer-events-none select-none"
              style={{ filter: "drop-shadow(0 4px 12px hsla(0,0%,60%,0.25))" }}
              draggable={false}
            />
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

              {/* White petal for wishes */}
              <motion.div
                className="absolute flex items-center justify-center"
                style={{ top: "-55%" }}
                initial={{ scale: 0, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 1, ease: "easeOut" }}
              >
                <svg
                  width="260"
                  height="360"
                  viewBox="-130 -180 260 360"
                  style={{ filter: "drop-shadow(0 6px 20px hsla(0,0%,75%,0.4))" }}
                >
                  <path
                    d={`M0,-170 C-12,-155 -42,-120 -48,-80 C-55,-35 -50,15 -40,55 C-30,95 -15,135 0,160 C15,135 30,95 40,55 C50,15 55,-35 48,-80 C42,-120 12,-155 0,-170`}
                    fill="hsla(0, 0%, 100%, 0.95)"
                    stroke="hsla(0, 0%, 88%, 0.5)"
                    strokeWidth="1"
                  />
                  {/* Veins */}
                  <path d="M0,-155 C-1,-80 -1,0 0,150" stroke="hsla(60, 10%, 85%, 0.5)" strokeWidth="1" fill="none" />
                  <path d="M0,-120 C-15,-60 -25,0 -20,80" stroke="hsla(60, 10%, 88%, 0.3)" strokeWidth="0.7" fill="none" />
                  <path d="M0,-120 C15,-60 25,0 20,80" stroke="hsla(60, 10%, 88%, 0.3)" strokeWidth="0.7" fill="none" />
                  <path d="M0,-80 C-25,-30 -35,20 -28,70" stroke="hsla(60, 10%, 90%, 0.2)" strokeWidth="0.5" fill="none" />
                  <path d="M0,-80 C25,-30 35,20 28,70" stroke="hsla(60, 10%, 90%, 0.2)" strokeWidth="0.5" fill="none" />
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
