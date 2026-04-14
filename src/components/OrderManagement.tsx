import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChefHat, 
  Truck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.orders.getAll();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.orders.updateStatus(id, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-amber-950 text-amber-500 border-amber-900/50';
      case 'en_preparation': return 'bg-blue-950 text-blue-500 border-blue-900/50';
      case 'en_route': return 'bg-indigo-950 text-indigo-500 border-indigo-900/50';
      case 'livre': return 'bg-emerald-950 text-emerald-500 border-emerald-900/50';
      case 'annule': return 'bg-red-950 text-red-500 border-red-900/50';
      default: return 'bg-stone-900 text-stone-500 border-stone-800';
    }
  };

  if (loading) return <div className="p-8 text-gray-text">Chargement des commandes...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestion des Commandes</h1>
        <p className="text-gray-text">Suivi et mise à jour des commandes clients</p>
      </div>

      <div className="space-y-4">
        {Array.isArray(orders) && orders.map((order: any) => (
          <motion.div
            key={order.id}
            layout
            className="bg-card-black border border-border-dark rounded-2xl overflow-hidden"
          >
            <div 
              className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                <div className="w-14 h-14 bg-primary-red/10 rounded-2xl flex items-center justify-center text-primary-red font-bold text-lg border border-primary-red/30 flex-shrink-0">
                  #{order.id.toString().slice(-4)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-bold text-lg uppercase tracking-tight">
                      {order.mode}
                    </h3>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status === 'en_attente' ? 'En attente' : 
                       order.status === 'en_preparation' ? 'En préparation' : 
                       order.status === 'en_route' ? 'En route' : 
                       order.status === 'livre' ? 'Livré' : 
                       order.status === 'annule' ? 'Annulé' : order.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <User className="w-4 h-4 text-primary-red" />
                        {order.first_name || 'Client Anonyme'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-text text-sm">
                        <Phone className="w-4 h-4 text-primary-red" />
                        {order.phone || 'Non renseigné'}
                      </div>
                    </div>
                    
                    {order.mode === 'livraison' && (
                      <div className="flex items-start gap-2 text-gray-text text-sm">
                        <MapPin className="w-4 h-4 text-primary-red mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{order.delivery_address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-gray-text text-xs border-t border-white/5 pt-3">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.created_at).toLocaleString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {Number(order.total_price).toFixed(0)} MAD
                    </span>
                    {order.payment_method && (
                      <span className={`px-2 py-0.5 rounded border ${
                        order.payment_method === 'carte' ? 'bg-blue-950 text-blue-400 border-blue-900/50' : 'bg-stone-800 text-gray-text border-stone-700'
                      }`}>
                        {order.payment_method === 'carte' ? 'CARTE' : 'CASH'}
                      </span>
                    )}
                    {order.payment_status && (
                      <span className={`px-2 py-0.5 rounded border ${
                        order.payment_status === 'payé' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/50' : 
                        order.payment_status === 'échoué' ? 'bg-red-950 text-red-400 border-red-900/50' : 
                        'bg-amber-950 text-amber-400 border-amber-900/50'
                      }`}>
                        {order.payment_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                <div className="flex gap-2 w-full lg:w-auto">
                  {order.status === 'en_attente' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'en_preparation'); }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-lg shadow-emerald-600/20 font-bold text-sm"
                    >
                      <ChefHat className="w-4 h-4" />
                      PRÉPARER
                    </button>
                  )}
                  {order.status === 'en_preparation' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'en_route'); }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-lg shadow-emerald-600/20 font-bold text-sm"
                    >
                      <Truck className="w-4 h-4" />
                      EXPÉDIER
                    </button>
                  )}
                  {order.status === 'en_route' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'livre'); }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-lg shadow-emerald-600/20 font-bold text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      LIVRÉ
                    </button>
                  )}
                  {order.status !== 'annule' && order.status !== 'livre' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'annule'); }}
                      className="p-2 bg-primary-red hover:bg-secondary-red text-white rounded-xl transition-colors shadow-lg shadow-primary-red/20"
                      title="Annuler la commande"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="text-gray-text ml-2 hidden lg:block">
                  {expandedOrder === order.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border-dark bg-deep-black/30"
                >
                  <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-gray-text text-xs font-bold uppercase tracking-widest">Détails de la commande</h4>
                      <div className="space-y-4">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-white border-b border-border-dark pb-2">
                            <div className="flex flex-col">
                              <span className="font-bold">{item.products?.name}</span>
                              <span className="text-gray-text text-xs">{item.quantity} x {Number(item.unit_price).toFixed(0)} MAD</span>
                            </div>
                            <span className="font-bold">{Number(item.subtotal).toFixed(0)} MAD</span>
                          </div>
                        ))}
                        <div className="space-y-1 pt-2 border-t border-border-dark">
                          <div className="flex items-center justify-between text-main-text font-bold text-lg pt-2">
                            <span>TOTAL TTC</span>
                            <span>{Number(order.total_price).toFixed(0)} MAD</span>
                          </div>
                        </div>
                        {order.transaction_id && (
                          <div className="text-[10px] text-gray-text font-mono mt-4">
                            ID Transaction: {order.transaction_id}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-gray-text text-xs font-bold uppercase tracking-widest">Informations Client</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-stone-300">
                          <User className="w-5 h-5 text-primary-red" />
                          <div className="flex flex-col">
                            <span className="font-bold">{order.first_name || 'Client Anonyme'}</span>
                            <span className="text-gray-text text-sm">{order.email || 'Pas d\'email'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-stone-300">
                          <Phone className="w-5 h-5 text-primary-red" />
                          <span>{order.phone || 'Non renseigné'}</span>
                        </div>
                        {order.mode === 'livraison' && (
                          <div className="flex items-start gap-3 text-stone-300">
                            <MapPin className="w-5 h-5 text-primary-red mt-0.5" />
                            <div className="flex flex-col">
                              <span className="font-bold">Adresse de livraison:</span>
                              <span className="text-gray-text text-sm">{order.delivery_address}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
