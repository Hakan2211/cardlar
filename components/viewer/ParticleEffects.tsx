"use client";

import { useEffect, useRef } from "react";

interface ParticleEffectsProps {
  type: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

type Shape = "rect" | "circle" | "heart" | "star" | "petal" | "snow" | "glow";

interface StyleConfig {
  shapes: Shape[];
  colors: string[]; // merged with occasion accent at runtime
  rising?: boolean; // bubbles / soft-light float upward instead of falling
  ambientCount: number;
  burstCount: number;
}

const STYLES: Record<string, StyleConfig> = {
  confetti: {
    shapes: ["rect", "rect", "circle"],
    colors: ["#F4B942", "#E86A92", "#5AB1BB", "#8A6FDF", "#F0703A"],
    ambientCount: 26,
    burstCount: 130,
  },
  "gold-confetti": {
    shapes: ["rect", "rect", "star"],
    colors: ["#C9A96E", "#E8C87E", "#B08D57", "#F5E1A4", "#FFFFFF"],
    ambientCount: 26,
    burstCount: 130,
  },
  hearts: {
    shapes: ["heart"],
    colors: ["#E85D75", "#F28CA0", "#D94A63", "#FBC4D0"],
    ambientCount: 20,
    burstCount: 90,
  },
  "hearts-sparkle": {
    shapes: ["heart", "heart", "star"],
    colors: ["#E85D75", "#F28CA0", "#F4D06F", "#FFF3C6"],
    ambientCount: 22,
    burstCount: 100,
  },
  snowflakes: {
    shapes: ["snow", "snow", "circle"],
    colors: ["#FFFFFF", "#E6F2FA", "#C8E4F5", "#A8CEE8"],
    ambientCount: 34,
    burstCount: 80,
  },
  bubbles: {
    shapes: ["circle"],
    colors: ["#BBE1F0", "#D6EEF8", "#9FD1E8", "#FFFFFF"],
    rising: true,
    ambientCount: 22,
    burstCount: 60,
  },
  butterflies: {
    shapes: ["petal", "petal", "circle"],
    colors: ["#E8A0BF", "#C3AED6", "#F7D6E0", "#A5D8C8"],
    ambientCount: 22,
    burstCount: 80,
  },
  stars: {
    shapes: ["star", "star", "circle"],
    colors: ["#F4D06F", "#FFF3C6", "#FFFFFF", "#E8C87E"],
    ambientCount: 26,
    burstCount: 100,
  },
  "soft-light": {
    shapes: ["glow"],
    colors: ["#F5E9D4", "#FBF3E4", "#EFD9B4", "#FFFFFF"],
    rising: true,
    ambientCount: 16,
    burstCount: 30,
  },
  "rose-petals": {
    shapes: ["petal"],
    colors: ["#D94A63", "#E85D75", "#B03A50", "#F2A0B0"],
    ambientCount: 24,
    burstCount: 90,
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  shape: Shape;
  life: number; // seconds lived
  ttl: number; // burst: seconds until gone; ambient: Infinity
  phase: number; // sway/flutter offset
  ambient: boolean;
}

function drawShape(ctx: CanvasRenderingContext2D, p: Particle, t: number) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = p.color;
  const s = p.size;

  switch (p.shape) {
    case "rect": {
      // cos flutter fakes a 3D tumble
      const flutter = Math.cos(t * 6 + p.phase);
      ctx.scale(1, Math.max(0.15, Math.abs(flutter)));
      ctx.fillRect(-s / 2, -s / 3, s, (s * 2) / 3);
      break;
    }
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "heart": {
      const r = s / 2;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.35);
      ctx.bezierCurveTo(-r, -r * 0.45, -r * 0.5, -r * 1.1, 0, -r * 0.4);
      ctx.bezierCurveTo(r * 0.5, -r * 1.1, r, -r * 0.45, 0, r * 0.35);
      ctx.fill();
      break;
    }
    case "star": {
      const outer = s / 2;
      const inner = outer * 0.45;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "petal": {
      ctx.beginPath();
      ctx.ellipse(0, 0, s / 2, s / 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "snow": {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.max(1, s / 10);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3;
        ctx.moveTo(-Math.cos(a) * (s / 2), -Math.sin(a) * (s / 2));
        ctx.lineTo(Math.cos(a) * (s / 2), Math.sin(a) * (s / 2));
      }
      ctx.stroke();
      break;
    }
    case "glow": {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
      g.addColorStop(0, p.color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// Canvas particles: a confetti-cannon burst when the card opens, then a gentle
// ambient drift. Colors blend the occasion/photo accent into each style's
// palette so every card feels tinted to itself.
export function ParticleEffects({ type, colorScheme }: ParticleEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const accentRef = useRef(colorScheme.accent);
  accentRef.current = colorScheme.accent;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = STYLES[type] || STYLES.confetti;
    const colors = [...style.colors, accentRef.current];
    const rising = !!style.rising;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const particles: Particle[] = [];

    const spawnAmbient = (anywhere: boolean): Particle => {
      const size = rand(6, 16) * (style.shapes[0] === "glow" ? 2.2 : 1);
      const speed = rand(18, 55);
      return {
        x: rand(0, w),
        y: anywhere
          ? rand(0, h)
          : rising
          ? h + size
          : -size - rand(0, h * 0.3),
        vx: 0,
        vy: rising ? -speed : speed,
        rot: rand(0, Math.PI * 2),
        vr: rand(-1.2, 1.2),
        size,
        color: pick(colors),
        shape: pick(style.shapes),
        life: 0,
        ttl: Infinity,
        phase: rand(0, Math.PI * 2),
        ambient: true,
      };
    };

    // Two confetti cannons at the bottom corners, aimed at the upper-center.
    const spawnBurst = () => {
      for (let i = 0; i < style.burstCount; i++) {
        const fromLeft = i % 2 === 0;
        const angle = fromLeft
          ? rand(-Math.PI * 0.42, -Math.PI * 0.22) // up-right
          : rand(-Math.PI * 0.78, -Math.PI * 0.58); // up-left
        const speed = rand(420, 980);
        particles.push({
          x: fromLeft ? rand(-20, w * 0.15) : rand(w * 0.85, w + 20),
          y: h + 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rot: rand(0, Math.PI * 2),
          vr: rand(-8, 8),
          size: rand(7, 15),
          color: pick(colors),
          shape: pick(style.shapes),
          life: 0,
          ttl: rand(2.2, 3.6),
          phase: rand(0, Math.PI * 2),
          ambient: false,
        });
      }
    };

    for (let i = 0; i < style.ambientCount; i++) particles.push(spawnAmbient(true));
    spawnBurst();

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;

        if (p.ambient) {
          // gentle sinusoidal sway
          p.x += Math.sin(elapsed * 0.9 + p.phase) * 22 * dt + p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          if (rising ? p.y < -p.size * 2 : p.y > h + p.size * 2) {
            particles[i] = spawnAmbient(false);
            continue;
          }
          ctx.globalAlpha = p.shape === "glow" ? 0.5 : 0.85;
        } else {
          // burst physics: gravity + air drag
          p.vy += 620 * dt;
          p.vx *= 1 - 1.1 * dt;
          p.vy *= 1 - 0.35 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          if (p.life >= p.ttl || p.y > h + 40) {
            particles.splice(i, 1);
            continue;
          }
          const remain = 1 - p.life / p.ttl;
          ctx.globalAlpha = Math.min(1, remain / 0.3); // fade the last 30%
        }

        drawShape(ctx, p, elapsed);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}
