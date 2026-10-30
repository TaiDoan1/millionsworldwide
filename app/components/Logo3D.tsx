"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Logo3DProps {
  className?: string;
  priority?: boolean;
  /** When false, the logo stands still instead of slowly rotating. */
  spin?: boolean;
}

// 86 contour boundary points extracted from the logo
const LOGO_POINTS: [number, number][] = [
  [-20.2, 18.5], [-9.1, 18.5], [-8.8, 18.3], [-8.6, -4.7], [-8.3, -4.6],
  [-6.5, -2.6], [-5.4, -0.9], [-5.3, 7.4], [-5.0, 11.0], [-4.5, 12.7],
  [-4.0, 13.7], [-3.3, 14.7], [-1.4, 16.5], [0.7, 17.7], [2.7, 18.3],
  [5.4, 18.4], [5.6, 18.2], [5.4, 14.2], [5.4, 8.5], [5.6, 8.4],
  [10.9, 13.8], [12.5, 15.1], [14.7, 16.5], [16.9, 17.5], [18.9, 18.1],
  [21.9, 18.5], [24.0, 18.5], [24.2, 18.3], [24.1, 15.8], [22.1, 15.5],
  [20.3, 14.6], [19.4, 13.7], [18.5, 12.2], [18.0, 9.9], [18.1, -12.1],
  [18.4, -13.2], [19.0, -14.3], [20.2, -15.3], [21.7, -15.9], [21.7, -18.3],
  [21.2, -18.5], [8.6, -18.5], [8.0, -18.3], [7.9, -17.4], [8.6, -15.4],
  [8.6, 6.6], [8.4, 6.8], [8.2, 6.8], [5.4, 3.8], [5.3, -7.9],
  [4.7, -11.0], [3.7, -13.2], [3.1, -14.1], [1.5, -15.8], [0.1, -16.9],
  [-1.8, -17.9], [-3.1, -18.3], [-4.5, -18.5], [-5.5, -18.5], [-6.0, -18.3],
  [-6.1, -17.2], [-5.5, -15.8], [-5.3, -14.6], [-5.3, -6.2], [-5.6, -6.0],
  [-9.6, -10.5], [-12.7, -13.6], [-15.6, -15.8], [-18.4, -17.3], [-20.0, -17.9],
  [-22.8, -18.4], [-25.2, -18.3], [-25.2, -15.7], [-23.3, -15.1], [-21.7, -14.1],
  [-19.9, -12.0], [-19.1, -9.7], [-19.0, 12.8], [-19.2, 13.8], [-19.6, 14.6],
  [-20.4, 15.4], [-21.0, 15.7], [-22.2, 15.9], [-22.4, 16.6], [-22.2, 18.4],
  [-20.3, 18.4],
];

export default function Logo3D({
  className = "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28",
  spin = true,
}: Logo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 100;
    const height = container.clientHeight || 100;

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.z = 74;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // PROCEDURAL STUDIO REFLECTION MAP (for hyper-realistic chrome gleam)
    const envCanvas = document.createElement("canvas");
    envCanvas.width = 512;
    envCanvas.height = 256;
    const ctx = envCanvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.2, "#888888");
      grad.addColorStop(0.5, "#151515");
      grad.addColorStop(0.8, "#0a0a0a");
      grad.addColorStop(1, "#555555");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Studio vertical light highlights
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(140, 0, 50, 256);
      ctx.fillRect(320, 0, 40, 256);
    }
    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(40, 50, 60);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(-40, -30, -50);
    scene.add(rimLight);

    // BUILD SINGLE 3D MESH
    const shape = new THREE.Shape();
    shape.moveTo(LOGO_POINTS[0][0], LOGO_POINTS[0][1]);
    for (let i = 1; i < LOGO_POINTS.length; i++) {
      shape.lineTo(LOGO_POINTS[i][0], LOGO_POINTS[i][1]);
    }
    shape.closePath();

    // True solid 3D extrusion with smooth beveled edges
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 4.5,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.7,
      bevelThickness: 0.7,
    });

    // Map planar UV coordinates for the front and back face
    const pos = geometry.attributes.position;
    const uvs = geometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      uvs.setXY(i, (x * 10 + 256) / 512, (y * 10 + 256) / 512);
    }
    geometry.center();

    // Texture for front & back face
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load("/logo-spin.png");
    logoTexture.colorSpace = THREE.SRGBColorSpace;

    // Materials: Material 0 = Front & Back faces, Material 1 = Extrusion side walls
    const faceMaterial = new THREE.MeshStandardMaterial({
      map: logoTexture,
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 1.5,
    });

    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.98,
      roughness: 0.15,
      envMapIntensity: 1.8,
    });

    const mesh = new THREE.Mesh(geometry, [faceMaterial, sideMaterial]);
    const group = new THREE.Group();
    group.add(mesh);
    scene.add(group);

    // ANIMATION & INTERACTION LOOP
    let animId: number;
    let lastTimestamp = performance.now();
    const baseSpeed = (Math.PI * 2) / 7; // 1 full rotation every 7 seconds

    const animate = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05);
      lastTimestamp = now;

      if (!isDraggingRef.current && spin) {
        // Fling inertia damping
        if (Math.abs(velocityRef.current.x) > 0.001) {
          rotationRef.current.y += velocityRef.current.x * dt;
          velocityRef.current.x *= Math.pow(0.92, dt * 60);
        } else {
          velocityRef.current.x = 0;
          rotationRef.current.y += baseSpeed * dt;
        }

        // Return vertical tilt smoothly to 0
        rotationRef.current.x *= Math.pow(0.9, dt * 60);
      }

      group.rotation.x = rotationRef.current.x;
      group.rotation.y = rotationRef.current.y;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 100;
      const h = container.clientHeight || 100;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      geometry.dispose();
      faceMaterial.dispose();
      sideMaterial.dispose();
      logoTexture.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, [spin]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!spin) return;
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
    const dt = Math.max((now - lastTimeRef.current) / 1000, 0.001);
    const deltaX = e.clientX - lastPosRef.current.x;
    const deltaY = e.clientY - lastPosRef.current.y;

    rotationRef.current.y += deltaX * 0.015;
    rotationRef.current.x = Math.max(
      -0.6,
      Math.min(0.6, rotationRef.current.x - deltaY * 0.008)
    );

    velocityRef.current = {
      x: (deltaX * 0.015) / dt,
      y: (-deltaY * 0.008) / dt,
    };

    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsGrabbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const maxVel = 8.0;
    velocityRef.current.x = Math.max(
      -maxVel,
      Math.min(maxVel, velocityRef.current.x)
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none ${
        !spin
          ? "cursor-default"
          : isGrabbing
            ? "cursor-grabbing"
            : "cursor-grab"
      } ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title={spin ? "Nhấn và kéo để xoay logo 3D" : undefined}
      aria-label="Interactive 3D Millions Logo"
    />
  );
}
