import { Link, Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";

import { api, Brand } from "./api";
import { Message } from "./components/Message";
import AlertsPage from "./pages/AlertsPage";
import BrandPage from "./pages/BrandPage";
import ProductPage from "./pages/ProductPage";
import WishlistPage from "./pages/WishlistPage";
import UpdatesPage from "./pages/UpdatesPage";
import { useLoad } from "./useLoad";

export default function App() {
  const brands = useLoad(api.brands, []);
  const { pathname } = useLocation();
  const inCatalogue = pathname === "/" || pathname.startsWith("/brands/");

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            The Catalogue
          </Link>
          <nav className="main-nav">
            <Link to="/" className={inCatalogue ? "active" : undefined} aria-current={inCatalogue ? "page" : undefined}>Catalogue</Link>
            <NavLink to="/updates">Recent updates</NavLink>
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
          <Route path="/updates" element={<UpdatesPage brands={brands.data ?? []} />} />
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
