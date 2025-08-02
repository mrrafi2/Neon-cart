import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import styles from '../style/cartAnimation.module.css';

export default function CartAnimation({ queue, onDone }) {
  const containerRef = useRef(null);

  useEffect(() => {
    queue.forEach(({ key, imageUrl }) => {
      // Create thumbnail element
      const thumb = document.createElement('img');
      thumb.src = imageUrl;
      thumb.className = styles.thumb;
      containerRef.current.appendChild(thumb);

      // Create robotic cart container
      const cartContainer = document.createElement('div');
      cartContainer.className = styles.cartContainer;
      
      // Create cart body
      const cart = document.createElement('div');
      cart.className = styles.cart;
      
      // Create cart wheels
      const wheel1 = document.createElement('div');
      wheel1.className = styles.wheel;
      const wheel2 = document.createElement('div');
      wheel2.className = styles.wheel;
      
      // Create electric sparks
      const sparks = document.createElement('div');
      sparks.className = styles.sparks;
      for (let i = 0; i < 6; i++) {
        const spark = document.createElement('div');
        spark.className = styles.spark;
        sparks.appendChild(spark);
      }
      
      // Create neon bag
      const bag = document.createElement('div');
      bag.className = styles.neonBag;
      
      // Create bag glow effect
      const bagGlow = document.createElement('div');
      bagGlow.className = styles.bagGlow;
      bag.appendChild(bagGlow);
      
      // Assemble cart
      cart.appendChild(wheel1);
      cart.appendChild(wheel2);
      cartContainer.appendChild(cart);
      cartContainer.appendChild(sparks);
      cartContainer.appendChild(bag);
      
      containerRef.current.appendChild(cartContainer);

      const tl = gsap.timeline({
        onComplete: () => {
          // Cleanup elements and notify
          thumb.remove();
          cartContainer.remove();
          onDone(key);
          tl.kill();
        }
      });

      // Set initial positions
      tl.set(thumb, { 
        x: -100, 
        y: -100, 
        scale: 0.8, 
        rotation: -15,
        opacity: 1 
      });
      
      tl.set(cartContainer, { 
        x: window.innerWidth - 100, 
        y: 30, 
        scale: 0.3, 
        opacity: 0 
      });
      
      tl.set(bag, { scale: 0, opacity: 0 });

      // Animate thumbnail flying in with trail effect
      tl.to(thumb, {
        x: window.innerWidth - 120,
        y: 50,
        scale: 0.4,
        rotation: 360,
        duration: 1.2,
        ease: 'power2.out',
        motionPath: {
          path: `M-100,-100 Q${window.innerWidth/2},${window.innerHeight/3} ${window.innerWidth - 120},50`,
          autoRotate: true
        }
      });

      // Cart dramatic entrance with electric effects
      tl.to(cartContainer, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(2)',
        onStart: () => {
          // Trigger wheel rotation
          gsap.to([wheel1, wheel2], {
            rotation: 720,
            duration: 2,
            ease: 'power2.out'
          });
          
          // Trigger spark effects
          gsap.to(sparks.children, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            stagger: 0.05,
            yoyo: true,
            repeat: 3
          });
        }
      }, '-=0.6');

      // Thumbnail enters cart with magnetic effect
      tl.to(thumb, {
        x: window.innerWidth - 100,
        y: 45,
        scale: 0.2,
        rotation: 720,
        duration: 0.4,
        ease: 'power3.in'
      }, '-=0.2');

      // Cart catches item with satisfaction bounce
      tl.to(cart, {
        scale: 1.2,
        duration: 0.1,
        ease: 'power2.out'
      })
      .to(cart, {
        scale: 1,
        duration: 0.2,
        ease: 'elastic.out(1, 0.5)'
      });

      // Neon bag materializes around cart
      tl.to(bag, {
        scale: 1,
        opacity: 0.9,
        duration: 0.5,
        ease: 'back.out(1.5)',
        onStart: () => {
          // Bag glow pulse effect
          gsap.to(bagGlow, {
            scale: 1.5,
            opacity: 0.8,
            duration: 0.3,
            yoyo: true,
            repeat: 2,
            ease: 'power2.inOut'
          });
        }
      }, '+=0.3');

      // Success pulse and fade
      tl.to(cartContainer, {
        scale: 1.1,
        duration: 0.2,
        ease: 'power2.out'
      }, '+=0.2')
      .to(cartContainer, {
        scale: 1,
        duration: 0.1
      })
      .to(cartContainer, {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: 'power2.in'
      }, '+=0.3');
    });
  }, [queue, onDone]);

  return createPortal(
    <div ref={containerRef} className={styles.animationContainer} />, 
    document.body
  );
}