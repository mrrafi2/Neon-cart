import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import styles from "../style/dataLoad.module.css";

export default function DataLoader() {
  const ring = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(ring.current, {
      rotation: "+=360",
      duration: 2,
      ease: "linear"
    });
    return () => tl.kill();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.backdrop} />

      <div className={styles.ring} ref={ring}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.node} />
        ))}
      </div>

      <div className={styles.text}>LOADING PRODUCTS…</div>
    </div>
  );
}
