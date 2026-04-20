import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ShoppingBag, 
  Search, 
  Filter, 
  Check,
  Loader2,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { api } from '../services/api';
import { MenuItem, Category } from '../types';
import { useCart } from '../context/CartContext';

interface ClientMenuProps {
  categories: Category[];
  products: MenuItem[];
  loading: boolean;
  initialCategory?: string | null;
  onCategoryReset?: () => void;
}

export default function ClientMenu({ categories, products, loading, initialCategory, onCategoryReset }: ClientMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCategory(initialCategory || 'all');
  }, [initialCategory]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filteredItems = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Antipasti': return '🥗';
      case 'Pasticcios': return '🫕';
      case 'Pizzas Feu de Bois': return '🍕';
      case 'Burgers': return '🍔';
      case 'Pasta au Choix': return '🍝';
      case 'Boissons Divers': return '🥤';
      default: return '🍽️';
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-white animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center space-y-4">
          <span className="text-[#8B1A1A] font-sans font-bold uppercase tracking-[0.4em] text-[10px]">La Carte</span>
          <h1 className="text-5xl md:text-7xl font-display italic text-[#1A1A1A] tracking-tight">Saveurs & Traditions</h1>
          <div className="h-[1px] w-20 bg-[#8B1A1A]/20 mx-auto"></div>
          <p className="text-[#666666] max-w-2xl mx-auto font-serif italic text-lg">
            Découvrez notre sélection de mets d'exception, préparés avec passion et servis dans un écrin de raffinement.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="sticky top-20 z-30 flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-4 border-b border-[#F0F0F0] shadow-sm">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 no-scrollbar w-full lg:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap border ${
                selectedCategory === 'all' 
                  ? 'bg-[#8B1A1A] text-white border-[#8B1A1A]' 
                  : 'bg-white text-[#1A1A1A] border-[#F0F0F0] hover:border-[#8B1A1A]/30'
              }`}
            >
              Tous
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap border ${
                  selectedCategory === cat.id 
                    ? 'bg-[#8B1A1A] text-white border-[#8B1A1A]' 
                    : 'bg-white text-[#1A1A1A] border-[#F0F0F0] hover:border-[#8B1A1A]/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]/40" />
            <input
              type="text"
              placeholder="Rechercher un mets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F9F9F9] border border-[#F0F0F0] py-3 pl-12 pr-4 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8B1A1A]/30 transition-all placeholder:text-[#666666]/40"
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-12">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="group flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden bg-[#F9F9F9] border border-[#F0F0F0] shadow-[0_2px_12px_rgba(0,0,0,0.08)] mb-6">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#666666]/10">
                      <Utensils className="w-8 md:w-12 h-8 md:h-12" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col flex-grow space-y-3 text-center">
                  <div className="space-y-1">
                    <h3 className="text-sm md:text-lg font-display italic text-[#1A1A1A] leading-tight group-hover:text-[#8B1A1A] transition-colors duration-300">{item.name}</h3>
                    <p className="text-[10px] md:text-xs font-serif italic line-clamp-2 h-8 text-[#666666]">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="pt-1">
                    <span className="text-[#8B1A1A] font-sans font-bold text-xs md:text-sm tracking-widest">
                      {Number(item.price).toFixed(0)} MAD
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`w-full py-3 text-[8px] md:text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all duration-300 border ${
                      addedId === item.id 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white text-[#1A1A1A] border-[#F0F0F0] hover:bg-[#8B1A1A] hover:text-white hover:border-[#8B1A1A]'
                    }`}
                  >
                    {addedId === item.id ? (
                      <span className="flex items-center justify-center gap-1 md:gap-2">
                        <Check className="w-2.5 md:w-3 h-2.5 md:h-3" /> Ajouté
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 md:gap-2">
                        <Plus className="w-2.5 md:w-3 h-2.5 md:h-3" /> Ajouter
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 bg-[#F9F9F9] rounded-full flex items-center justify-center mx-auto text-[#666666]/20 border border-[#F0F0F0]">
              <Search className="w-10 h-10" />
            </div>
            <p className="text-[#666666]">Aucun plat ne correspond à votre recherche.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="text-[#8B1A1A] font-bold text-sm underline underline-offset-4"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
