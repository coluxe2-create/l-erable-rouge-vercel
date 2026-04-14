import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle2, 
  Navigation,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { Delivery } from '../types';

export default function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const data = await api.deliveries.getAll();
      setDeliveries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await api.deliveries.updateStatus(id, { delivery_status: status });
      await fetchDeliveries();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en attente': return 'bg-amber-950 text-amber-500 border-amber-900/50';
      case 'en cours': return 'bg-blue-950 text-blue-500 border-blue-900/50';
      case 'livré': return 'bg-emerald-950 text-emerald-500 border-emerald-900/50';
      default: return 'bg-stone-900 text-stone-500 border-stone-800';
    }
  };

  if (loading) return <div className="p-8 text-gray-text">Chargement des livraisons...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Suivi des Livraisons</h1>
        <p className="text-gray-text">Gérez les coursiers et les statuts de livraison</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {deliveries.map((delivery) => (
          <motion.div
            key={delivery.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card-black border border-border-dark rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border-dark flex items-center justify-between bg-deep-black/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-red/10 rounded-xl flex items-center justify-center text-primary-red border border-primary-red/30">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Commande #{delivery.order_id.toString().slice(-4)}</h3>
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${getStatusColor(delivery.delivery_status)}`}>
                    {delivery.delivery_status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{Number(delivery.total_price).toFixed(2)} MAD</p>
                <p className="text-gray-text text-xs">Total commande</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-gray-text text-[10px] uppercase tracking-widest font-bold">Client</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-stone-300">
                      <User className="w-4 h-4 text-primary-red" />
                      <span className="text-sm font-medium">{delivery.first_name} {delivery.last_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-300">
                      <Phone className="w-4 h-4 text-primary-red" />
                      <span className="text-sm font-medium">{delivery.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-gray-text text-[10px] uppercase tracking-widest font-bold">Adresse</h4>
                  <div className="flex items-start gap-3 text-stone-300">
                    <MapPin className="w-4 h-4 text-primary-red mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">{delivery.delivery_address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border-dark flex flex-wrap gap-3">
                {delivery.delivery_status === 'en attente' && (
                  <button
                    onClick={() => handleStatusUpdate(delivery.id, 'en cours')}
                    disabled={updatingId === delivery.id}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {updatingId === delivery.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                    Assigner / Partir
                  </button>
                )}
                {delivery.delivery_status === 'en cours' && (
                  <button
                    onClick={() => handleStatusUpdate(delivery.id, 'livré')}
                    disabled={updatingId === delivery.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {updatingId === delivery.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Marquer comme livré
                  </button>
                )}
                {delivery.delivery_status === 'livré' && (
                  <div className="w-full p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-500 text-sm font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Livraison effectuée
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
