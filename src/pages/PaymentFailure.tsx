import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, RefreshCcw, Home } from 'lucide-react';

export default function PaymentFailure() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-xl shadow-red-500/20"
        >
          <XCircle className="w-12 h-12" />
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-serif italic text-stone-900">Échec du Paiement</h1>
          <p className="text-stone-500 leading-relaxed">
            Désolé, votre paiement n'a pas pu être traité par CMI. <br/>
            Veuillez vérifier vos informations bancaires et réessayer.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <a 
            href="/cart"
            className="bg-red-700 text-white font-bold py-4 px-8 rounded-2xl hover:bg-red-800 transition-all shadow-lg shadow-red-900/10 flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Réessayer le paiement
          </a>
          <a 
            href="/"
            className="bg-stone-100 text-stone-600 font-bold py-4 px-8 rounded-2xl hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
