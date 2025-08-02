import React, { createContext, useContext, useState, useCallback } from 'react';
import CartAnimation from '../components/common/CartAnimation';

const CartAnimationContext = createContext({
  trigger: (product) => {},
});

export function useCartAnimation() {
  return useContext(CartAnimationContext);
}

// provider that wraps the app and renders the CartAnimation component
export function CartAnimationProvider({ children }) {
  const [queue, setQueue] = useState([]);

  // adds a product to the animation queue with a unique key
  const trigger = useCallback((product) => {
    setQueue((q) => [...q, { ...product, key: Date.now() }]);
  }, [ ] );

  // removes an animation entry once it's done
  const handleDone= useCallback((key) => {
    setQueue( (q) => q.filter((item) => item.key !== key));
  }, [] );

  return (
    <CartAnimationContext.Provider value={{ trigger }}>
      {children}
      {/* renderer for queued animations */}
      <CartAnimation queue={queue} onDone={handleDone} />

    </CartAnimationContext.Provider>
  );
}
