'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Full-page animated night-sky background. Fixed behind all content, it
 * renders twinkling stars and slow drifting nebula glows on a canvas — the
 * same aesthetic as the sphere's own backdrop, now spanning the whole page.
 *
 * Purely decorative (aria-hidden). Pauses to a static field under
 * prefers-reduced-motion.
 */
export function PageStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;

    const stars: {
      x: number;
      y: number;
      r: number;
      phase: number;
      speed: number;
      bright: number;
    }[] = [];
    const glows: {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      hue: string;
    }[] = [];

    const seed = () => {
      // Star count scales with viewport area for even coverage.
      const area = w * h;
      const count = Math.min(420, Math.max(160, Math.round(area / 6000)));
      stars.length = 0;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: Math.random() * 1.3 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.8,
          bright: Math.random(),
        });
      }
      glows.length = 0;
      const hues = [
        '70,110,255', // blue
        '120,90,220', // violet
        '201,162,39', // gold
        '40,80,200', // deep blue
      ];
      for (let i = 0; i < 5; i++) {
        glows.push({
          x: Math.random(),
          y: Math.random(),
          r: 0.22 + Math.random() * 0.24,
          vx: (Math.random() - 0.5) * 0.00005,
          vy: (Math.random() - 0.5) * 0.00005,
          hue: hues[i % hues.length],
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // Drifting nebula glows
      glows.forEach((g) => {
        g.x += g.vx;
        g.y += g.vy;
        if (g.x < -0.1 || g.x > 1.1) g.vx *= -1;
        if (g.y < -0.1 || g.y > 1.1) g.vy *= -1;
        const cx = g.x * w;
        const cy = g.y * h;
        const rad = g.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grad.addColorStop(0, `rgba(${g.hue},0.06)`);
        grad.addColorStop(1, `rgba(${g.hue},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      // Twinkling stars
      stars.forEach((s) => {
        const tw = reducedMotion
          ? 0.7
          : 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
        ctx.beginPath();
        if (s.bright > 0.85) {
          ctx.fillStyle = `rgba(201,162,39,${tw * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(255,255,255,${tw * 0.85})`;
        }
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    if (reducedMotion) {
      // Static single paint.
      draw(0);
    } else {
      const animate = (t: number) => {
        raf = requestAnimationFrame(animate);
        draw(t);
      };
      raf = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
