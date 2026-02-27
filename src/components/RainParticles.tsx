import { useEffect, useRef } from "react";

interface RainParticlesProps {
  opacity: number;
}

export const RainParticles = ({ opacity }: RainParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Array<{ x: number; y: number; speed: number; length: number; opacity: number }>>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize drops
    const dropCount = 80;
    dropsRef.current = Array.from({ length: dropCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 1.5 + Math.random() * 2.5,
      length: 15 + Math.random() * 25,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const drops = dropsRef.current;

      for (const drop of drops) {
        drop.y += drop.speed;
        if (drop.y > canvas.height + drop.length) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 0.5, drop.y + drop.length);
        ctx.strokeStyle = `hsla(200, 30%, 75%, ${drop.opacity * opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [opacity]);

  if (opacity < 0.01) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
    />
  );
};
