import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import styles from "../style/IntroAnimation.module.css"

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  delay: i * 0.08,
  angle: (i * 30) % 360,
}));

const CIRCUIT_NODES = [
  { x: 20, y: 30, size: 8 },
  { x: 80, y: 25, size: 12 },
  { x: 35, y: 70, size: 10 },
  { x: 65, y: 75, size: 14 },
  { x: 50, y: 50, size: 16 },
];

export function IntroAnimation({ onComplete }: { onComplete?: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const blackout = useRef<HTMLDivElement>(null);
  const gridOverlay = useRef<HTMLDivElement>(null);
  const particleContainer = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const subtitle = useRef<HTMLDivElement>(null);
  const circuitBoard = useRef<HTMLDivElement>(null);
  const hologram = useRef<HTMLDivElement>(null);
  const electricArc = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { force3D: true },
      onComplete,
    });

    // Initial setup
    tl.set(container.current, { opacity: 1 });
    tl.set([gridOverlay.current, logo.current, subtitle.current, circuitBoard.current, hologram.current, electricArc.current], { opacity: 0 });
    tl.set(blackout.current, { opacity: 1 });

    // 0.0-0.3s: Blackout flash & grid emergence
    tl.to(blackout.current, { opacity: 0, duration: 0.1, ease: "power2.inOut" })
      .to(gridOverlay.current, { 
        opacity: 1, 
        scale: 1,
        duration: 0.2, 
        ease: "power3.out" 
      }, 0.1);

    // 0.3-0.8s: Circuit board activation
    tl.to(circuitBoard.current, {
      opacity: 1,
      scale: 1,
      rotationZ: 360,
      duration: 0.5,
      ease: "back.out(1.7)"
    }, 0.3);

    // 0.8-1.3s: Particle explosion
    PARTICLES.forEach((particle, i) => {
      const particleEl = particleContainer.current?.children[i] as HTMLElement;
      if (particleEl) {
        tl.to(particleEl, {
          opacity: 1,
          scale: 1.5,
          x: Math.cos(particle.angle * Math.PI / 180) * 150,
          y: Math.sin(particle.angle * Math.PI / 180) * 150,
          duration: 0.4,
          ease: "power2.out"
        }, 0.8 + particle.delay)
        .to(particleEl, {
          opacity: 0,
          scale: 0.5,
          duration: 0.1
        }, "+=0.1");
      }
    });

    // 1.3-1.8s: Electric arc & hologram
    tl.to(electricArc.current, {
      opacity: 1,
      scaleX: 1,
      duration: 0.2,
      ease: "power3.inOut"
    }, 1.3)
    .to(hologram.current, {
      opacity: 0.8,
      scale: 1.2,
      duration: 0.3,
      ease: "elastic.out(1, 0.5)"
    }, 1.4);

    // 1.8-2.3s: Logo dramatic entrance
    tl.fromTo(logo.current, {
      scale: 0.3,
      rotationY: 180,
      z: -200,
      opacity: 0
    }, {
      opacity: 1,
      scale: 1,
      rotationY: 0,
      z: 0,
      duration: 0.6,
      ease: "back.out(2.5)",
      onStart: () => {
        // Add dramatic camera shake
        gsap.to(container.current, {
          x: 2,
          duration: 0.05,
          yoyo: true,
          repeat: 5,
          ease: "power2.inOut"
        });
      }
    }, 1.8);

    // Add "ADDED TO CART" success message
    tl.to(subtitle.current, {
      innerHTML: "ITEM SECURED • QUANTUM ENCRYPTED",
      color: "#00ff80",
      duration: 0.1
    }, 2.0);

    // 2.3-2.6s: Enhanced subtitle effect
    tl.to(subtitle.current, {
      opacity: 1,
      y: 0,
      scale: 1.05,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)"
    }, 2.3);

    // Add shopping confirmation pulse
    tl.to([logo.current, circuitBoard.current], {
      filter: "brightness(1.3) saturate(1.2)",
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    }, 2.4);

    // 2.6-2.8s: Enhanced final sequence
    tl.to([logo.current, circuitBoard.current], {
      scale: 1.1,
      duration: 0.15,
      ease: "power2.inOut"
    }, 2.6)
    .to([logo.current, circuitBoard.current], {
      scale: 1,
      duration: 0.15,
      ease: "elastic.out(1, 0.3)"
    }, "+=0.05")
    .to(subtitle.current, {
      innerHTML: "WELCOME TO NEONCART",
      color: "#00fff7",
      scale: 1,
      duration: 0.1
    }, 2.65)
    .to(container.current, {
      opacity: 0,
      duration: 0.15,
      ease: "power2.in"
    }, 2.7);

  }, [onComplete]);

  return (
    <div ref={container} className={styles.container}>
      {/* Blackout */}
      <div ref={blackout} className={styles.blackout} />
      
      {/* Animated Grid Overlay */}
      <div ref={gridOverlay} className={styles.gridOverlay}>
        <div className={styles.gridLines} />
      </div>

      {/* Circuit Board */}
      <div ref={circuitBoard} className={styles.circuitBoard}>
        {CIRCUIT_NODES.map((node, i) => (
          <div
            key={i}
            className={styles.circuitNode}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
            }}
          />
        ))}
        <div className={styles.circuitLines} />
      </div>

      {/* Particle Container */}
      <div ref={particleContainer} className={styles.particleContainer}>
        {PARTICLES.map((particle) => (
          <div key={particle.id} className={styles.particle} />
        ))}
      </div>

      {/* Electric Arc */}
      <div ref={electricArc} className={styles.electricArc} />

      {/* Hologram Effect */}
      <div ref={hologram} className={styles.hologram} />

      {/* Logo */}
      <div ref={logo} className={styles.logo}>
        <span className={styles.logoText}>NEONCART</span>
        <div className={styles.logoGlow} />
      </div>

      {/* Subtitle */}
      <div ref={subtitle} className={styles.subtitle}>
        NEON MARKETPLACE ACTIVATED
      </div>
    </div>
  );
}