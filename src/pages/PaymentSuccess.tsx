import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-serif italic text-stone-900">Paiement Réussi !</h1>
          <p className="text-stone-500 leading-relaxed">
            Votre paiement a été traité avec succès par CMI. <br/>
            Votre commande est maintenant en cours de préparation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <a 
            href="/history"
            className="bg-stone-900 text-white font-bold py-4 px-8 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-stone-900/10 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Suivre ma commande
          </a>
          <a 
            href="/"
            className="bg-stone-100 text-stone-600 font-bold py-4 px-8 rounded-2xl hover:bg-stone-200 transition-all"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
