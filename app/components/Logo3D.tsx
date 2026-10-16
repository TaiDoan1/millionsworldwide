"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Logo3DProps {
  className?: string;
  priority?: boolean;
}

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
          // Apply friction damping
          velocityRef.current.x *= Math.pow(0.93, dt / 16);
        } else {
          velocityRef.current.x = 0;
          // Continuous auto-rotation
          rotationRef.current.y += baseSpeed * dt;
        }

        // Smoothly spring tilt back towards 0
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

    // Drag horizontally to rotate around Y
    rotationRef.current.y += deltaX * 0.8;
    // Drag vertically to tilt around X (clamped between -35° and 35°)
    rotationRef.current.x = Math.max(
      -35,
      Math.min(35, rotationRef.current.x - deltaY * 0.45)
    );

    // Compute velocity for inertia fling
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

    // Cap velocity so it doesn't spin uncontrollably
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
      title="Nhấn và kéo để xoay logo 3D"
      aria-label="Interactive 3D Millions Logo"
    >
      <div
        ref={modelRef}
        className="relative w-full h-full transition-transform ease-out will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Center metallic edge plate to give thickness when turning edge-on */}
        <div
          className="absolute inset-0 select-none pointer-events-none"
          style={{
            transform: "translateZ(0px)",
            filter: "brightness(0.65) contrast(1.2)",
          }}
        >
          <Image
            src="/logo-spin.png"
            alt=""
            fill
            sizes="160px"
            className="object-contain"
            aria-hidden="true"
            draggable={false}
          />
        </div>

        {/* Back face: Exactly identical to front face, rotated 180deg around Y so it faces backwards */}
        {/* When the medallion turns 180deg, this face turns towards the user, 100% upright and identical */}
        <div
          className="absolute inset-0 select-none pointer-events-none [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg) translateZ(2px)" }}
        >
          <Image
            src="/logo-spin.png"
            alt="MILLIONS"
            fill
            sizes="160px"
            className="object-contain drop-shadow-[0_8px_24px_rgba(255,255,255,0.25)] select-none pointer-events-none"
            priority={priority}
            draggable={false}
          />
        </div>

        {/* Front face: Exactly identical, facing forward */}
        <div
          className="absolute inset-0 select-none pointer-events-none [backface-visibility:hidden]"
          style={{ transform: "translateZ(2px)" }}
        >
          <Image
            src="/logo-spin.png"
            alt="MILLIONS"
            fill
            sizes="160px"
            className="object-contain drop-shadow-[0_8px_24px_rgba(255,255,255,0.25)] select-none pointer-events-none"
            priority={priority}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
