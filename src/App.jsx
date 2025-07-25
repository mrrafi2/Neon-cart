import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/layout/layout";
import Home from "./components/pages/home";
import Login from "./components/auth/login";
import Signup from "./components/auth/signup";
import Sell from "./components/seller/sellProduct";
import ProductDetail from "./components/productRelated/productDetail";
import Products from "./components/productRelated/products";
import BuyNow from "./components/buyer/buy";
import SellerApply from "./components/common/sellerApply";
import SellerDashboard from "./components/seller/sellerDash";
import ScrollToTop from "./components/common/scrollToTop";
import SearchResults from "./components/search/searchresult";
import PrivateRoute from "./components/common/PrivateRoute";
import PrivateSellerRoute from "./components/seller/sellerRoute";
import Contact from "./components/pages/contact";
import About from "./components/pages/about";
import HelpFAQ from "./components/pages/help";
import {CartProvider} from "./contexts/CartContext"

function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  const location = useLocation();

  const noLayoutPages = ["/login", "/signup", "/sell", "/seller-dashboard", "/buy","/contact","/about","/help", "/seller-apply", "/admin"
  ];

  const isNoLayout = noLayoutPages.includes(location.pathname);

  return (
    <>
      {isNoLayout ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/buy"
            element={
              <PrivateRoute>
                <BuyNow />
              </PrivateRoute>
            }
          />
        
        <Route
          path="/sell"
          element={
            <PrivateSellerRoute>
              <Sell />
            </PrivateSellerRoute>
          }
        />
        <Route
          path="/seller-dashboard"
          element={
            <PrivateSellerRoute>
              <SellerDashboard />
            </PrivateSellerRoute>
          }
        />

        

        <Route path="/seller-apply" element={<SellerApply />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />

        <Route path="/help" element={<HelpFAQ />} />

        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/products/:category/:subcategory" element={<Products />} />
            <Route path="/search" element={<SearchResults />} />

          </Routes>
        </Layout>
      )}
    </>
  );
}

export default App;
