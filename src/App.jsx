// the heart of Neon-Cart

import "./App.css";
import { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import InitialLoading from "./components/layout/initialLoading";  
import DataLoader from "./components/common/dataLoad";              
import { IntroAnimation } from "./components/layout/Intro";      
import { fetchProducts } from "./data/fetchProductData";
import { BrowserRouter } from "react-router-dom";
import MainRouter from "./router";
import ScrollToTop from "./components/common/scrollToTop";

function App() {

  const [initialLoading, setInitialLoading] = useState(true);
  const [initialProducts, setInitialProducts] = useState(null);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchProducts()
        .then((products) => setInitialProducts(products))
        .catch((err) => {
          console.error("fetch failed:", err);
          setInitialProducts([]); // fail gracefully
        });
    }
  }, [initialLoading]);

  if (initialLoading) {
    return <InitialLoading />;
  }

  if (initialProducts === null) {
    return <DataLoader />;
  }

  if (!introDone) {
    return <IntroAnimation onComplete={() => setIntroDone(true)} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <MainRouter />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
