import Image from "next/image";

interface Logo3DProps {
  className?: string;
  priority?: boolean;
}

export default function Logo3D({
  className = "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24",
  priority = false,
}: Logo3DProps) {
  // Layer offsets along Z-axis (in pixels) for true 3D extrusion thickness
  const layers = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

  return (
    <div
      className={`relative select-none pointer-events-none [perspective:1000px] ${className}`}
      aria-label="Millions Worldwide 3D Logo"
    >
      <div className="relative w-full h-full [transform-style:preserve-3d] animate-spin-3d">
        {/* Extruded metallic depth layers */}
        {layers.map((z) => {
          const depth = Math.abs(z);
          // Darker towards center for metallic rim bevel
          const brightness = 0.55 + (1 - depth / 4) * 0.35;
          return (
            <div
              key={z}
              className="absolute inset-0"
              style={{
                transform: `translateZ(${z}px)`,
                filter: `brightness(${brightness}) contrast(1.15)`,
                opacity: 0.85,
              }}
            >
              <Image
                src="/logo-spin.png"
                alt=""
                fill
                sizes="120px"
                className="object-contain"
                aria-hidden="true"
              />
            </div>
          );
        })}

        {/* Back face (rotated 180deg around Y, so it renders upright when turned to the back) */}
        <div
          className="absolute inset-0 [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg) translateZ(5px)" }}
        >
          <Image
            src="/logo-spin.png"
            alt="MILLIONS"
            fill
            sizes="120px"
            className="object-contain drop-shadow-[0_6px_18px_rgba(255,255,255,0.25)]"
            priority={priority}
          />
        </div>

        {/* Front face */}
        <div
          className="absolute inset-0 [backface-visibility:hidden]"
          style={{ transform: "translateZ(5px)" }}
        >
          <Image
            src="/logo-spin.png"
            alt="MILLIONS"
            fill
            sizes="120px"
            className="object-contain drop-shadow-[0_6px_18px_rgba(255,255,255,0.25)]"
            priority={priority}
          />
        </div>
      </div>
    </div>
  );
}
