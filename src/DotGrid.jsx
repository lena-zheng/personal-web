import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import './DotGrid.css';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const hexToRgb = (hex) => {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

  if (!match) {
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
};

export default function DotGrid({
  dotSize = 3,
  gap = 22,
  baseColor = '#332c47',
  activeColor = '#7b68ff',
  proximity = 150,
  speedTrigger = 850,
  shockRadius = 190,
  shockStrength = 0.055,
  returnSpeed = 0.08,
  friction = 0.9,
  className = '',
}) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const pointerRef = useRef({
    x: -9999,
    y: -9999,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    speed: 0,
    inside: false,
  });

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const buildGrid = useCallback(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) {
      return;
    }

    const { width, height } = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const cell = dotSize + gap;
    const cols = Math.max(1, Math.floor((width + gap) / cell));
    const rows = Math.max(1, Math.floor((height + gap) / cell));
    const gridWidth = cols * cell - gap;
    const gridHeight = rows * cell - gap;
    const startX = (width - gridWidth) / 2 + dotSize / 2;
    const startY = (height - gridHeight) / 2 + dotSize / 2;

    dotsRef.current = Array.from({ length: rows * cols }, (_, index) => {
      const x = index % cols;
      const y = Math.floor(index / cols);

      return {
        cx: startX + x * cell,
        cy: startY + y * cell,
        xOffset: 0,
        yOffset: 0,
        vx: 0,
        vy: 0,
      };
    });
  }, [dotSize, gap]);

  useEffect(() => {
    buildGrid();

    if (!wrapperRef.current) {
      return undefined;
    }

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(buildGrid);
      observer.observe(wrapperRef.current);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', buildGrid);
    return () => window.removeEventListener('resize', buildGrid);
  }, [buildGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const updatePointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      const now = performance.now();
      const pointer = pointerRef.current;
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      const dt = pointer.lastTime ? Math.max(16, now - pointer.lastTime) : 16;
      const dx = event.clientX - pointer.lastX;
      const dy = event.clientY - pointer.lastY;

      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.lastTime = now;
      pointer.speed = inside ? Math.hypot(dx / dt, dy / dt) * 1000 : 0;
      pointer.inside = inside;

      if (!inside || pointer.speed < speedTrigger) {
        return;
      }

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y);

        if (dist < proximity) {
          const falloff = 1 - dist / proximity;
          dot.vx += (dot.cx - pointer.x + dx * 0.35) * shockStrength * falloff;
          dot.vy += (dot.cy - pointer.y + dy * 0.35) * shockStrength * falloff;
        }
      }
    };

    const shockDots = (event) => {
      const rect = canvas.getBoundingClientRect();

      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - x, dot.cy - y);

        if (dist < shockRadius) {
          const falloff = 1 - dist / shockRadius;
          dot.vx += (dot.cx - x) * shockStrength * falloff;
          dot.vy += (dot.cy - y) * shockStrength * falloff;
        }
      }
    };

    window.addEventListener('mousemove', updatePointer, { passive: true });
    window.addEventListener('click', shockDots);

    return () => {
      window.removeEventListener('mousemove', updatePointer);
      window.removeEventListener('click', shockDots);
    };
  }, [proximity, shockRadius, shockStrength, speedTrigger]);

  useEffect(() => {
    let rafId = 0;
    const proxSq = proximity * proximity;

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) {
        rafId = window.requestAnimationFrame(draw);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const pointer = pointerRef.current;

      ctx.clearRect(0, 0, width, height);

      for (const dot of dotsRef.current) {
        dot.vx += -dot.xOffset * returnSpeed;
        dot.vy += -dot.yOffset * returnSpeed;
        dot.vx *= friction;
        dot.vy *= friction;
        dot.xOffset += dot.vx;
        dot.yOffset += dot.vy;

        const x = dot.cx + dot.xOffset;
        const y = dot.cy + dot.yOffset;
        const dx = dot.cx - pointer.x;
        const dy = dot.cy - pointer.y;
        const distanceSq = dx * dx + dy * dy;
        let color = baseColor;
        let radius = dotSize / 2;

        if (pointer.inside && distanceSq <= proxSq) {
          const distance = Math.sqrt(distanceSq);
          const t = 1 - distance / proximity;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          color = `rgb(${r}, ${g}, ${b})`;
          radius += t * 1.8;
        }

        ctx.beginPath();
        ctx.arc(x, y, clamp(radius, 1, dotSize), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(rafId);
  }, [activeRgb, baseColor, baseRgb, dotSize, friction, proximity, returnSpeed]);

  return (
    <section className={`dot-grid ${className}`} aria-hidden="true">
      <div ref={wrapperRef} className="dot-grid__wrap">
        <canvas ref={canvasRef} className="dot-grid__canvas" />
      </div>
    </section>
  );
}
