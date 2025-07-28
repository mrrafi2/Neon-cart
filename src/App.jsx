// the heart of Neon-Cart

import "./App.css";
import { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { IntroAnimation } from "./components/layout/Intro";
import LoadingSpinner from "./components/common/loading";
import { fetchProducts } from "./data/fetchProductData";
import { BrowserRouter } from "react-router-dom";
import MainRouter  from "./router";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [initialProducts, setInitialProducts] = useState(null);

  useEffect(() => {
    fetchProducts()
      .then((products) => setInitialProducts(products))
      .catch((err) => console.error("Prefetch failed:", err));
  }, []);

  const handleIntro = () => setShowIntro(false);

  if (initialProducts === null) return <LoadingSpinner />;

  return (
    <>
      {showIntro ? (
        <IntroAnimation onComplete={handleIntro} />
      ) : (
        <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <MainRouter />
          </CartProvider>
        </AuthProvider>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
