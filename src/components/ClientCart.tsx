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
  User,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Navigation,
  CreditCard,
  Lock
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { sendTelegramNotification, formatOrderMessage } from '../services/telegram';

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

const RESTAURANT_POS: [number, number] = [30.4374353, -9.5677936]; // Avenue Larache, Agadir
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
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const [orderType, setOrderType] = useState<'livraison' | 'sur place'>('livraison');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'carte'>('cash');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);

  useEffect(() => {
    if (orderSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [orderSuccess]);

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]);
      setPhone(user.phone || '');
    }
  }, [user]);

  const finalTotal = total;

  const handleLocationSelect = async (lat: number, lng: number) => {
    setMapPosition([lat, lng]);
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Validation explicite
    if (!firstName.trim()) {
      setError('Veuillez entrer votre nom.');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    if (!phone.trim()) {
      setError('Veuillez entrer votre numéro de téléphone.');
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }
    if (orderType === 'livraison' && !address.trim()) {
      setError('Veuillez indiquer votre adresse de livraison.');
      window.scrollTo({ top: 500, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      console.log('[Order] Starting submission...', { firstName, orderType, itemsCount: items.length });
      
      const orderData = {
        user_id: user?.id || null,
        first_name: firstName.trim(),
        phone: phone.trim(),
        delivery_address: orderType === 'livraison' ? address.trim() : '',
        mode: orderType,
        total_price: finalTotal,
        status: 'en_attente',
        payment_method: paymentMethod,
        special_notes: notes.trim(),
      };

      // 1. Créer la commande
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (orderError) {
        console.error('[Order] Supabase Error:', orderError);
        throw new Error(orderError.message || 'Erreur lors de la création de la commande');
      }

      if (!orders || orders.length === 0) {
        throw new Error('La commande n\'a pas pu être créée');
      }

      const order = orders[0];
      console.log('[Order] Created successfully:', order.id);

      // 2. Créer les items de la commande
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('[OrderItems] Supabase Error:', itemsError);
        throw new Error(itemsError.message || 'Erreur lors de l\'ajout des articles');
      }

      // Si c'est une livraison, on s'assure qu'elle est aussi dans la table deliveries si elle existe
      try {
        if (orderType === 'livraison') {
          await supabase.from('deliveries').insert([{
            order_id: order.id,
            delivery_address: address.trim(),
            delivery_status: 'en attente'
          }]);
        }
      } catch (delErr) {
        // Optionnel : ne pas bloquer si la table deliveries n'existe pas ou a un problème
        console.warn('Could not insert into deliveries table:', delErr);
      }

      // Envoyer notification Telegram
      try {
        const notificationItems = items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price
        }));
        const message = formatOrderMessage(orderData, notificationItems);
        await sendTelegramNotification(message);
      } catch (tgErr) {
        console.error('Erreur notification Telegram:', tgErr);
      }

      console.log('[Order] Process complete');
      setLastOrderTotal(finalTotal);
      setOrderSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error('[Order] Submission failed:', err);
      setError(err.message || 'Une erreur est survenue lors de la validation de votre commande. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-xl shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-4xl font-serif italic text-main-text">Merci pour votre commande !</h1>
          <p className="text-secondary-text leading-relaxed">
            Votre commande a été reçue et est en cours de préparation. <br/>
            <span className="font-bold text-main-text">Vous paierez {lastOrderTotal.toFixed(0)} MAD à la réception de votre commande.</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button 
            onClick={() => onNavigate('home')}
            className="bg-primary-red text-white font-bold py-4 px-8 rounded-2xl hover:bg-secondary-red transition-all shadow-lg shadow-primary-red/20"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
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
              <h2 className="text-main-text font-sans font-bold uppercase tracking-[0.2em] text-[10px]">Articles ({items.length})</h2>
              <button onClick={clearCart} className="text-accent-red text-[10px] font-sans font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Vider le panier</button>
            </div>
            <div className="divide-y divide-border-color">
              {items.map((item) => (
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
                onClick={() => setOrderType('livraison')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                  orderType === 'livraison' ? 'bg-white text-accent-red border border-border-color shadow-sm' : 'text-secondary-text'
                }`}
              >
                <Truck className="w-4 h-4" />
                Livraison
              </button>
              <button
                onClick={() => setOrderType('sur place')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                  orderType === 'sur place' ? 'bg-white text-accent-red border border-border-color shadow-sm' : 'text-secondary-text'
                }`}
              >
                <Store className="w-4 h-4" />
                Sur place
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Votre Nom</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre nom complet"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="elegant-input w-full px-6 py-5 text-xs"
                  />
                </div>
                
                {orderType !== 'livraison' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Téléphone</label>
                    <input
                      type="tel"
                      required
                      placeholder="06 XX XX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="elegant-input w-full px-6 py-5 text-xs"
                    />
                  </div>
                )}
              </div>

              {orderType === 'livraison' && (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Localisation de livraison</label>
                    <div className="h-[350px] w-full border border-border-color relative">
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
                      <div className="absolute bottom-6 left-6 right-6 z-[1000] bg-white/90 backdrop-blur p-4 border border-border-color text-[9px] font-sans font-bold text-main-text uppercase tracking-[0.2em] text-center">
                        Cliquez sur la carte pour définir votre adresse
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Adresse à Agadir</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-5 w-4 h-4 text-secondary-text/40" />
                      <textarea
                        required
                        placeholder="Ex: Quartier Talborjt, Rue X, Imm Y..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="elegant-input w-full pl-14 pr-6 py-5 h-32 resize-none text-xs"
                      />
                      {geocoding && (
                        <div className="absolute right-5 top-5">
                          <Loader2 className="w-4 h-4 text-accent-red animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                      <input
                        type="tel"
                        required
                        placeholder="06 XX XX XX XX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Notes spéciales</label>
                    <textarea
                      placeholder="Instructions pour la cuisine ou le livreur..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="elegant-input w-full px-6 py-5 h-24 resize-none text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Méthode de paiement</label>
                <div className="grid grid-cols-2 gap-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center p-6 border transition-all duration-500 gap-4 ${
                      paymentMethod === 'cash' ? 'border-accent-red bg-bg-off-white text-accent-red' : 'border-border-color bg-white text-secondary-text/40'
                    }`}
                  >
                    <ShoppingBag className="w-6 h-6" />
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">Espèces</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex flex-col items-center justify-center p-6 border border-border-color bg-bg-off-white text-secondary-text/20 cursor-not-allowed gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 opacity-40" />
                      <Lock className="w-3 h-3 opacity-40" />
                    </div>
                    <span className="text-[9px] font-sans font-bold uppercase tracking-tight text-center">Carte Bancaire</span>
                  </button>
                </div>
                {paymentMethod === 'cash' && (
                  <p className="text-[10px] text-secondary-text font-serif italic text-center">Paiement à la réception de votre commande</p>
                )}
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

              {error && (
                <div className="p-4 bg-accent-red/10 border border-accent-red/20 text-accent-red text-[10px] font-sans font-bold uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="elegant-button w-full py-5"
              >
                {submitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-4">
                    <ShoppingBag className="w-5 h-5" />
                    Confirmer la commande
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
