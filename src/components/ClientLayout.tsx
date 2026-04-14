import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  UtensilsCrossed, 
  ShoppingBag, 
  Calendar, 
  User, 
  Menu as MenuIcon, 
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ClientLayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  user: any;
  onLogout: () => void;
}

export default function ClientLayout({ children, activePage, setActivePage, user, onLogout }: ClientLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { id: 'home', label: 'Accueil', icon: <Home className="w-5 h-5" /> },
    { id: 'menu', label: 'La Carte', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'reservation', label: 'Réserver', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-bg-white text-main-text font-serif">
      {/* Navigation Mobile & Desktop */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-[#F0F0F0] z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          {/* Mobile Hamburger (Left) */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 text-main-text -ml-2"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* Logo (Centered on mobile, Left on desktop) */}
          <button 
            onClick={() => setActivePage('home')}
            className="text-2xl font-display italic font-bold text-accent-red tracking-tight absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
          >
            L'Érable Rouge
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`text-[11px] uppercase tracking-[0.2em] font-sans font-medium transition-all duration-300 hover:text-accent-red ${
                  activePage === item.id ? 'text-accent-red' : 'text-main-text'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActivePage('cart')}
              className="relative p-2 text-main-text hover:text-accent-red transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent-red text-white text-[9px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user && (
              <div className="hidden md:flex items-center gap-4 pl-6 border-l border-border-color">
                <span className="text-[11px] uppercase tracking-widest font-sans font-medium text-main-text">{user.first_name || user.email.split('@')[0]}</span>
                <button onClick={onLogout} className="text-secondary-text hover:text-accent-red transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-main-text/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[70] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-16">
                <span className="text-2xl font-display italic font-bold text-accent-red">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-secondary-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActivePage(item.id); setIsMenuOpen(false); }}
                    className={`w-full flex items-center justify-between text-sm uppercase tracking-[0.2em] font-sans font-medium ${
                      activePage === item.id ? 'text-accent-red' : 'text-main-text'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      {item.label}
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-20" />
                  </button>
                ))}
                
                <div className="pt-8 border-t border-border-color">
                  {user && (
                    <button 
                      onClick={() => { onLogout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-5 text-sm uppercase tracking-[0.2em] font-sans font-medium text-accent-red"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        {children}
      </main>

      {/* Sticky Reservation Button */}
      <motion.button
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#6B1414' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setActivePage('reservation')}
        className="fixed bottom-0 left-0 right-0 md:bottom-8 md:right-8 md:left-auto z-[100] bg-accent-red text-white p-3 md:px-8 md:py-4 shadow-[0_-10px_30px_rgba(139,26,26,0.15)] md:shadow-[0_20px_40px_rgba(139,26,26,0.3)] flex items-center justify-center gap-4 group transition-all duration-500 w-full md:w-auto"
      >
        <div className="w-8 h-8 border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors hidden md:flex">
          <Calendar className="w-4 h-4" />
        </div>
        <span className="text-[13px] md:text-[10px] font-sans font-bold uppercase tracking-[0.3em] md:tracking-[0.2em]">Réserver une table</span>
      </motion.button>

      {/* Footer */}
      <footer className="bg-white text-secondary-text py-24 px-8 border-t border-border-color">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <h3 className="text-accent-red font-display italic text-3xl mb-8">L'Érable Rouge</h3>
            <p className="text-sm leading-relaxed mb-8 font-serif italic">
              Une expérience gastronomique unique à Hay Mohammadi, Agadir, mêlant tradition marocaine et modernité raffinée.
            </p>
            <div className="flex gap-6">
              <div className="w-10 h-10 border border-border-color flex items-center justify-center hover:border-accent-red transition-colors cursor-pointer">
                <span className="text-[10px] uppercase tracking-widest font-sans">IG</span>
              </div>
              <div className="w-10 h-10 border border-border-color flex items-center justify-center hover:border-accent-red transition-colors cursor-pointer">
                <span className="text-[10px] uppercase tracking-widest font-sans">FB</span>
              </div>
              <div className="w-10 h-10 border border-border-color flex items-center justify-center hover:border-accent-red transition-colors cursor-pointer">
                <span className="text-[10px] uppercase tracking-widest font-sans">TW</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-main-text font-sans font-bold mb-8 uppercase tracking-[0.2em] text-[10px]">Contact</h4>
            <ul className="space-y-5 text-sm font-serif italic">
              <li>Hay Mohammadi, Agadir, 80016, Maroc</li>
              <li>+212 5 28 XX XX XX</li>
              <li>contact@lerable-rouge.ma</li>
            </ul>
          </div>
          <div>
            <h4 className="text-main-text font-sans font-bold mb-8 uppercase tracking-[0.2em] text-[10px]">Horaires</h4>
            <ul className="space-y-5 text-sm font-serif italic">
              <li className="flex justify-between">
                <span>Lundi - Dimanche</span>
                <span className="text-accent-red">12:00 - 00:00</span>
              </li>
              <li className="text-[11px] text-secondary-text/60">
                Service continu & Livraison disponible
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-border-color flex flex-col md:flex-row items-center justify-between gap-6 text-[9px] uppercase tracking-[0.3em] font-sans">
          <div>&copy; 2026 L'Érable Rouge Agadir. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}
