import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, X, Image as ImageIcon, Check, Power } from 'lucide-react';
import { api } from '../services/api';
import { Slide } from '../types';

export default function SlideManagement() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    photo: null as File | null,
    actif: true
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const data = await api.slides.getAll();
      setSlides(data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('titre', formData.titre);
      fd.append('description', formData.description);
      fd.append('actif', String(formData.actif));
      fd.append('order_index', String(slides.length));
      if (formData.photo) {
        fd.append('photo', formData.photo);
      }

      await api.slides.create(fd);
      setMessage({ type: 'success', text: 'Slide ajoutée avec succès !' });
      setIsAdding(false);
      setFormData({ titre: '', description: '', photo: null, actif: true });
      fetchSlides();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('titre', formData.titre);
      fd.append('description', formData.description);
      fd.append('actif', String(formData.actif));
      if (formData.photo) {
        fd.append('photo', formData.photo);
      }

      await api.slides.update(editingSlide.id, fd);
      setMessage({ type: 'success', text: 'Slide mise à jour !' });
      setEditingSlide(null);
      setFormData({ titre: '', description: '', photo: null, actif: true });
      fetchSlides();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette slide ?')) return;
    try {
      await api.slides.delete(id);
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  const handleToggleActive = async (slide: Slide) => {
    try {
      const fd = new FormData();
      fd.append('actif', String(!slide.actif));
      fd.append('titre', slide.titre || '');
      fd.append('description', slide.description || '');
      await api.slides.update(slide.id, fd);
      fetchSlides();
    } catch (error) {
      console.error('Error toggling slide status:', error);
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    const updatedSlides = newSlides.map((s, i) => ({ id: s.id, order_index: i }));
    
    try {
      await api.slides.reorder(updatedSlides);
      setSlides(newSlides);
    } catch (error) {
      console.error('Error reordering slides:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestion des Slides (Carousel)</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingSlide(null);
            setFormData({ titre: '', description: '', photo: null, actif: true });
          }}
          className="bg-primary-red hover:bg-secondary-red text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Ajouter une slide
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {(isAdding || editingSlide) && (
        <div className="bg-card-black p-6 rounded-xl shadow-sm border border-border-dark space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">
              {isAdding ? 'Nouvelle Slide' : 'Modifier la Slide'}
            </h3>
            <button onClick={() => { setIsAdding(false); setEditingSlide(null); }} className="text-gray-text hover:text-stone-200">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={isAdding ? handleAdd : handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">Titre (optionnel)</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-dark bg-deep-black/50 text-white focus:ring-2 focus:ring-primary-red outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">Description (optionnelle)</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-dark bg-deep-black/50 text-white focus:ring-2 focus:ring-primary-red outline-none h-24"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-1">Photo</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-deep-black/50 hover:bg-white/10 text-gray-text px-4 py-2 rounded-lg border border-dashed border-border-dark flex items-center gap-2 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                    {formData.photo ? formData.photo.name : 'Choisir une photo'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={e => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="actif"
                  checked={formData.actif}
                  onChange={e => setFormData({ ...formData, actif: e.target.checked })}
                  className="w-4 h-4 text-primary-red rounded focus:ring-primary-red"
                />
                <label htmlFor="actif" className="text-sm font-medium text-gray-text">Slide active</label>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-red hover:bg-secondary-red text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : <><Save className="w-5 h-5" /> Enregistrer</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`bg-card-black rounded-xl shadow-sm border ${slide.actif ? 'border-border-dark' : 'border-primary-red/20 opacity-75'} overflow-hidden flex flex-col`}>
            <div className="relative aspect-video">
              <img src={slide.photo_url} alt={slide.titre || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {!slide.actif && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="bg-primary-red text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Inactif</span>
                </div>
              )}
            </div>
            <div className="p-4 flex-grow">
              <h4 className="font-bold text-white mb-1">{slide.titre || 'Sans titre'}</h4>
              <p className="text-gray-text text-sm line-clamp-2">{slide.description || 'Pas de description'}</p>
            </div>
            <div className="p-4 border-t border-border-dark flex items-center justify-between bg-deep-black/30">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSlide(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-gray-text hover:text-stone-600 disabled:opacity-25"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => moveSlide(index, 'down')}
                  disabled={index === slides.length - 1}
                  className="p-1.5 text-gray-text hover:text-stone-600 disabled:opacity-25"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(slide)}
                  className={`p-1.5 rounded-lg transition-colors ${slide.actif ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                  title={slide.actif ? 'Désactiver' : 'Activer'}
                >
                  <Power className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setEditingSlide(slide);
                    setIsAdding(false);
                    setFormData({
                      titre: slide.titre || '',
                      description: slide.description || '',
                      photo: null,
                      actif: slide.actif
                    });
                  }}
                  className="p-1.5 text-gray-text hover:text-stone-600"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-1.5 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
