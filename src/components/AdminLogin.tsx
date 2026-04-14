import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface AdminLoginProps {
  onLogin: (token: string, user: any) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.auth.login({ email, password });
      if (data.user.role !== 'admin') {
        throw new Error('Accès réservé aux administrateurs');
      }
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-deep-black/95 border border-primary-red/30 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-red/10 rounded-full mb-4 border border-primary-red/30">
            <Lock className="w-8 h-8 text-primary-red" />
          </div>
          <h1 className="text-2xl font-bold text-white">L'Érable Rouge</h1>
          <p className="text-gray-text mt-2">Panel d'Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-primary-red/10 border border-primary-red/30 rounded-xl flex items-center gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-text ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-deep-black/50 border border-primary-red/20 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
                placeholder="admin@lerable-rouge.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-text ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-deep-black/50 border border-primary-red/20 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-red hover:bg-secondary-red disabled:bg-secondary-red/50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-red/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Se connecter
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
