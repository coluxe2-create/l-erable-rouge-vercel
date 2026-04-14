import { useState, useEffect } from "react";
import AdminLogin from "../components/AdminLogin";
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "../components/AdminDashboard";
import MenuManagement from "../components/MenuManagement";
import OrderManagement from "../components/OrderManagement";
import ReservationManagement from "../components/ReservationManagement";
import SlideManagement from "../components/SlideManagement";
import ScrollToTop from "../components/ScrollToTop";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedUser !== 'undefined' && savedToken && savedToken !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      } catch (e) {
        console.error('[Admin] Failed to parse saved user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsAuthReady(true);
  }, []);

  const handleLogin = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  if (!isAuthReady) return null;

  if (!token || !user || user.role !== 'admin') {
    return (
      <>
        <ScrollToTop activePage="admin" activeTab={activeTab} />
        <AdminLogin onLogin={handleLogin} />
      </>
    );
  }

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'menu': return <MenuManagement />;
      case 'orders': return <OrderManagement />;
      case 'reservations': return <ReservationManagement />;
      case 'slides': return <SlideManagement />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
      user={user}
    >
      <ScrollToTop activePage="admin" activeTab={activeTab} />
      {renderAdminContent()}
    </AdminLayout>
  );
}
