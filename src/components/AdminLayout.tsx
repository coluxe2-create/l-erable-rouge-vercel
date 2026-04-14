import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingBag, 
  Calendar, 
  Truck, 
  LogOut,
  Menu,
  X,
  User,
  Image as ImageIcon
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: any;
}

export default function AdminLayout({ children, activeTab, setActiveTab, onLogout, user }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'menu', label: 'Gestion Menu', icon: <Utensils className="w-5 h-5" /> },
    { id: 'orders', label: 'Commandes', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'reservations', label: 'Réservations', icon: <Calendar className="w-5 h-5" /> },
    { id: 'slides', label: 'Gestion Slides', icon: <ImageIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-deep-black flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 bottom-0 bg-card-black border-r border-border-dark z-40 flex flex-col"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white font-bold text-xl tracking-tighter"
            >
              L'ÉRABLE <span className="text-primary-red">ROUGE</span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-text transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-primary-red text-white shadow-lg shadow-primary-red/20' 
                  : 'text-gray-text hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border-dark">
          <div className={`flex items-center gap-4 p-4 rounded-xl bg-deep-black/50 mb-4 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-primary-red/10 rounded-full flex items-center justify-center text-primary-red border border-primary-red/20">
              <User className="w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <p className="text-white font-bold text-sm truncate">{user.email}</p>
                <p className="text-gray-text text-xs uppercase tracking-widest font-bold">Admin</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-primary-red hover:bg-primary-red/10 transition-all ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 transition-all"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
