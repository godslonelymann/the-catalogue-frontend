import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";

import { api, Brand } from "./api";
import { Message } from "./components/Message";
import AlertsPage from "./pages/AlertsPage";
import BrandPage from "./pages/BrandPage";
import ProductPage from "./pages/ProductPage";
import WishlistPage from "./pages/WishlistPage";
import { useLoad } from "./useLoad";

export default function App() {
  const brands = useLoad(api.brands, []);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            The Catalogue
          </Link>
          <nav className="main-nav">
            <NavLink to="/wishlist">Wishlist</NavLink>
            <NavLink to="/alerts">Alerts</NavLink>
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home brands={brands.data} error={brands.error} />} />
          <Route path="/brands/:brandId" element={<BrandPage brands={brands.data ?? []} />} />
          <Route path="/products/:productId" element={<ProductPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="*" element={<Message title="Page not found" />} />
        </Routes>
      </main>

      <footer className="site-footer container">
        Prices and stock from each brand's public store, updated once a day. Images load from the brands' own
        stores. Not affiliated with any brand.
      </footer>
    </>
  );
}

function Home({ brands, error }: { brands: Brand[] | null; error: string | null }) {
  if (error) return <Message title="Could not load brands" text={error} />;
  if (!brands) return <Message title="Loading…" />;
  if (brands.length === 0) return <Message title="No brands yet" />;
  return <Navigate to={`/brands/${brands[0].id}`} replace />;
}
