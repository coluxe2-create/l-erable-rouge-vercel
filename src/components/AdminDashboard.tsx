import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { api } from '../services/api';
import { Order, Reservation } from '../types';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, resData] = await Promise.all([
          api.orders.getAll(),
          api.reservations.getAll()
        ]);
        setOrders(ordersData);
        setReservations(resData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString(new Date());
  const todayOrders = Array.isArray(orders) ? orders.filter(o => {
    const oDate = o.created_at.includes('T') ? o.created_at.split('T')[0] : o.created_at;
    return oDate === today;
  }) : [];
  
  const todayReservations = Array.isArray(reservations) ? reservations.filter(r => {
    const rDate = r.reservation_date.includes('T') ? r.reservation_date.split('T')[0] : r.reservation_date;
    return rDate === today;
  }) : [];

  const confirmedUpcoming = Array.isArray(reservations) ? reservations.filter(r => {
    const rDate = r.reservation_date.includes('T') ? r.reservation_date.split('T')[0] : r.reservation_date;
    return r.status === 'confirmé' && rDate >= today;
  }).sort((a, b) => {
    const dateA = a.reservation_date.includes('T') ? a.reservation_date.split('T')[0] : a.reservation_date;
    const dateB = b.reservation_date.includes('T') ? b.reservation_date.split('T')[0] : b.reservation_date;
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return a.reservation_time.localeCompare(b.reservation_time);
  }) : [];
  const todayRevenue = todayOrders.reduce((acc, o) => acc + Number(o.total_price), 0);

  const stats = [
    { 
      label: "Commandes du jour", 
      value: todayOrders.length, 
      icon: <ShoppingBag className="w-6 h-6 text-primary-red" />,
      trend: "+12%",
      trendUp: true
    },
    { 
      label: "Réservations du jour", 
      value: todayReservations.length, 
      icon: <Calendar className="w-6 h-6 text-primary-red" />,
      trend: "+5%",
      trendUp: true
    },
    { 
      label: "Chiffre d'affaires", 
      value: `${todayRevenue.toFixed(2)} MAD`, 
      icon: <DollarSign className="w-6 h-6 text-primary-red" />,
      trend: "+18%",
      trendUp: true
    },
    { 
      label: "Temps moyen prép.", 
      value: "18 min", 
      icon: <Clock className="w-6 h-6 text-primary-red" />,
      trend: "-2 min",
      trendUp: false
    },
  ];

  if (loading) return <div className="p-8 text-gray-text">Chargement des statistiques...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-text">Aperçu des performances de L'Érable Rouge</p>
        </div>
        <div className="bg-card-black border border-border-dark rounded-xl px-4 py-2 text-gray-text text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card-black border border-border-dark rounded-2xl p-6 hover:border-primary-red/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary-red/10 rounded-xl group-hover:bg-primary-red/20 transition-colors">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-primary-red'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-gray-text text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card-black border border-border-dark rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-red" />
            Dernières Commandes
          </h2>
          <div className="space-y-4">
            {Array.isArray(orders) && orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-deep-black/30 rounded-xl border border-border-dark">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-red/10 rounded-full flex items-center justify-center text-primary-red font-bold text-xs">
                    #{order.id.toString().slice(-4)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{order.mode}</p>
                    <p className="text-gray-text text-xs">{new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{Number(order.total_price).toFixed(0)} MAD</p>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    order.status === 'livre' ? 'bg-emerald-950 text-emerald-500' : 'bg-primary-red/20 text-primary-red'
                  }`}>
                    {order.status === 'en_attente' ? 'En attente' : 
                     order.status === 'en_preparation' ? 'En préparation' : 
                     order.status === 'en_route' ? 'En route' : 
                     order.status === 'livre' ? 'Livré' : 
                     order.status === 'annule' ? 'Annulé' : order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card-black border border-border-dark rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-red" />
            Réservations à venir ({confirmedUpcoming.length})
          </h2>
          <div className="space-y-4">
            {confirmedUpcoming.slice(0, 5).map((res) => (
              <div key={res.id} className="flex items-center justify-between p-4 bg-deep-black/30 rounded-xl border border-border-dark">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-text">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{res.number_of_guests} personnes</p>
                    <p className="text-gray-text text-xs">
                      {new Date(res.reservation_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à {res.reservation_time}
                    </p>
                  </div>
                </div>
                <div className="text-emerald-500 text-[10px] uppercase font-bold tracking-widest">
                  Confirmé
                </div>
              </div>
            ))}
            {confirmedUpcoming.length === 0 && (
              <p className="text-gray-text text-center py-4 italic">Aucune réservation confirmée à venir.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
