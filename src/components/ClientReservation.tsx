import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';

interface ClientReservationProps {
  onNavigate: (page: string) => void;
  user: any;
}

export default function ClientReservation({ onNavigate, user }: ClientReservationProps) {
  const [formData, setFormData] = useState({
    reservation_date: '',
    reservation_time: '',
    number_of_guests: '2',
    special_requests: '',
    phone: '',
    name: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.reservations.create({
        ...formData,
        number_of_guests: parseInt(formData.number_of_guests),
        first_name: formData.name,
        phone: formData.phone
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
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
          <h1 className="text-4xl font-serif italic text-main-text">Demande envoyée !</h1>
          <p className="text-secondary-text leading-relaxed">
            Votre demande de réservation a été transmise à notre équipe. <br/>
            Vous recevrez une confirmation par téléphone prochainement.
          </p>
        </div>
        <button 
          onClick={() => onNavigate('home')}
          className="bg-primary-red text-white font-bold py-4 px-10 rounded-2xl hover:bg-secondary-red transition-all shadow-lg shadow-primary-red/20"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={() => onNavigate('home')} className="p-3 hover:bg-bg-off-white border border-border-color transition-colors">
          <ArrowLeft className="w-5 h-5 text-main-text" />
        </button>
        <div className="space-y-1">
          <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px]">Réservation</span>
          <h1 className="text-4xl md:text-5xl font-display italic text-main-text">Réserver une Table</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <div className="space-y-16">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-display italic text-main-text leading-tight">
              Une table d'exception <br/> vous attend
            </h2>
            <p className="text-secondary-text leading-relaxed text-lg font-serif italic">
              Que ce soit pour un dîner romantique, un repas d'affaires ou une célébration en famille, nous mettons tout en œuvre pour faire de votre passage un moment inoubliable, empreint de sérénité et de raffinement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-10 bg-white border border-border-color space-y-6 shadow-[0_15px_30px_rgba(232,224,216,0.1)]">
              <div className="w-12 h-12 border border-border-color flex items-center justify-center text-accent-red">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-main-text">Horaires</h3>
                <p className="text-secondary-text font-serif italic text-sm">Ouvert tous les jours <br/> de 12:00 à 00:00</p>
              </div>
            </div>
            <div className="p-10 bg-white border border-border-color space-y-6 shadow-[0_15px_30px_rgba(232,224,216,0.1)]">
              <div className="w-12 h-12 border border-border-color flex items-center justify-center text-accent-red">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-main-text">Contact Direct</h3>
                <p className="text-secondary-text font-serif italic text-sm">Besoin d'assistance ? <br/> +212 5 28 XX XX XX</p>
              </div>
            </div>
          </div>

          <div className="w-full h-[400px] overflow-hidden rounded-[12px] border border-border-color p-2 bg-white shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0" 
              alt="Restaurant table" 
              className="w-full h-full object-cover grayscale-[0.2]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="bg-white border border-border-color p-12 shadow-[0_30px_60px_rgba(232,224,216,0.2)]">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Date souhaitée</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.reservation_date}
                    onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                    className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Heure</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                  <input
                    type="time"
                    required
                    value={formData.reservation_time}
                    onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                    className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Nombre de convives</label>
              <div className="relative">
                <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                <select
                  required
                  value={formData.number_of_guests}
                  onChange={(e) => setFormData({ ...formData, number_of_guests: e.target.value })}
                  className="elegant-input w-full pl-14 pr-6 py-5 text-xs appearance-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => (
                    <option key={n} value={n} className="bg-white">{n} Personnes</option>
                  ))}
                  <option value="20" className="bg-white">Plus de 12 (Groupe)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Nom complet</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/40" />
                <input
                  type="text"
                  required
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                />
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="elegant-input w-full pl-14 pr-6 py-5 text-xs"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-sans font-bold text-secondary-text uppercase tracking-[0.2em]">Demandes particulières (Optionnel)</label>
              <div className="relative">
                <MessageSquare className="absolute left-5 top-5 w-4 h-4 text-secondary-text/40" />
                <textarea
                  placeholder="Allergies, anniversaire, préférence de table..."
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  className="elegant-input w-full pl-14 pr-6 py-5 h-32 resize-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="elegant-button w-full py-5"
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-4">
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmer la demande
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
