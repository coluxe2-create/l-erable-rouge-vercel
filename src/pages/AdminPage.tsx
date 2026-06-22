import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  Calendar, 
  Users, 
  Megaphone, 
  Settings, 
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Truck,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MapPin,
  Phone,
  User,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Search,
  Filter,
  Check,
  Loader2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';
import { MenuItem, Category, Order, Reservation, Slide } from '../types';
import { sendTelegramNotification, formatStatusMessage } from '../services/telegram';

// --- ADMIN LOGIN COMPONENT ---
function AdminLogin({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }
      
      // Vérifier que c'est bien un admin
      const { data: userData, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileErr || userData?.role !== 'admin') {
        setError('Accès réservé aux administrateurs');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      onLogin(data.session.access_token, userData);
    } catch (err: any) {
      setError('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A0A0A] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#251515] border border-[#8B1A1A]/20 p-10 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display italic text-white mb-2">L'Érable Rouge</h1>
          <p className="text-[#8B1A1A] uppercase tracking-[0.3em] text-[10px] font-bold">Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-[#8B1A1A]/20 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#8B1A1A] transition-all"
              placeholder="admin@lerable-rouge.ma"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-[#8B1A1A]/20 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#8B1A1A] transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B1A1A] hover:bg-[#6B1414] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#8B1A1A]/20 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => window.location.hash = ''}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Retour au site
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- MAIN ADMIN PAGE ---
export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Custom Modals & Notifications
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void 
  } | null>(null);
  
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error'
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedUser !== 'undefined' && savedToken && savedToken !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      } catch (e) {
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
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#1A0A0A] flex text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-[#8B1A1A] fixed left-0 top-0 bottom-0 z-40 flex flex-col shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-display italic font-bold text-white tracking-tight">L'Érable Rouge</h1>
          <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Administration</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-5 h-5" /> },
            { id: 'orders', label: 'Commandes', icon: <ShoppingBag className="w-5 h-5" /> },
            { id: 'menu', label: 'Menu', icon: <Utensils className="w-5 h-5" /> },
            { id: 'reservations', label: 'Réservations', icon: <Calendar className="w-5 h-5" /> },
            { id: 'clients', label: 'Clients', icon: <Users className="w-5 h-5" /> },
            { id: 'ads', label: 'Publicités', icon: <Megaphone className="w-5 h-5" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-white/20 text-white font-bold shadow-inner' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm truncate">{user.email}</p>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'orders' && <OrdersView showNotification={showNotification} confirmAction={(title, msg, action) => setConfirmModal({ isOpen: true, title, message: msg, onConfirm: action })} />}
          {activeTab === 'menu' && <MenuView showNotification={showNotification} confirmAction={(title, msg, action) => setConfirmModal({ isOpen: true, title, message: msg, onConfirm: action })} />}
          {activeTab === 'reservations' && <ReservationsView showNotification={showNotification} />}
          {activeTab === 'clients' && <ClientsView showNotification={showNotification} confirmAction={(title, msg, action) => setConfirmModal({ isOpen: true, title, message: msg, onConfirm: action })} />}
          {activeTab === 'ads' && <AdsView showNotification={showNotification} confirmAction={(title, msg, action) => setConfirmModal({ isOpen: true, title, message: msg, onConfirm: action })} />}
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-md bg-[#251515] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#8B1A1A]/20 rounded-2xl flex items-center justify-center text-[#8B1A1A]">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{confirmModal.title}</h3>
                  <p className="text-white/40 text-sm mt-1">{confirmModal.message}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 bg-[#8B1A1A] hover:bg-[#6B1414] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#8B1A1A]/20"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[210] px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[300px] backdrop-blur-xl ${
              notification.type === 'success' 
                ? 'bg-emerald-600/90 border-emerald-500/50 text-white' 
                : 'bg-red-600/90 border-red-500/50 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm tracking-wide">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-VIEWS ---

function ClientsView({ showNotification, confirmAction }: { showNotification: (msg: string, type?: 'success' | 'error') => void, confirmAction: (title: string, msg: string, action: () => void) => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setClients(data);
    setLoading(false);
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    confirmAction(
      'Changer le rôle ?',
      `Voulez-vous vraiment changer le rôle de cet utilisateur en ${newRole} ?`,
      async () => {
        const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
        if (error) {
          showNotification('Erreur lors du changement de rôle', 'error');
        } else {
          showNotification(`Utilisateur passé en ${newRole}`);
          fetchClients();
        }
      }
    );
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8B1A1A]" /></div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-display italic">Gestion des Clients</h2>
      <div className="bg-[#251515] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/20 border-b border-white/5">
              <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-white/40">Client</th>
              <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-white/40">Email</th>
              <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-white/40">Rôle</th>
              <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-white/40">Inscrit le</th>
              <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-white/5 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#8B1A1A]/20 rounded-full flex items-center justify-center text-[#8B1A1A] font-bold border border-[#8B1A1A]/20">
                      {client.first_name?.[0] || client.email[0].toUpperCase()}
                    </div>
                    <div className="font-bold text-white">{client.first_name} {client.last_name}</div>
                  </div>
                </td>
                <td className="p-6 text-white/60 text-sm">{client.email}</td>
                <td className="p-6">
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                    client.role === 'admin' ? 'bg-amber-950 text-amber-500 border-amber-900/50' : 'bg-blue-950 text-blue-500 border-blue-900/50'
                  }`}>
                    {client.role}
                  </span>
                </td>
                <td className="p-6 text-white/40 text-xs">{new Date(client.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => toggleRole(client.id, client.role)}
                    className="text-[#8B1A1A] hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Changer rôle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdsView({ showNotification, confirmAction }: { showNotification: (msg: string, type?: 'success' | 'error') => void, confirmAction: (title: string, msg: string, action: () => void) => void }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    photo_url: '',
    order_index: 0,
    actif: true
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data } = await supabase.from('slides').select('*').order('order_index');
    if (data) setSlides(data);
    setLoading(false);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `slides/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('products') // On réutilise le même bucket pour simplifier
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const handleOpenModal = (slide: Slide | null = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        titre: slide.titre || '',
        description: slide.description || '',
        photo_url: slide.photo_url,
        order_index: slide.order_index,
        is_active: slide.is_active
      });
    } else {
      setEditingSlide(null);
      setFormData({
        titre: '',
        description: '',
        photo_url: '',
        order_index: slides.length,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slideData = {
      titre: formData.titre,
      description: formData.description,
      photo_url: formData.photo_url,
      order_index: formData.order_index,
      is_active: formData.is_active
    };

    try {
      let error;
      if (editingSlide) {
        const { error: updateError } = await supabase.from('slides').update(slideData).eq('id', editingSlide.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('slides').insert([slideData]);
        error = insertError;
      }
      
      if (error) {
        console.error('Erreur Supabase slides:', error);
        showNotification('Erreur lors de l\'enregistrement : ' + error.message, 'error');
        return;
      }

      showNotification(editingSlide ? 'Publicité modifiée' : 'Publicité ajoutée');
      fetchSlides();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Erreur inattendue slides:', err);
      showNotification('Erreur inattendue', 'error');
    }
  };

  const toggleStatus = async (slide: Slide) => {
    await supabase.from('slides').update({ is_active: !slide.is_active }).eq('id', slide.id);
    fetchSlides();
  };

  const deleteSlide = async (id: number) => {
    confirmAction(
      'Supprimer la publicité ?',
      'Cette action est irréversible.',
      async () => {
        const { error } = await supabase.from('slides').delete().eq('id', id);
        if (error) {
          showNotification('Erreur lors de la suppression', 'error');
        } else {
          showNotification('Publicité supprimée');
          fetchSlides();
        }
      }
    );
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8B1A1A]" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display italic">Gestion des Publicités (Slider)</h2>
        <button onClick={() => handleOpenModal()} className="bg-[#8B1A1A] hover:bg-[#6B1414] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#8B1A1A]/20">
          <Plus className="w-5 h-5" /> Ajouter une slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {slides.map(slide => (
          <div key={slide.id} className="bg-[#251515] border border-white/5 rounded-3xl overflow-hidden shadow-xl group">
            <div className="aspect-video relative bg-black/40">
              <img src={slide.photo_url} alt={slide.titre} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleOpenModal(slide)} className="p-2 bg-black/60 hover:bg-[#8B1A1A] text-white rounded-lg transition-all backdrop-blur-md"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteSlide(slide.id)} className="p-2 bg-black/60 hover:bg-[#8B1A1A] text-white rounded-lg transition-all backdrop-blur-md"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">{slide.titre || 'Sans titre'}</h3>
                <p className="text-white/40 text-xs line-clamp-2">{slide.description}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button 
                  onClick={() => toggleStatus(slide)}
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${
                    slide.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}
                >
                  {slide.is_active ? 'Actif' : 'Inactif'}
                </button>
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Ordre: {slide.order_index}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-[#251515] border border-white/10 rounded-3xl p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-display italic mb-8">{editingSlide ? 'Modifier la slide' : 'Ajouter une slide'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#F5C5B8] ml-1">Image publicitaire</label>
                  {formData.photo_url && <img src={formData.photo_url} alt="aperçu" className="w-full h-48 object-cover rounded-2xl border border-white/10" />}
                  <label className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 cursor-pointer gap-3 bg-black/20 hover:bg-black/40 transition-all ${formData.photo_url ? 'h-16' : 'h-40'}`}>
                    <Camera className="w-6 h-6 text-[#F5C5B8]" />
                    <span className="text-[#F5C5B8] text-xs font-bold">{uploading ? 'Upload...' : 'Cliquer pour uploader'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const url = await uploadImage(file);
                        setFormData({ ...formData, photo_url: url });
                      } catch (err) { showNotification('Erreur d\'upload', 'error'); }
                      setUploading(false);
                    }} />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Titre</label>
                  <input type="text" value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#8B1A1A]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#8B1A1A] resize-none" />
                </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Ordre d'affichage</label>
                      <input type="number" required value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#8B1A1A]" />
                    </div>
                    <div className="flex items-center gap-4 pt-8">
                      <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded bg-black/40 border-white/10 text-[#8B1A1A] focus:ring-[#8B1A1A]" />
                      <label className="text-sm text-white/60">Afficher sur le site</label>
                    </div>
                  </div>
                <button type="submit" disabled={uploading} className="w-full bg-[#8B1A1A] hover:bg-[#6B1414] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#8B1A1A]/20">Enregistrer</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, clients: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchStats() {
      // Fetch only essential columns needed for today's count and total revenue of all orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('created_at, total_price');
        
      // Fetch the 5 most recent orders separately with all details needed
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch ONLY the count of users (HEAD request, 0 egress for user rows)
      const { count: usersCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      if (ordersData) {
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = ordersData.filter(o => o.created_at && o.created_at.startsWith(today));
        const totalRevenue = ordersData.reduce((acc, o) => acc + Number(o.total_price || 0), 0);
        
        setStats({
          orders: todayOrders.length,
          revenue: totalRevenue,
          clients: usersCount || 0
        });
      }

      if (recentOrdersData) {
        setRecentOrders(recentOrdersData);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display italic">Tableau de bord</h2>
        <div className="text-white/40 text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Commandes du jour', value: stats.orders, icon: <ShoppingBag className="w-6 h-6" />, color: 'text-emerald-500' },
          { label: 'Chiffre d\'affaires', value: `${stats.revenue.toFixed(0)} MAD`, icon: <TrendingUp className="w-6 h-6" />, color: 'text-blue-500' },
          { label: 'Total Clients', value: stats.clients, icon: <Users className="w-6 h-6" />, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#251515] border border-white/5 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 bg-black/20 rounded-2xl ${stat.color}`}>{stat.icon}</div>
              <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Aujourd'hui</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-white/40 text-xs font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#251515] border border-white/5 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-display italic">Dernières commandes</h3>
          <button onClick={() => setActiveTab('orders')} className="text-[#8B1A1A] text-xs font-bold uppercase tracking-widest hover:underline">Voir tout</button>
        </div>
        <div className="divide-y divide-white/5">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center text-[#8B1A1A] font-bold border border-[#8B1A1A]/20">
                  #{order.id.toString().slice(-4)}
                </div>
                <div>
                  <div className="font-bold text-white uppercase text-sm tracking-tight">{order.mode}</div>
                  <div className="text-white/40 text-xs">{new Date(order.created_at).toLocaleTimeString('fr-FR')} • {order.first_name || 'Client'}</div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="font-bold text-white">{Number(order.total_price).toFixed(0)} MAD</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-[#8B1A1A]">
                    {order.status === 'en_attente' ? 'En attente' : 
                     order.status === 'en_preparation' ? 'En préparation' : 
                     order.status === 'en_route' ? 'En route' : 
                     order.status === 'livre' ? 'Livré' : 
                     order.status === 'annule' ? 'Annulé' : order.status}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrdersView({ showNotification, confirmAction }: { showNotification: (msg: string, type?: 'success' | 'error') => void, confirmAction: (title: string, msg: string, action: () => void) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
    
    const channel = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    
    if (!error) {
      const order = orders.find(o => o.id === id);
      const message = formatStatusMessage(
        id,
        status,
        order?.first_name || 'Client'
      );
      await sendTelegramNotification(message);
    }
  };

  const deleteOrder = async (id: string) => {
    confirmAction(
      'Supprimer la commande ?',
      'Cette action supprimera définitivement la commande et ses articles.',
      async () => {
        try {
          // 1. Supprimer les order_items liés
          await supabase
            .from('order_items')
            .delete()
            .eq('order_id', id)

          // 2. Supprimer la commande
          const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id)

          if (error) {
            showNotification('Erreur: ' + error.message, 'error');
            return
          }

          // 3. Mettre à jour la liste
          setOrders(prev => prev.filter(o => o.id !== id))
          showNotification('Commande supprimée');
          
        } catch (err) {
          showNotification('Erreur inattendue', 'error');
        }
      }
    );
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8B1A1A]" /></div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-display italic">Gestion des Commandes</h2>
      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order.id} className="bg-[#251515] border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center text-[#8B1A1A] text-xl font-bold border border-[#8B1A1A]/20">
                #{order.id.toString().slice(-4)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold uppercase tracking-tight">{order.mode}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-black/40 border border-white/10 rounded-full text-white/60">
                    {order.status === 'en_attente' ? 'En attente' : 
                     order.status === 'en_preparation' ? 'En préparation' : 
                     order.status === 'en_route' ? 'En route' : 
                     order.status === 'livre' ? 'Livré' : 
                     order.status === 'annule' ? 'Annulé' : order.status}
                  </span>
                </div>
                <div className="text-white/40 text-sm flex items-center gap-4">
                  <span className="flex items-center gap-2"><User className="w-4 h-4" /> {order.first_name || 'Client'}</span>
                  <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {order.phone || 'N/A'}</span>
                </div>
                {order.delivery_address && (
                  <div className="text-white/40 text-xs flex items-center gap-2 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8B1A1A]" /> {order.delivery_address}
                  </div>
                )}
                <div className="pt-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-1">Articles</p>
                  <div className="space-y-1">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="text-xs text-white/60 flex justify-between">
                        <span>{item.products?.name} x{item.quantity}</span>
                        <span>{Math.round(Number(item.unit_price) * Number(item.quantity))} MAD</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right mr-6">
                <div className="text-2xl font-bold text-white">{Number(order.total_price).toFixed(0)} MAD</div>
                <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold">{new Date(order.created_at).toLocaleString('fr-FR')}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(order.id, 'en_attente')} className={`p-3 rounded-xl transition-all ${order.status === 'en_attente' ? 'bg-[#8B1A1A] text-white shadow-lg' : 'bg-black/20 text-white/40 hover:bg-white/5'}`} title="En attente"><Clock className="w-5 h-5" /></button>
                <button onClick={() => updateStatus(order.id, 'en_preparation')} className={`p-3 rounded-xl transition-all ${order.status === 'en_preparation' ? 'bg-amber-600 text-white shadow-lg' : 'bg-black/20 text-white/40 hover:bg-white/5'}`} title="En préparation"><ChefHat className="w-5 h-5" /></button>
                <button onClick={() => updateStatus(order.id, 'en_route')} className={`p-3 rounded-xl transition-all ${order.status === 'en_route' ? 'bg-blue-600 text-white shadow-lg' : 'bg-black/20 text-white/40 hover:bg-white/5'}`} title="En livraison"><Truck className="w-5 h-5" /></button>
                <button onClick={() => updateStatus(order.id, 'livre')} className={`p-3 rounded-xl transition-all ${order.status === 'livre' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-black/20 text-white/40 hover:bg-white/5'}`} title="Livré"><CheckCircle2 className="w-5 h-5" /></button>
                <button onClick={() => updateStatus(order.id, 'annule')} className={`p-3 rounded-xl transition-all ${order.status === 'annule' ? 'bg-red-600 text-white shadow-lg' : 'bg-black/20 text-white/40 hover:bg-white/5'}`} title="Annulé"><XCircle className="w-5 h-5" /></button>
                
                <button
                  onClick={() => deleteOrder(order.id)}
                  title="Supprimer la commande"
                  className="p-3 bg-white/5 hover:bg-[#8B1A1A] text-white/40 hover:text-white rounded-xl transition-all border border-white/5 hover:border-[#8B1A1A]"
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

function MenuView({ showNotification, confirmAction }: { showNotification: (msg: string, type?: 'success' | 'error') => void, confirmAction: (title: string, msg: string, action: () => void) => void }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
    image_url: '' // We'll keep the state name for now or change it too
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: prods } = await supabase.from('products').select('*').order('name');
    const { data: cats } = await supabase.from('categories').select('*').order('order_index');
    if (prods) setItems(prods);
    if (cats) setCategories(cats);
    setLoading(false);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
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
        image_url: item.image_url || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: categories[0]?.id || '',
        is_available: true,
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      is_available: formData.is_available,
      image_url: formData.image_url
    };

    if (editingItem) {
      await supabase.from('products').update(itemData).eq('id', editingItem.id);
    } else {
      await supabase.from('products').insert([itemData]);
    }
    
    fetchData();
    setIsModalOpen(false);
  };

  const toggleAvailability = async (item: MenuItem) => {
    await supabase.from('products').update({ is_available: !item.is_available }).eq('id', item.id);
    fetchData();
  };

  const deleteItem = async (id: string) => {
    confirmAction(
      'Supprimer ce plat ?',
      'Voulez-vous vraiment supprimer ce plat du menu ?',
      async () => {
        try {
          // 1. D'abord supprimer les order_items liés pour éviter les erreurs de contrainte
          await supabase
            .from('order_items')
            .delete()
            .eq('product_id', id)

          // 2. Ensuite supprimer le produit
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

          if (error) {
            console.error('Erreur suppression:', error)
            showNotification('Erreur : ' + error.message, 'error')
            return
          }

          // 3. Mettre à jour la liste localement
          setItems(prev => prev.filter(item => item.id !== id))
          
          // 4. Confirmation visuelle
          showNotification('Plat supprimé avec succès');
          
        } catch (err) {
          console.error('Erreur inattendue:', err)
          showNotification('Erreur inattendue lors de la suppression', 'error')
        }
      }
    );
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8B1A1A]" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display italic">Gestion du Menu</h2>
        <button onClick={() => handleOpenModal()} className="bg-[#8B1A1A] hover:bg-[#6B1414] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#8B1A1A]/20">
          <Plus className="w-5 h-5" /> Ajouter un plat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map(item => (
          <div key={item.id} className="bg-[#251515] border border-white/5 rounded-3xl overflow-hidden shadow-xl group">
            <div className="aspect-video relative bg-black/40">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10"><Utensils className="w-12 h-12" /></div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleOpenModal(item)} className="p-2 bg-black/60 hover:bg-[#8B1A1A] text-white rounded-lg transition-all backdrop-blur-md"><Edit2 className="w-4 h-4" /></button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteItem(item.id)
                  }}
                  style={{
                    padding: '8px',
                    backgroundColor: 'rgba(139, 26, 26, 0.8)',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-white/40 text-xs line-clamp-1">{item.description}</p>
                </div>
                <span className="text-[#8B1A1A] font-bold">{Number(item.price).toFixed(0)} MAD</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button 
                  onClick={() => toggleAvailability(item)}
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${
                    item.is_available ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}
                >
                  {item.is_available ? 'Disponible' : 'Indisponible'}
                </button>
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{categories.find(c => c.id === item.category_id)?.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-[#251515] border border-white/10 rounded-3xl p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-display italic mb-8">{editingItem ? 'Modifier le plat' : 'Ajouter un plat'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Photo Upload Section */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#F5C5B8] ml-1">Photo du plat</label>
                  
                  {formData.image_url && (
                    <img 
                      src={formData.image_url}
                      alt="aperçu"
                      className="w-full h-48 object-cover rounded-2xl border border-white/10"
                    />
                  )}
                  
                  <label className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 cursor-pointer gap-3 bg-black/20 hover:bg-black/40 transition-all ${formData.image_url ? 'h-16' : 'h-40'}`}>
                    <Camera className="w-6 h-6 text-[#F5C5B8]" />
                    <span className="text-[#F5C5B8] text-xs font-bold">
                      {uploading ? 'Upload en cours...' : formData.image_url ? 'Changer la photo' : 'Cliquer pour ajouter une photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const url = await uploadImage(file);
                          setFormData({ ...formData, image_url: url });
                        } catch (err) {
                          showNotification('Erreur upload image', 'error');
                        }
                        setUploading(false);
                      }}
                    />
                  </label>
                  
                  <input
                    placeholder="Ou coller une URL d'image"
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none focus:border-[#8B1A1A]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Nom</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#8B1A1A]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#8B1A1A] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Prix (MAD)</label>
                    <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#8B1A1A]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Catégorie</label>
                    <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#8B1A1A]">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={uploading} className="w-full bg-[#8B1A1A] hover:bg-[#6B1414] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#8B1A1A]/20">Enregistrer</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReservationsView({ showNotification }: { showNotification: (msg: string, type?: 'success' | 'error') => void }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const { data } = await supabase
      .from('reservations')
      .select('id, user_id, reservation_date, reservation_time, number_of_guests, status, special_requests, first_name, phone, created_at')
      .order('reservation_date', { ascending: false })
      .limit(100);
    if (data) setReservations(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('reservations').update({ status }).eq('id', id);
    fetchReservations();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8B1A1A]" /></div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-display italic">Réservations</h2>
      <div className="grid gap-6">
        {reservations.map(res => (
          <div key={res.id} className="bg-[#251515] border border-white/5 p-8 rounded-3xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center text-[#8B1A1A] text-xl font-bold border border-[#8B1A1A]/20">
                {res.number_of_guests}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold uppercase tracking-tight">{new Date(res.reservation_date).toLocaleDateString('fr-FR')} à {res.reservation_time}</h3>
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                    res.status === 'confirmé' ? 'bg-emerald-950 text-emerald-500 border-emerald-900/50' : 
                    res.status === 'rejeté' ? 'bg-red-950 text-red-500 border-red-900/50' : 
                    'bg-amber-950 text-amber-500 border-amber-900/50'
                  }`}>{res.status}</span>
                </div>
                <div className="flex items-center gap-4 text-white/40 text-xs mt-1">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {res.first_name || 'Client'}</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {res.phone || 'N/A'}</span>
                </div>
                <p className="text-white/40 text-sm italic">{res.special_requests || 'Aucune demande spéciale'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {res.status === 'en_attente' && (
                <>
                  <button onClick={() => updateStatus(res.id, 'confirmé')} className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-600/20"><CheckCircle2 className="w-5 h-5" /></button>
                  <button onClick={() => updateStatus(res.id, 'rejeté')} className="p-3 bg-[#8B1A1A] hover:bg-[#6B1414] text-white rounded-xl transition-all shadow-lg shadow-[#8B1A1A]/20"><XCircle className="w-5 h-5" /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20 border border-white/10"><Settings className="w-10 h-10" /></div>
      <h2 className="text-2xl font-display italic text-white/60">{title}</h2>
      <p className="text-white/20 text-sm uppercase tracking-widest font-bold">En cours de développement</p>
    </div>
  );
}
