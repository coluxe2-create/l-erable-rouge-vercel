import { useEffect, useState } from "react";
import AdminPage from "./pages/AdminPage";

// Client Components
import ClientLayout from "./components/ClientLayout";
import ClientHome from "./components/ClientHome";
import ClientMenu from "./components/ClientMenu";
import ClientCart from "./components/ClientCart";
import ClientReservation from "./components/ClientReservation";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import { CartProvider } from "./context/CartContext";
import { supabase } from "./lib/supabase";
import { Category, MenuItem } from "./types";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'menu' | 'reservation' | 'cart' | 'payment-success' | 'payment-failure' | 'admin'>('home');

  const [appMode, setAppMode] = useState<'admin' | 'client'>('client');

  useEffect(() => {
    let typed = '';
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      typed += e.key.toLowerCase();
      if (typed.includes('admin')) {
        setAppMode('admin');
        typed = '';
      }
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        typed = '';
      }, 2000);
    };

    window.addEventListener('keypress', handleKeyPress);
    
    const handleHashChange = () => {
      if (window.location.hash === '') {
        setAppMode('client');
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('hashchange', handleHashChange);
      clearTimeout(timeout);
    };
  }, []);

  // Supabase Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('[Supabase] Fetching data...');
        
        const { data: cats, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .order('order_index');
        
        const { data: prods, error: prodErr } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              order_index
            )
          `)
          .eq('is_available', true)
          .order('name');
        
        if (catErr) console.error('Erreur catégories:', catErr);
        if (prodErr) console.error('Erreur produits:', prodErr);

        if (cats) setCategories(cats);
        if (prods) {
          const mappedProds: MenuItem[] = prods.map(p => ({
            ...p,
            category_name: p.categories?.name
          }));
          setProducts(mappedProds);
        }
      } catch (err) {
        console.error('[Supabase] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('[App] Failed to parse saved user:', e);
      }
    }

    // Handle initial route from URL if needed
    const path = window.location.pathname;
    
    if (path === '/paiement/succes') {
      setCurrentPage('payment-success');
    } else if (path === '/paiement/echec') {
      setCurrentPage('payment-failure');
    } else if (path !== '/') {
      // Always reset to home on refresh if not a special route
      window.history.replaceState({}, '', '/');
      setCurrentPage('home');
    }

    setIsAuthReady(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
  };

  const navigateTo = (page: any) => {
    setCurrentPage(page);
    // Update URL without reloading for better DX
    const path = page === 'home' ? '/' : `/${page}`;
    window.history.pushState({}, '', path);
    window.scrollTo(0, 0);
  };

  if (!isAuthReady) return null;

  // Admin Mode Rendering
  if (appMode === 'admin') {
    return <AdminPage />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return <ClientHome onNavigate={navigateTo} categories={categories} />;
      case 'menu': return <ClientMenu categories={categories} products={products} loading={loading} />;
      case 'reservation': return <ClientReservation onNavigate={navigateTo} user={user} />;
      case 'cart': return <ClientCart onNavigate={navigateTo} user={user} />;
      case 'payment-success': return <PaymentSuccess />;
      case 'payment-failure': return <PaymentFailure />;
      default: return <ClientHome onNavigate={navigateTo} categories={categories} />;
    }
  };

  return (
    <CartProvider>
      <ScrollToTop activePage={currentPage} activeTab="" />
      <ClientLayout 
        user={user}
        onLogout={handleLogout}
        activePage={currentPage}
        setActivePage={navigateTo}
      >
        {renderContent()}
      </ClientLayout>
    </CartProvider>
  );
}
