import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { Reservation } from '../types';

export default function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await api.reservations.getAll();
      setReservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.reservations.updateStatus(id, newStatus);
      await fetchReservations();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-amber-950 text-amber-500 border-amber-900/50';
      case 'confirmé': return 'bg-emerald-950 text-emerald-500 border-emerald-900/50';
      case 'rejeté': return 'bg-red-950 text-red-500 border-red-900/50';
      default: return 'bg-stone-900 text-stone-500 border-stone-800';
    }
  };

  if (loading) return <div className="p-8 text-gray-text">Chargement des réservations...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestion des Réservations</h1>
        <p className="text-gray-text">Confirmez ou rejetez les demandes de table</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reservations.map((res) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card-black border border-border-dark rounded-2xl p-6 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-red/10 rounded-xl flex items-center justify-center text-primary-red border border-primary-red/30">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{res.number_of_guests} Personnes</h3>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${getStatusColor(res.status)}`}>
                      {res.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-stone-300 font-medium">
                    <Calendar className="w-4 h-4 text-primary-red" />
                    {new Date(res.reservation_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-text text-sm">
                    <Clock className="w-4 h-4" />
                    {res.reservation_time}
                  </div>
                </div>
              </div>

              {res.special_requests && (
                <div className="p-4 bg-deep-black/30 rounded-xl border border-border-dark flex gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-text flex-shrink-0" />
                  <p className="text-gray-text text-sm italic">"{res.special_requests}"</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              {res.status === 'en_attente' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(res.id, 'confirmé')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Check className="w-5 h-5" />
                    Confirmer
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(res.id, 'rejeté')}
                    className="flex-1 bg-primary-red hover:bg-secondary-red text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-red/20"
                  >
                    <X className="w-5 h-5" />
                    Rejeter
                  </button>
                </>
              )}
              {res.status === 'confirmé' && (
                <button
                  onClick={() => handleStatusUpdate(res.id, 'annulé')}
                  className="w-full bg-primary-red hover:bg-secondary-red text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-red/20"
                >
                  <XCircle className="w-5 h-5" />
                  Annuler la réservation
                </button>
              )}
              {res.status === 'rejeté' && (
                <div className="w-full p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-500 text-sm font-bold flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Réservation rejetée
                </div>
              )}
              {res.status === 'annulé' && (
                <div className="w-full p-3 bg-stone-900/30 border border-stone-800 rounded-xl text-stone-500 text-sm font-bold flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Réservation annulée
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
