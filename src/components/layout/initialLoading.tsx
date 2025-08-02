import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "../style/InitialLoading.module.css";

const LOADING_NODES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  angle: (i * 45),
  delay: i * 0.1,
}));

export default function InitialLoading() {

  const container = useRef<HTMLDivElement>(null);
  const centerCore = useRef<HTMLDivElement>(null);
  const scanLine = useRef<HTMLDivElement>(null);
  const dataStream = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(centerCore.current, {
      scale: 1.2,
      duration: 0.8,
      ease: "power2.inOut",
      yoyo: true,
      repeat: 1
    });

    // Scan line sweep
    tl.to(scanLine.current, {
      rotation: 360,
      duration: 2,
      ease: "power1.inOut"
    }, 0);

    
    tl.to(dataStream.current, {
      backgroundPosition: "200px 0px",
      duration: 1.5,
      ease: "none"
    }, 0);

    LOADING_NODES.forEach((node, i) => {
      const nodeEl = container.current?.querySelector(`.${styles.loadingNode}:nth-child(${i + 1})`) as HTMLElement;
      if (nodeEl) {
        tl.to(nodeEl, {
          scale: 1.3,
          opacity: 1,
          duration: 0.2,
          ease: "back.out(2)"
        }, node.delay)
        .to(nodeEl, {
          scale: 1,
          opacity: 0.7,
          duration: 0.2
        }, "+=0.1");
      }
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.circuitGrid} />
      
      {/* Loading Ring */}
      <div className={styles.loadingRing}>
        {LOADING_NODES.map((node) => (
          <div
            key={node.id}
            className={styles.loadingNode}
            style={{
              transform: `rotate(${node.angle}deg) translateY(-60px) rotate(-${node.angle}deg)`
            }}
          />
        ))}
        
        {/* Center Core */}
        <div ref={centerCore} className={styles.centerCore}>
          <div className={styles.coreInner} />
        </div>
        
              
      {/* Data Stream */}
      <div ref={dataStream} className={styles.dataStream} />
      
      {/* Loading Text */}
      <div className={styles.loadingText}>
        <span className={styles.textPrimary}>INITIALIZING</span>
        
        <div className={styles.loadingDots}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
      </div>
      
      {/* Status Indicators */}
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <div className={styles.statusDot} />
          <span>E-COMMERCE</span>
        </div>
        <div className={styles.statusItem}>
          <div className={styles.statusDot} />
          <span>MARKERPLACE</span>
        </div>
        <div className={styles.statusItem}>
          <div className={styles.statusDot} />
          <span>ONLINE SHOP</span>
        </div>
      </div>
    </div>
    
  );
}