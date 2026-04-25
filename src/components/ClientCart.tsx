import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  Store, 
  MapPin, 
  Phone, 
  CheckCircle2,
  Loader2,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  Lock
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

// Fix Leaflet icon issues in Vite
const markerIcon2x = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
const markerIcon = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
const markerShadow = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const RESTAURANT_POS: [number, number] = [30.4374353, -9.5677936];
const AGADIR_CENTER: [number, number] = [30.4374353, -9.5677936];

interface ClientCartProps {
  onNavigate: (page: string) => void;
  user: any;
}

function LocationMarker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number) => void, position: [number, number] | null }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Votre adresse de livraison</Popup>
    </Marker>
  );
}

export default function ClientCart({ onNavigate, user }: ClientCartProps) {
  const { items: cartItems, updateQuantity, removeFromCart, total, clearCart } = useCart();
  
  // Correction 4: States manquants et unifiés
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('livraison');
  const [paymentMethod, setPaymentMethod] = useState('especes');
  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setMapPosition([lat, lng]);
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setGeocoding(false);
    }
  };

  // Correction 2: handleSubmitOrder optimisée
  const handleSubmitOrder = async () => {
    // Vérifications de base
    if (cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    
    if (!formData.firstName || formData.firstName.trim() === '') {
      alert('Veuillez entrer votre prénom');
      return;
    }
    
    if (!formData.phone || formData.phone.trim() === '') {
      alert('Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (deliveryMode === 'livraison' && (!formData.address || formData.address.trim() === '')) {
      alert('Veuillez entrer votre adresse de livraison');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculer le total
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );

      // 1. Créer la commande
      const orderData = {
        user_id: user?.id || null,
        first_name: formData.firstName.trim(),
        phone: formData.phone.trim(),
        delivery_address: deliveryMode === 'livraison' ? formData.address.trim() : 'Sur place',
        mode: deliveryMode,
        total_price: Math.round(totalAmount),
        status: 'en_attente',
        payment_method: paymentMethod,
        special_notes: formData.notes?.trim() || '',
      };

      console.log('Création commande:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Erreur commande:', orderError);
        alert('Erreur: ' + orderError.message);
        setIsSubmitting(false);
        return;
      }

      console.log('Commande créée:', order);

      // 2. Créer les order_items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Erreur items:', itemsError);
      }

      // 3. Notification Telegram
      try {
        const itemsList = cartItems.map(item =>
          `• ${item.name} x${item.quantity} — ${Math.round(item.price * item.quantity)} MAD`
        ).join('\n');

        const message = `🍁 NOUVELLE COMMANDE\n\n👤 ${orderData.first_name}\n📞 ${orderData.phone}\n🚗 ${orderData.mode}\n📍 ${orderData.delivery_address}\n\n${itemsList}\n\n💰 TOTAL: ${Math.round(totalAmount)} MAD`;

        await fetch(
          `https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: '8642890342', // ID du chat admin
              text: message,
            })
          }
        );
      } catch (telegramError) {
        console.warn('Telegram non envoyé:', telegramError);
      }

      // 4. Succès — vider le panier
      clearCart();
      setOrderConfirmed(true);
      
      // alert('✅ Commande confirmée ! Nous vous contacterons bientôt.')

    } catch (err: any) {
      console.error('Erreur inattendue:', err);
      alert('Erreur inattendue. Réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Correction 5: Page de confirmation
  if (orderConfirmed) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 40,
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20
      }}>
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          style={{ fontSize: 64 }}
        >
          ✅
        </motion.div>
        <h2 style={{
          color: '#8B1A1A',
          fontSize: 24,
          fontWeight: 'bold'
        }}>
          Commande confirmée !
        </h2>
        <p style={{ color: '#666', fontSize: 16 }}>
          Nous vous contacterons bientôt au <span style={{ fontWeight: 'bold' }}>{formData.phone}</span>
        </p>
        <button
          onClick={() => {
            setOrderConfirmed(false);
            onNavigate('home');
          }}
          style={{
            backgroundColor: '#8B1A1A',
            color: 'white',
            padding: '14px 32px',
            borderRadius: 10,
            border: 'none',
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: 20
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center space-y-8">
        <div className="w-24 h-24 bg-card-bg rounded-full flex items-center justify-center mx-auto text-secondary-text/20 border border-border-color">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-serif italic text-main-text">Votre panier est vide</h1>
          <p className="text-secondary-text">Laissez-vous tenter par nos délicieuses spécialités.</p>
        </div>
        <button 
          onClick={() => onNavigate('menu')}
          className="bg-primary-red text-white font-bold py-4 px-10 rounded-full hover:bg-secondary-red transition-all shadow-xl shadow-primary-red/20 flex items-center justify-center gap-3 mx-auto"
        >
          Découvrir le menu
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={() => onNavigate('menu')} className="p-3 hover:bg-bg-off-white border border-border-color transition-colors">
          <ArrowLeft className="w-5 h-5 text-main-text" />
        </button>
        <div className="space-y-1">
          <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px]">Votre Sélection</span>
          <h1 className="text-4xl md:text-5xl font-display italic text-main-text">Mon Panier</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white border border-border-color shadow-[0_20px_40px_rgba(232,224,216,0.1)]">
            <div className="p-8 border-b border-border-color bg-bg-off-white flex items-center justify-between">
              <h2 className="text-main-text font-sans font-bold uppercase tracking-[0.2em] text-[10px]">Articles ({cartItems.length})</h2>
              <button onClick={clearCart} className="text-accent-red text-[10px] font-sans font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Vider le panier</button>
            </div>
            <div className="divide-y divide-border-color">
              {cartItems.map((item) => (
                <div key={item.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-8 hover:bg-bg-off-white transition-colors duration-500">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 border border-border-color p-1 bg-white flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover grayscale-[0.2]" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary-text/10">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-display italic text-main-text">{item.name}</h3>
                      <p className="text-accent-red font-sans font-bold text-sm tracking-widest">{Number(item.price).toFixed(0)} MAD</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-10">
                    <div className="flex items-center gap-4 bg-bg-off-white p-1 border border-border-color">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-border-color text-secondary-text hover:text-accent-red transition-all duration-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-sans font-bold text-main-text text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-border-color text-secondary-text hover:text-accent-red transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-secondary-text/30 hover:text-accent-red transition-colors duration-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Form */}
        <div className="space-y-10">
          <div className="bg-white border border-border-color p-10 shadow-[0_30px_60px_rgba(232,224,216,0.2)] space-y-10">
            <h2 className="text-3xl font-display italic text-main-text">Récapitulatif</h2>
            
            <div className="flex p-1 bg-bg-off-white border border-border-color">
              <button
                onClick={() => setDeliveryMode('livraison')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                  deliveryMode === 'livraison' ? 'bg-white text-accent-red border border-border-color shadow-sm' : 'text-secondary-text'
                }`}
              >
                <Truck className="w-4 h-4" />
                Livraison
              </button>
              <button
                onClick={() => setDeliveryMode('sur place')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                  deliveryMode === 'sur place' ? 'bg-white text-accent-red border border-border-color shadow-sm' : 'text-secondary-text'
                }`}
              >
                <Store className="w-4 h-4" />
                Sur place
              </button>
            </div>

            <div className="space-y-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Votre Prénom *</label>
                  {/* Correction 3: Champ Prenom optimisé mobile */}
                  <input
                    type="text"
                    placeholder="Votre prénom *"
                    value={formData.firstName}
                    onChange={e => setFormData({
                      ...formData, firstName: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: 16,
                      borderRadius: 10,
                      border: '1px solid #ddd',
                      boxSizing: 'border-box',
                      WebkitAppearance: 'none',
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Téléphone *</label>
                  {/* Correction 3: Champ Téléphone optimisé mobile */}
                  <input
                    type="tel"
                    placeholder="Téléphone *"
                    value={formData.phone}
                    onChange={e => setFormData({
                      ...formData, phone: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: 16,
                      borderRadius: 10,
                      border: '1px solid #ddd',
                      boxSizing: 'border-box',
                      WebkitAppearance: 'none',
                    }}
                  />
                </div>
              </div>

              {deliveryMode === 'livraison' && (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Localisation de livraison</label>
                    <div className="h-[250px] w-full border border-border-color relative z-0">
                      <MapContainer center={AGADIR_CENTER} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={RESTAURANT_POS} icon={new L.Icon({
                          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34],
                          shadowSize: [41, 41]
                        })}>
                          <Popup>L'Érable Rouge</Popup>
                        </Marker>
                        <LocationMarker onLocationSelect={handleLocationSelect} position={mapPosition} />
                      </MapContainer>
                      <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-white/90 backdrop-blur p-2 border border-border-color text-[8px] font-sans font-bold text-main-text uppercase tracking-[0.1em] text-center">
                        Cliquez sur la carte pour définir votre adresse
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Adresse précise</label>
                    <textarea
                      placeholder="Ex: Quartier Talborjt, Rue X, Imm Y..."
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        fontSize: 16,
                        borderRadius: 10,
                        border: '1px solid #ddd',
                        boxSizing: 'border-box',
                        minHeight: 100,
                        WebkitAppearance: 'none',
                      }}
                    />
                    {geocoding && (
                      <div className="flex items-center gap-2 mt-1">
                        <Loader2 className="w-3 h-3 text-[#8B1A1A] animate-spin" />
                        <span className="text-[10px] text-gray-400">Recherche d'adresse...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Notes spéciales</label>
                    <textarea
                      placeholder="Instructions pour la cuisine ou le livreur..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        fontSize: 16,
                        borderRadius: 10,
                        border: '1px solid #ddd',
                        boxSizing: 'border-box',
                        minHeight: 80,
                        WebkitAppearance: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Méthode de paiement</label>
                <div className="grid grid-cols-2 gap-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('especes')}
                    className={`flex flex-col items-center justify-center p-6 border transition-all duration-500 gap-4 ${
                      paymentMethod === 'especes' ? 'border-accent-red bg-bg-off-white text-accent-red' : 'border-border-color bg-white text-secondary-text/40'
                    }`}
                  >
                    <ShoppingBag className="w-6 h-6" />
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">Espèces</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex flex-col items-center justify-center p-6 border border-border-color bg-bg-off-white text-secondary-text/20 cursor-not-allowed gap-4 opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 opacity-40" />
                      <Lock className="w-3 h-3 opacity-40" />
                    </div>
                    <span className="text-[9px] font-sans font-bold uppercase tracking-tight text-center">CB (Bientôt)</span>
                  </button>
                </div>
                <p className="text-[10px] text-secondary-text font-serif italic text-center">Paiement à la réception de votre commande</p>
              </div>

              <div className="pt-10 border-t border-border-color space-y-6">
                <div className="flex items-center justify-between text-secondary-text font-serif italic">
                  <span>Sous-total</span>
                  <span>{total.toFixed(0)} MAD</span>
                </div>
                <div className="flex items-center justify-between text-main-text pt-4">
                  <span className="text-xl font-display italic">Total</span>
                  <span className="text-2xl font-sans font-bold text-accent-red tracking-widest">{total.toFixed(0)} MAD</span>
                </div>
              </div>

              {/* Correction 1: Bouton Commander optimisé */}
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || cartItems.length === 0}
                style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: isSubmitting ? '#666' : '#8B1A1A',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 'bold',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.1em',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  minHeight: 56,
                  transition: 'background-color 0.3s ease',
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Commande en cours...</span>
                  </div>
                ) : (
                  'CONFIRMER LA COMMANDE'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
