"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Logo3DProps {
  className?: string;
  priority?: boolean;
}

// 8 extrusion slices (1px apart) per side = 16px clean solid 3D block thickness
const SLICES = Array.from({ length: 8 }, (_, i) => i);

export default function Logo3D({
  className = "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28",
  priority = false,
}: Logo3DProps) {
  const modelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();
    // Default auto-spin speed: 360deg in 7s (~0.051 deg/ms)
    const baseSpeed = 360 / 7000;

    const loop = (now: number) => {
      const dt = Math.min(now - lastTimestamp, 40);
      lastTimestamp = now;

      if (!isDraggingRef.current) {
        // Handle fling / momentum from drag release
        if (Math.abs(velocityRef.current.x) > 0.005) {
          rotationRef.current.y += velocityRef.current.x * dt;
          // Friction damping
          velocityRef.current.x *= Math.pow(0.93, dt / 16);
        } else {
          velocityRef.current.x = 0;
          // Smooth continuous auto-rotation
          rotationRef.current.y += baseSpeed * dt;
        }

        // Return tilt smoothly to 0
        rotationRef.current.x *= Math.pow(0.9, dt / 16);

        // Normalize Y rotation
        rotationRef.current.y = ((rotationRef.current.y % 360) + 360) % 360;

        if (modelRef.current) {
          modelRef.current.style.transform = `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    isDraggingRef.current = true;
    setIsGrabbing(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = performance.now();
    velocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 1);
    const deltaX = e.clientX - lastPosRef.current.x;
    const deltaY = e.clientY - lastPosRef.current.y;

    rotationRef.current.y += deltaX * 0.8;
    rotationRef.current.x = Math.max(
      -35,
      Math.min(35, rotationRef.current.x - deltaY * 0.45)
    );

    velocityRef.current = {
      x: (deltaX * 0.8) / dt,
      y: (-deltaY * 0.45) / dt,
    };

    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = now;

    if (modelRef.current) {
      modelRef.current.style.transform = `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsGrabbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const maxVelocity = 1.2;
    velocityRef.current.x = Math.max(
      -maxVelocity,
      Math.min(maxVelocity, velocityRef.current.x)
    );
  };

  return (
    <div
      className={`relative select-none touch-none ${
        isGrabbing ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      style={{ perspective: "1000px" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Nhấn và kéo để xoay khối logo 3D"
      aria-label="Interactive 3D Millions Logo"
    >
      <div
        ref={modelRef}
        className="relative w-full h-full will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT BLOCK: Visible when facing forward. Zero shadow, zero bleed to the back */}
        <div
          className="absolute inset-0 select-none pointer-events-none"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {SLICES.map((z) => {
            const isTop = z === SLICES.length - 1;
            // Clean metallic silver, no dark muddy gray
            const brightness = isTop ? 1 : 0.85 + (z / SLICES.length) * 0.12;
            return (
              <div
                key={`front-${z}`}
                className="absolute inset-0 select-none pointer-events-none"
                style={{
                  transform: `translateZ(${z}px)`,
                  filter: isTop ? "none" : `brightness(${brightness})`,
                }}
              >
                <Image
                  src="/logo-spin.png"
                  alt={isTop ? "MILLIONS" : ""}
                  fill
                  sizes="160px"
                  className="object-contain select-none pointer-events-none"
                  priority={priority && isTop}
                  draggable={false}
                  aria-hidden={!isTop}
                />
              </div>
            );
          })}
        </div>

        {/* BACK BLOCK: Exactly identical to front block, rotated 180deg around Y */}
        {/* Zero shadow, zero bleed, clean chrome */}
        <div
          className="absolute inset-0 select-none pointer-events-none"
          style={{
            transform: "rotateY(180deg)",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {SLICES.map((z) => {
            const isTop = z === SLICES.length - 1;
            const brightness = isTop ? 1 : 0.85 + (z / SLICES.length) * 0.12;
            return (
              <div
                key={`back-${z}`}
                className="absolute inset-0 select-none pointer-events-none"
                style={{
                  transform: `translateZ(${z}px)`,
                  filter: isTop ? "none" : `brightness(${brightness})`,
                }}
              >
                <Image
                  src="/logo-spin.png"
                  alt={isTop ? "MILLIONS" : ""}
                  fill
                  sizes="160px"
                  className="object-contain select-none pointer-events-none"
                  priority={priority && isTop}
                  draggable={false}
                  aria-hidden={!isTop}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
