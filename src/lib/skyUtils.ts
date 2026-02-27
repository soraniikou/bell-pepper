// Utility to interpolate between HSL colors based on progress
export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export function lerpColor(a: HSLColor, b: HSLColor, t: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  t = clamp(t);
  const h = a.h + (b.h - a.h) * t;
  const s = a.s + (b.s - a.s) * t;
  const l = a.l + (b.l - a.l) * t;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function lerpValue(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// Sky state definitions
export const SKY_STATES = {
  rain: {
    top: { h: 215, s: 25, l: 45 },
    bottom: { h: 210, s: 20, l: 60 },
  },
  night: {
    top: { h: 230, s: 50, l: 10 },
    bottom: { h: 225, s: 40, l: 18 },
  },
  clear: {
    top: { h: 200, s: 60, l: 75 },
    bottom: { h: 195, s: 50, l: 85 },
  },
};

export function getSkyColors(progress: number): { top: string; bottom: string } {
  // progress 0 = rain, 0.5 = night, 1 = clear
  if (progress <= 0.5) {
    const t = progress / 0.5;
    return {
      top: lerpColor(SKY_STATES.rain.top, SKY_STATES.night.top, t),
      bottom: lerpColor(SKY_STATES.rain.bottom, SKY_STATES.night.bottom, t),
    };
  } else {
    const t = (progress - 0.5) / 0.5;
    return {
      top: lerpColor(SKY_STATES.night.top, SKY_STATES.clear.top, t),
      bottom: lerpColor(SKY_STATES.night.bottom, SKY_STATES.clear.bottom, t),
    };
  }
}
