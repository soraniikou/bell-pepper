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
                      // Each petal has slightly different shape for organic feel
                      const widthVar = [0, 3, -2, 4, -3][i];
                      const lenVar = [0, -5, 3, -3, 5][i];
                      const curlVar = [0, 2, -1, 3, -2][i];
                      return (
                        <motion.g
                          key={angle}
                          transform={`rotate(${angle})`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.96 }}
                          transition={{ duration: 1.2, delay: 0.5 + i * 0.15 }}
                        >
                          {/* Main petal shape - like a real paprika flower petal: wide base, rounded sides, pointed tip with slight curl */}
                          <path
                            d={`M0,0 
                              C${-8 - widthVar},-8 ${-18 - widthVar},-25 ${-28 - widthVar},-55 
                              C${-35 - widthVar},-80 ${-38 - widthVar},-110 ${-30 - widthVar},${-135 + lenVar} 
                              C${-22 - widthVar},${-150 + lenVar} ${-10 + curlVar},${-158 + lenVar} ${0 + curlVar},${-160 + lenVar} 
                              C${10 + curlVar},${-158 + lenVar} ${22 + widthVar},${-150 + lenVar} ${30 + widthVar},${-135 + lenVar} 
                              C${38 + widthVar},-110 ${35 + widthVar},-80 ${28 + widthVar},-55 
                              C${18 + widthVar},-25 ${8 + widthVar},-8 0,0`}
                            fill={rainbowProgress > 0 ? `url(#petalGrad${i})` : "url(#petalGradWhite)"}
                          />
                          {/* Petal fold/crease - subtle 3D effect */}
                          <path
                            d={`M0,0 
                              C${-3},-12 ${-6},-40 ${-4},-80 
                              C${-2},-120 ${0},${-148 + lenVar} ${curlVar},${-155 + lenVar}`}
                            stroke={rainbowProgress > 0 ? `hsla(0,0%,100%,0.25)` : `hsla(60,10%,82%,0.45)`}
                            strokeWidth="1"
                            fill="none"
                          />
                          {/* Side veins - curved like real petals */}
                          <path
                            d={`M0,-20 C${-10},-45 ${-18},-75 ${-16},${-120 + lenVar}`}
                            stroke={rainbowProgress > 0 ? `hsla(0,0%,100%,0.15)` : `hsla(60,10%,86%,0.3)`}
                            strokeWidth="0.6"
                            fill="none"
                          />
                          <path
                            d={`M0,-20 C${10},-45 ${18},-75 ${16},${-120 + lenVar}`}
                            stroke={rainbowProgress > 0 ? `hsla(0,0%,100%,0.15)` : `hsla(60,10%,86%,0.3)`}
                            strokeWidth="0.6"
                            fill="none"
                          />
                          {/* Subtle edge highlight for depth */}
                          <path
                            d={`M${-8 - widthVar},-8 
                              C${-18 - widthVar},-25 ${-28 - widthVar},-55 ${-35 - widthVar},-80`}
                            stroke={rainbowProgress > 0 ? `hsla(0,0%,100%,0.1)` : `hsla(0,0%,100%,0.15)`}
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </motion.g>
                      );
                    })}
                    <defs>
                      <radialGradient id="petalGradWhite" cx="45%" cy="30%">
                        <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.99)" />
                        <stop offset="30%" stopColor="hsla(60, 5%, 98%, 0.97)" />
                        <stop offset="70%" stopColor="hsla(60, 6%, 95%, 0.93)" />
                        <stop offset="100%" stopColor="hsla(80, 8%, 90%, 0.85)" />
                      </radialGradient>
                      {petalAngles.map((_, i) => {
                        const hue = (i * 72) + rainbowProgress * 360;
                        const sat = Math.min(75, 75 * rainbowProgress);
                        const lit = 58 - rainbowProgress * 15;
                        return (
                          <radialGradient key={`pg${i}`} id={`petalGrad${i}`} cx="45%" cy="25%">
                            <stop offset="0%" stopColor={`hsla(${hue}, ${sat}%, ${lit + 22}%, 0.96)`} />
                            <stop offset="40%" stopColor={`hsla(${hue + 15}, ${sat}%, ${lit + 8}%, 0.93)`} />
                            <stop offset="75%" stopColor={`hsla(${hue + 30}, ${sat - 5}%, ${lit - 2}%, 0.9)`} />
                            <stop offset="100%" stopColor={`hsla(${hue + 45}, ${sat - 10}%, ${lit - 10}%, 0.84)`} />
                          </radialGradient>
                        );
                      })}
                    </defs>
                    {/* Center pistil - like real paprika flower */}
                    <motion.circle cx="0" cy="0" r="20" fill="url(#centerGrad)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8, delay: 1.5 }} />
                    <motion.circle cx="0" cy="0" r="10" fill="hsla(90, 30%, 55%, 0.5)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, delay: 1.7 }} />
                    <defs>
                      <radialGradient id="centerGrad">
                        <stop offset="0%" stopColor="hsl(55, 65%, 78%)" />
                        <stop offset="50%" stopColor="hsl(70, 45%, 60%)" />
                        <stop offset="100%" stopColor="hsl(100, 30%, 45%)" />
                      </radialGradient>
                    </defs>
                    {/* Stamens with anthers */}
                    {[0, 60, 120, 180, 240, 320].map((a) => (
                      <motion.g key={`s${a}`} initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 1.8 + a * 0.002 }}>
                        <line x1={Math.sin(a * Math.PI / 180) * 12} y1={-Math.cos(a * Math.PI / 180) * 12} x2={Math.sin(a * Math.PI / 180) * 28} y2={-Math.cos(a * Math.PI / 180) * 28} stroke="hsl(55, 40%, 65%)" strokeWidth="1.2" strokeLinecap="round" />
                        <ellipse cx={Math.sin(a * Math.PI / 180) * 30} cy={-Math.cos(a * Math.PI / 180) * 30} rx="3" ry="2" fill="hsl(50, 60%, 55%)" transform={`rotate(${a}, ${Math.sin(a * Math.PI / 180) * 30}, ${-Math.cos(a * Math.PI / 180) * 30})`} />
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
                  width="320"
                  height="420"
                  viewBox="-160 -210 320 420"
                  style={{ filter: "drop-shadow(0 6px 22px hsla(340,30%,75%,0.4))" }}
                >
                  <path
                    d={`M0,-195 C-20,-175 -70,-130 -90,-75 C-110,-20 -115,40 -105,90 C-95,135 -65,170 -35,188 C-15,198 -5,202 0,203 C5,202 15,198 35,188 C65,170 95,135 105,90 C115,40 110,-20 90,-75 C70,-130 20,-175 0,-195`}
                    fill="hsla(345, 45%, 88%, 0.95)"
                    stroke="hsla(340, 35%, 78%, 0.5)"
                    strokeWidth="1"
                  />
                  {/* Veins */}
                  <path d="M0,-180 C-1,-90 -1,10 0,190" stroke="hsla(340, 20%, 80%, 0.4)" strokeWidth="1" fill="none" />
                  <path d="M0,-140 C-20,-70 -35,0 -30,100" stroke="hsla(340, 18%, 82%, 0.28)" strokeWidth="0.7" fill="none" />
                  <path d="M0,-140 C20,-70 35,0 30,100" stroke="hsla(340, 18%, 82%, 0.28)" strokeWidth="0.7" fill="none" />
                  <path d="M0,-100 C-40,-40 -55,20 -50,85" stroke="hsla(340, 15%, 85%, 0.18)" strokeWidth="0.5" fill="none" />
                  <path d="M0,-100 C40,-40 55,20 50,85" stroke="hsla(340, 15%, 85%, 0.18)" strokeWidth="0.5" fill="none" />
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
