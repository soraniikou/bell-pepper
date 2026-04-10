import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSkyColors, lerpValue } from "@/lib/skyUtils";
import { RainParticles } from "@/components/RainParticles";
import { BreathingStar } from "@/components/BreathingStar";
import { SunlightEffect } from "@/components/SunlightEffect";
import { StoneFlower } from "@/components/StoneFlower";
import { FloatingPetals } from "@/components/FloatingPetals";
import { useAudioSystem } from "@/hooks/useAudioSystem";

// eslint-disable-next-line react-refresh/only-export-components
const Index = () => {
  const [skyProgress, setSkyProgress] = useState(0); // 0=rain, 0.5=night, 1=clear
  const [growthLevel, setGrowthLevel] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasBloomedOnce, setHasBloomedOnce] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const lastY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { startAmbient, stopAmbient, playBloomMelody, playChime } = useAudioSystem();

  const handleRestart = useCallback(() => {
    lastY.current = null;
    stopAmbient();
    // Close and discard the AudioContext entirely so no residual sounds remain
    if ((window as any).__audioCtxRef) {
      (window as any).__audioCtxRef = null;
    }
    setSkyProgress(0);
    setGrowthLevel(0);
    setHasInteracted(false);
    setHasBloomedOnce(false);
    setResetKey((prev) => prev + 1);
  }, [stopAmbient]);

  const handleStopAudio = useCallback(() => {
    stopAmbient();
  }, [stopAmbient]);

  // Auto-progress: sky and growth advance automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setSkyProgress((prev) => {
        if (prev >= 1) return 1;
        return Math.min(1, prev + 0.002);
      });
      setGrowthLevel((prev) => {
        if (prev >= 1) return 1;
        return Math.min(1, prev + 0.001);
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const skyColors = useMemo(() => getSkyColors(skyProgress), [skyProgress]);

  // Rain opacity: full at 0, fades by 0.3
  const rainOpacity = useMemo(() => Math.max(0, 1 - skyProgress / 0.35), [skyProgress]);
  // Star opacity: peaks at 0.5
  const starOpacity = useMemo(() => {
    const dist = Math.abs(skyProgress - 0.5);
    return Math.max(0, 1 - dist / 0.3);
  }, [skyProgress]);
  // Sunlight: ramps up from 0.7
  const sunlightOpacity = useMemo(() => Math.max(0, (skyProgress - 0.65) / 0.35), [skyProgress]);

  const isBlooming = growthLevel >= 0.3 && skyProgress >= 0.3;

  // Bloom trigger
  useEffect(() => {
    if (isBlooming && !hasBloomedOnce) {
      setHasBloomedOnce(true);
      playBloomMelody();
    }
  }, [isBlooming, hasBloomedOnce, playBloomMelody]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      lastY.current = e.clientY;
      if (!hasInteracted) {
        setHasInteracted(true);
        startAmbient();
      }
    },
    [hasInteracted, startAmbient]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (lastY.current === null) return;
    const deltaY = lastY.current - e.clientY;
    lastY.current = e.clientY;

    // Swipe up = increase progress (toward clear sky)
    setSkyProgress((prev) => Math.max(0, Math.min(1, prev + deltaY * 0.002)));
  }, []);

  const handlePointerUp = useCallback(() => {
    lastY.current = null;
  }, []);

  const handleNurture = useCallback(() => {
    setGrowthLevel((prev) => Math.min(1, prev + 0.003));
    // Occasional chime when nurturing
    if (Math.random() < 0.03) {
      playChime();
    }
  }, [playChime]);

  // Determine the hint text
  const hintText = useMemo(() => {
    if (isBlooming) return "";
    if (!hasInteracted) return "click";
    return "";
  }, [hasInteracted, isBlooming]);

  // Whisper text after bloom
  const showWhisper = hasBloomedOnce && isBlooming;

  return (
    <div
      key={resetKey}
      ref={containerRef}
      className="fixed inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        background: `linear-gradient(to bottom, ${skyColors.top}, ${skyColors.bottom})`,
        transition: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Title */}
      <motion.div
        className="absolute top-8 left-0 right-0 text-center pointer-events-none z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <h1
          className="font-light font-serif-elegant italic"
          style={{
            color: `hsla(0, 0%, ${skyProgress > 0.7 ? 20 : 90}%, ${0.5 + skyProgress * 0.2})`,
            transition: "color 0.5s ease",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            letterSpacing: "0.25em",
          }}
        >
          <span style={{ fontSize: "1.4em", fontWeight: 300 }}>Wishing</span>{" "}
          a lovely life
        </h1>
      </motion.div>

      {/* Rain */}
      <RainParticles opacity={rainOpacity} />

      {/* Star */}
      <BreathingStar opacity={starOpacity} />

      {/* Moon */}
      {starOpacity > 0.1 && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: "12%",
            left: "20%",
            opacity: starOpacity * 0.7,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, 
                hsla(45, 20%, 90%, 0.9), 
                hsla(45, 15%, 75%, 0.6))`,
              boxShadow: `0 0 30px 10px hsla(45, 20%, 85%, 0.15)`,
            }}
          />
        </div>
      )}

      {/* Sunlight */}
      <SunlightEffect opacity={sunlightOpacity} />

      {/* Floating petals when blooming */}
      <FloatingPetals active={hasInteracted && isBlooming} />

      {/* Ground gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "25%",
          background: `linear-gradient(to top, 
            hsla(${lerpValue(215, 120, skyProgress)}, ${lerpValue(15, 20, skyProgress)}%, ${lerpValue(20, 35, skyProgress)}%, 0.4), 
            transparent)`,
        }}
      />

      {/* Stone / Flower */}
      <StoneFlower
        skyProgress={skyProgress}
        growthLevel={growthLevel}
        onNurture={handleNurture}
      />

      {/* Hint text */}
      <AnimatePresence>
        {hintText && (
          <motion.p
            className="absolute bottom-12 left-0 right-0 text-center pointer-events-none font-serif-elegant"
            style={{
              fontSize: hintText === "石を撫でて" ? "clamp(1.8rem, 5vw, 3rem)" : "clamp(0.9rem, 2.5vw, 1.2rem)",
              letterSpacing: "0.15em",
              color: `hsla(0, 0%, ${skyProgress > 0.7 ? 30 : 85}%, 0.5)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {hintText}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Whisper */}
      <AnimatePresence>
        {showWhisper && (
          <motion.p
            className="absolute bottom-16 left-0 right-0 text-center text-xs tracking-[0.4em] pointer-events-none font-serif-elegant italic"
            style={{
              color: "hsla(210, 20%, 40%, 0.35)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0.2, 0.3, 0] }}
            transition={{ duration: 12, delay: 5, ease: "easeInOut" }}
          >
            愛おしい人生を。
          </motion.p>
        )}
      </AnimatePresence>

      {/* Final screen buttons */}
      <AnimatePresence>
        {hasBloomedOnce && (
          <motion.div
            className="fixed bottom-5 left-0 right-0 flex justify-center gap-4 z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <button
              onClick={handleRestart}
              className="px-4 py-1.5 text-xs tracking-widest rounded-full backdrop-blur-sm transition-opacity hover:opacity-80"
              style={{
                background: "hsla(0, 0%, 100%, 0.15)",
                color: `hsla(0, 0%, ${skyProgress > 0.7 ? 30 : 85}%, 0.6)`,
                border: `1px solid hsla(0, 0%, ${skyProgress > 0.7 ? 30 : 85}%, 0.2)`,
              }}
            >
              もう一度
            </button>
            <button
              onClick={handleStopAudio}
              className="px-4 py-1.5 text-xs tracking-widest rounded-full backdrop-blur-sm transition-opacity hover:opacity-80"
              style={{
                background: "hsla(0, 0%, 100%, 0.15)",
                color: `hsla(0, 0%, ${skyProgress > 0.7 ? 30 : 85}%, 0.6)`,
                border: `1px solid hsla(0, 0%, ${skyProgress > 0.7 ? 30 : 85}%, 0.2)`,
              }}
            >
              音を止める
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
