import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSkyColors, lerpValue } from "@/lib/skyUtils";
import { RainParticles } from "@/components/RainParticles";
import { BreathingStar } from "@/components/BreathingStar";
import { SunlightEffect } from "@/components/SunlightEffect";
import { StoneFlower } from "@/components/StoneFlower";
import { FloatingPetals } from "@/components/FloatingPetals";
import { useAudioSystem } from "@/hooks/useAudioSystem";

const Index = () => {
  const [skyProgress, setSkyProgress] = useState(0); // 0=rain, 0.5=night, 1=clear
  const [growthLevel, setGrowthLevel] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasBloomedOnce, setHasBloomedOnce] = useState(false);
  const lastY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { startAmbient, playBloomMelody, playChime } = useAudioSystem();

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

  const isBlooming = growthLevel >= 0.8 && skyProgress >= 0.8;

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
    if (!hasInteracted) return "画面をスワイプして空を変えよう";
    if (growthLevel < 0.3) return "石を撫でて";
    if (isBlooming) return "";
    return "";
  }, [hasInteracted, growthLevel, isBlooming]);

  // Whisper text after bloom
  const showWhisper = hasBloomedOnce && isBlooming;

  return (
    <div
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
      <FloatingPetals active={isBlooming} />

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
    </div>
  );
};

export default Index;
