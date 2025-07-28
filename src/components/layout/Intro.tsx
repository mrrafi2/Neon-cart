// the only tsx component for designing a cool intro

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

const SHAPES = [
  { type: "cube", color: "#00fff7" },
  { type: "sphere", color: "#ff00e1" },
  { type: "pyramid", color: "#ffe600" },
  { type: "hexagon", color: "#00ff80" },
];

const neonGradient = [
  "linear-gradient(90deg, #00fff7 0%, #ff00e1 50%, #ffe600 100%)",
  "linear-gradient(90deg, #00ff80 0%, #ffe600 50%, #00fff7 100%)",
];

const easeExpo = "expo.inOut";
const easeBack = "back.out(1.7)";

export function IntroAnimation({ onComplete }: { onComplete?: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const blackout = useRef<HTMLDivElement>(null);
  const spark = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const shapes = useRef<(HTMLDivElement | null)[]>([]);
  const logo = useRef<HTMLDivElement>(null);
  const tagline = useRef<HTMLDivElement>(null);
  const flare = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { force3D: true },
      onComplete,
    });

    // --- 0.0–0.5s “Blackout & Spark” ---
    tl.set(container.current, { opacity: 1 });
    tl.set([spark.current, camera.current, ...shapes.current, logo.current, tagline.current, flare.current], { opacity: 0 });
    tl.set(blackout.current, { opacity: 1 });

    tl.to(blackout.current, { opacity: 0, duration: 0.05, delay: 0.15 }); // 3 frames blackout (~0.05s at 60fps)
    tl.to(spark.current, {
      opacity: 1,
      scale: 1.7,
      filter: "brightness(2)",
      duration: 0.05,
      ease: "power2.in",
    }, 0.18)
      .to(spark.current, { opacity: 0, scale: 0.9, filter: "none", duration: 0.08 }, "+=0.03");

    // --- 0.5–1.5s “Wormhole Camera” ---
    tl.to(camera.current, {
      opacity: 1,
      scale: 2.5,
      x: 80,
      y: -50,
      filter: "blur(10px)",
      duration: 0.01,
      ease: easeExpo,
    }, 0.5)
      .to(camera.current, {
        scale: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        duration: 1.0,
        ease: easeExpo,
      }, "<");

    // --- 1.5–2.5s “Neon Shapes Explode” ---
    SHAPES.forEach((shape, i) => {
      tl.to(shapes.current[i], {
        opacity: 1,
        scale: 1,
        x: i * 70 - 105, // spread out
        y: [-15, 10, -10, 20][i],
        filter: "drop-shadow(0 0 12px " + shape.color + ")",
        duration: 0.45,
        ease: easeBack,
      }, 1.5 + i * 0.2)
      .to(shapes.current[i], {
        filter: "drop-shadow(0 0 24px " + shape.color + ")",
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      }, "+=0.18");
    });

    // --- 2.5–3.5s “Logo Emerges” ---
    tl.to(logo.current, {
      opacity: 1,
      scale: 0.4,
      rotateY: 70,
      duration: 0.01,
      ease: "none",
    }, 2.5)
      .to(logo.current, {
        scale: 1,
        rotateY: 0,
        duration: 0.8,
        ease: easeExpo,
      }, "<")
      .to(logo.current, {
        background: neonGradient[1],
        duration: 0.09,
        repeat: 3,
        yoyo: true,
        ease: "power1.inOut",
      }, "<+0.1");

    tl.to(flare.current, {
      opacity: 1,
      scale: 1.5,
      duration: 0.6,
      ease: "power2.out",
    }, 3.5)
      .to(flare.current, { opacity: 0, duration: 0.2 }, "+=0.7");

   
tl.set(tagline.current, { opacity: 1 }, 3.7);

const tagSpans = tagline.current?.children || [];

