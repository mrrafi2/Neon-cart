//client side routeing

import { Routes, Route, useLocation } from "react-router-dom";
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
import SearchResults from "./components/search/searchresult";
import PrivateRoute from "./components/common/PrivateRoute";
import PrivateSellerRoute from "./components/seller/sellerRoute";
import Contact from "./components/pages/contact";
import About from "./components/pages/about";
import HelpFAQ from "./components/pages/help";

function MainRouter() {
  const location = useLocation();

  const noLayoutPages = [
    "/login", "/signup", "/sell", "/seller-dashboard", "/buy",
    "/contact", "/about", "/help", "/seller-apply", "/admin"
  ];

  const isNoLayout = noLayoutPages.includes(location.pathname);

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/products/:category/:subcategory" element={<Products />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/help" element={<HelpFAQ />} />
      <Route path="/seller-apply" element={<SellerApply />} />

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
    </Routes>
  );

  return isNoLayout ? routes : <Layout> {routes} </Layout>;
}

export default MainRouter;
