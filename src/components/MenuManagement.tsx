import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Search, 
  Filter,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { MenuItem, Category } from '../types';

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsData, catsData] = await Promise.all([
        api.menu.getAll(),
        api.menu.getCategories()
      ]);
      setItems(itemsData);
      setCategories(catsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: MenuItem | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category_id: item.category_id,
        is_available: item.is_available,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: categories[0]?.id || '',
        is_available: true,
      });
    }
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category_id', formData.category_id);
      data.append('is_available', formData.is_available.toString());
      if (photoFile) {
        data.append('photo', photoFile);
      }

      if (editingItem) {
        await api.menu.update(editingItem.id, data);
      } else {
        await api.menu.create(data);
      }
      
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await api.menu.delete(id);
        await fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredItems = items.filter(item => {
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

  if (loading) return <div className="p-8 text-gray-text">Chargement du menu...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion du Menu</h1>
          <p className="text-gray-text">Gérez vos plats, boissons et catégories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-red hover:bg-secondary-red text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-red/20"
        >
          <Plus className="w-5 h-5" />
          Ajouter un article
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-text" />
          <input
            type="text"
            placeholder="Rechercher un plat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card-black border border-border-dark rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-text" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-card-black border border-border-dark rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all appearance-none"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{getCategoryIcon(cat.name)} {cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card-black border border-border-dark rounded-2xl overflow-hidden group hover:border-primary-red/50 transition-all"
            >
              <div className="aspect-video relative overflow-hidden bg-white/5">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="p-2 bg-deep-black/80 hover:bg-primary-red text-white rounded-lg transition-colors backdrop-blur-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-deep-black/80 hover:bg-primary-red text-white rounded-lg transition-colors backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {!item.is_available && (
                  <div className="absolute inset-0 bg-deep-black/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-primary-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Épuisé
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-bold group-hover:text-primary-red transition-colors">{item.name}</h3>
                  </div>
                  <span className="text-primary-red font-bold">{Number(item.price).toFixed(0)} MAD</span>
                </div>
                <p className="text-gray-text text-sm line-clamp-2 mb-4 h-10">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-text bg-white/10 px-2 py-1 rounded flex items-center gap-1">
                    {getCategoryIcon(item.category_name || '')} {item.category_name}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-emerald-500' : 'bg-primary-red'}`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-deep-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card-black border border-border-dark rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {editingItem ? 'Modifier l\'article' : 'Ajouter un article'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-gray-text transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-text ml-1">Nom du plat</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-deep-black/50 border border-border-dark rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-text ml-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-deep-black/50 border border-border-dark rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-text ml-1">Catégorie</label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full bg-deep-black/50 border border-border-dark rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-text ml-1">Prix (MAD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-deep-black/50 border border-border-dark rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-text ml-1">Photo</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer bg-deep-black/50 border-2 border-dashed border-border-dark hover:border-primary-red/50 rounded-xl p-3 text-center transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-gray-text text-sm">
                        <ImageIcon className="w-5 h-5" />
                        {photoFile ? photoFile.name : 'Choisir une image'}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-deep-black/50 rounded-xl border border-border-dark">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary-red"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium text-gray-text cursor-pointer">
                    Disponible en stock
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-primary-red hover:bg-secondary-red disabled:bg-secondary-red/50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-red/20"
                  >
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                    Enregistrer l'article
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