Array.from(tagSpans).forEach((spanEl, i) => {
  tl.from(
    spanEl,
    { y: -40, opacity: 0, duration: 0.22, ease: "power3.out" },
    3.7 + i * 0.04
  );
});


    // --- 4.5–5.0s “Pulse & Fade” ---
    tl.to([logo.current, ...shapes.current], {
      scale: 1.1,
      duration: 0.18,
      ease: "power2.in",
    }, 4.5)
      .to([logo.current, ...shapes.current], {
        scale: 1,
        duration: 0.07,
        ease: "power2.out",
      }, "+=0.16");
    tl.to(container.current, { opacity: 0, duration: 0.3, ease: "power2.in" }, 4.7);

    // Optionally play sound at logo reveal
    // const logoSound = new Audio("/sounds/zap.mp3");
    // logoSound.play();

    // eslint-disable-next-line
  }, []);

  return (
    <div
      ref={container}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#111",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Blackout Layer */}
      <div
        ref={blackout}
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          zIndex: 3,
          opacity: 1,
        }}
      />
      {/* Spark */}
      <div
        ref={spark}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff 0%, #00fff7 60%, transparent 100%)",
          transform: "translate(-50%, -50%)",
          opacity: 0,
          zIndex: 4,
        }}
      />

      {/* Camera Layer */}
      <div
        ref={camera}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 420,
          height: 220,
          background: "rgba(17, 17, 17, 0.41)",
          borderRadius: "24px",
          boxShadow: "0 0 60px #00fff7, 0 0 120px #ff00e1",
          transform: "translate(-50%, -50%) scale(2.5)",
          opacity: 0,
          zIndex: 2,
          overflow: "visible",
        }}
      >
        {/* Neon Shapes */}
        {SHAPES.map((shape, i) => (
          <div
            key={shape.type}
            ref={el => (shapes.current[i] = el)}
            style={{
              position: "absolute",
              top: 90 + i * 10,
              left: 60 + i * 80,
              width: 48,
              height: 48,
              opacity: 0,
              transform: "scale(0.6)",
              filter: `drop-shadow(0 0 0px ${shape.color})`,
              zIndex: 7,
              ...getShapeStyle(shape.type, shape.color),
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div
        ref={logo}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) scale(0.4) rotateY(70deg)",
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: 1.4,
          color: "#fff",
          background: neonGradient[0],
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 32px #00fff7, 0 0 10px #ff00e1",
          opacity: 0,
          zIndex: 8,
        }}
      >
        NeonCart
      </div>

      {/* Lens Flare */}
      <div
        ref={flare}
        style={{
          position: "absolute",
          left: "50%",
          top: "60%",
          width: 340,
          height: 120,
          transform: "translate(-50%, -50%) scale(1.2)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, #fff 0%, #ffe600 65%, transparent 100%)",
          opacity: 0,
          zIndex: 18,
          pointerEvents: "none",
        }}
      />

      {/* Tagline */}
      <div
        ref={tagline}
        style={{
          position: "absolute",
          left: "50%",
          top: "68%",
          transform: "translate(-50%, -50%)",
          fontSize: 26,
          fontWeight: 500,
          color: "#fff",
          letterSpacing: 1.1,
          opacity: 0,
          zIndex: 10,
          display: "flex",
        }}
      >
        {"Your Marketplace, Electrified".split("").map((char, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: char === " " ? 8 : 0,
              opacity: 1,
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

// Helper: returns CSS for shapes
function getShapeStyle(type: string, color: string) {
  switch (type) {
    case "cube":
      return {
        background: color,
        boxShadow: "0 0 20px " + color,
        borderRadius: "8px",
      };
    case "sphere":
      return {
        background: `radial-gradient(circle, ${color} 60%, #111 100%)`,
        borderRadius: "50%",
        boxShadow: "0 0 20px " + color,
      };
    case "pyramid":
      return {
        width: 0,
        height: 0,
        borderLeft: "24px solid transparent",
        borderRight: "24px solid transparent",
        borderBottom: `48px solid ${color}`,
        background: "none",
        boxShadow: "0 0 20px " + color,
        borderRadius: 0,
      };
    case "hexagon":
      return {
        clipPath: "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
        background: color,
        boxShadow: "0 0 20px " + color,
      };
    default:
      return {};
  }
}