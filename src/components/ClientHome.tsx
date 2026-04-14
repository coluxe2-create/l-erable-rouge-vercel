import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UtensilsCrossed, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  ChevronRight,
  Truck,
  ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';
import { Slide, Category } from '../types';
import Carousel from './Carousel';

interface ClientHomeProps {
  onNavigate: (page: string) => void;
  categories: Category[];
}

export default function ClientHome({ onNavigate, categories }: ClientHomeProps) {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await api.slides.getAll();
        setSlides(data);
      } catch (error) {
        console.error('Error fetching slides:', error);
      }
    };
    fetchSlides();
  }, []);

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <img 
            src="https://res.cloudinary.com/dmgsz5ihe/image/upload/q_auto/f_auto/v1775736611/WhatsApp_Image_2026-04-07_at_20.31.43_nrwy5t.jpg" 
            alt="L'Érable Rouge Interior" 
            className="w-full h-full object-cover opacity-100"
            referrerPolicy="no-referrer"
          />
          {/* Professional Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.7) 100%)'
            }}
          ></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <span className="inline-block text-white font-sans font-medium uppercase tracking-[0.4em] text-[10px] mb-8">
              Gastronomie Marocaine Contemporaine
            </span>
            <h1 
              className="text-7xl md:text-9xl font-display italic text-white mb-10 tracking-tight leading-[0.9]"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              L'Érable Rouge
            </h1>
            <div className="h-[1px] w-24 bg-white/60 mx-auto mb-12"></div>
            <p 
              className="text-white/90 text-xl md:text-3xl font-serif italic leading-relaxed max-w-3xl mx-auto"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              "Une escale de raffinement au cœur d'Agadir, où l'art de vivre rencontre l'excellence culinaire."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Carousel Section */}
      {slides.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-6">
          <Carousel slides={slides} />
        </section>
      )}

      {/* Quick Info & Actions Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 relative z-20"
      >
        <div className="bg-white border border-border-color p-10 md:p-20 shadow-[0_30px_60px_rgba(232,224,216,0.2)]">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16 mb-20">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 border border-border-color flex items-center justify-center text-accent-red">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-main-text mb-2">Horaires</h4>
                <p className="text-secondary-text font-serif italic text-sm">Ouvert 7j/7 • 12:00 - 00:00</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 border border-border-color flex items-center justify-center text-accent-red">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-main-text mb-2">Localisation</h4>
                <p className="text-secondary-text font-serif italic text-sm">Hay Mohammadi, Agadir</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6 col-span-2 md:col-span-1">
              <div className="w-12 h-12 border border-border-color flex items-center justify-center text-accent-red">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-main-text mb-2">Livraison</h4>
                <p className="text-secondary-text font-serif italic text-sm">Service premium à domicile</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center">
            <button 
              onClick={() => onNavigate('menu')}
              className="elegant-button w-full sm:w-auto min-w-[280px]"
            >
              Découvrir la carte
            </button>
          </div>
        </div>
      </motion.section>

      {/* Featured Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="max-w-7xl mx-auto px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-[4/5] overflow-hidden border border-border-color p-4 bg-white">
              <img 
                src="https://res.cloudinary.com/dmgsz5ihe/image/upload/q_auto/f_auto/v1775739165/IMG_8145_copie_vcutf5.webp" 
                alt="Notre Philosophie" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -bottom-12 -left-12 bg-bg-off-white border border-border-color p-12 hidden md:block max-w-xs"
            >
              <Star className="w-8 h-8 text-accent-red mb-6" />
              <p className="text-main-text font-serif italic text-xl leading-relaxed">
                "L'excellence culinaire au service de vos sens les plus raffinés."
              </p>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-10 order-1 lg:order-2"
          >
            <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px]">Notre Philosophie</span>
            <h2 className="text-5xl md:text-6xl font-display italic text-main-text leading-tight">
              Une passion pour le <br/> goût authentique
            </h2>
            <p className="text-secondary-text leading-relaxed text-lg font-serif italic">
              Situé à Hay Mohammadi, L'Érable Rouge est né d'une volonté de sublimer les produits du terroir marocain. Notre chef sélectionne chaque matin les meilleurs ingrédients pour vous offrir une expérience inoubliable, empreinte de tradition et de modernité.
            </p>
            <div className="grid grid-cols-2 gap-12 pt-8">
              <div>
                <p className="text-5xl font-display italic text-accent-red mb-3">15+</p>
                <p className="text-secondary-text text-[10px] uppercase tracking-[0.2em] font-sans font-bold">Années d'excellence</p>
              </div>
              <div>
                <p className="text-5xl font-display italic text-accent-red mb-3">100%</p>
                <p className="text-secondary-text text-[10px] uppercase tracking-[0.2em] font-sans font-bold">Produits Frais</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('menu')}
              className="inline-flex items-center gap-4 text-accent-red font-sans font-bold uppercase tracking-[0.3em] text-[10px] hover:gap-6 transition-all duration-500"
            >
              Explorer l'univers <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Preview */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="bg-bg-off-white py-32 px-6"
      >
        <div className="max-w-7xl mx-auto text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px] mb-6 block"
          >
            La Carte
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-display italic text-main-text mb-6"
          >
            Nos Spécialités
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-secondary-text max-w-2xl mx-auto font-serif italic text-lg"
          >
            Parcourez nos différentes catégories et laissez-vous tenter par nos créations culinaires exclusives.
          </motion.p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {[
            { name: 'Antipasti', img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=500', icon: '🥗' },
            { name: 'Pizzas Feu de Bois', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=500', icon: '🍕' },
            { name: 'Burgers', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500', icon: '🍔' },
            { name: 'Pasta au Choix', img: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=500', icon: '🍝' },
          ].map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -15 }}
              className="group cursor-pointer"
              onClick={() => onNavigate('menu')}
            >
              <div className="relative aspect-[3/4] md:aspect-[3/4] h-[180px] md:h-auto overflow-hidden mb-6 md:mb-8 border border-border-color p-1 md:p-2 bg-white">
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-main-text/0 group-hover:bg-main-text/10 transition-colors duration-700"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-10 h-10 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-xl">{cat.icon}</span>
                </div>
              </div>
              <h3 className="text-main-text font-display italic text-lg md:text-2xl mb-2 text-center">{cat.name}</h3>
              <div className="flex items-center justify-center gap-3 text-accent-red text-[9px] font-sans font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500">
                Découvrir <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Additional Story Sections */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="space-y-32 py-32 overflow-hidden"
      >
        {/* Section 1 */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 space-y-8"
            >
              <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px]">L'Art de la Table</span>
              <h2 className="text-4xl md:text-5xl font-display italic text-main-text leading-tight">
                Une atmosphère <br/> élégante et chaleureuse
              </h2>
              <p className="text-secondary-text leading-relaxed text-lg font-serif italic">
                À L'Érable Rouge, chaque détail compte. Notre décoration allie élégance moderne et touches traditionnelles pour créer une atmosphère chaleureuse et raffinée, idéale pour vos moments d'exception.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <div className="aspect-[16/10] overflow-hidden border border-border-color p-4 bg-white">
                <img 
                  src="https://res.cloudinary.com/dmgsz5ihe/image/upload/q_auto/f_auto/v1775739162/IMG_8130_copie_lsweam.webp" 
                  alt="L'Art de la Table" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1"
            >
              <div className="aspect-[16/10] overflow-hidden border border-border-color p-4 bg-white">
                <img 
                  src="https://res.cloudinary.com/dmgsz5ihe/image/upload/q_auto/f_auto/v1775739145/IMG_8131-Avec_accentuation-NR_copie_llapdx.webp" 
                  alt="Une Expérience Unique" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 space-y-8"
            >
              <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px]">Une Expérience Unique</span>
              <h2 className="text-4xl md:text-5xl font-display italic text-main-text leading-tight">
                Un voyage culinaire <br/> au cœur d'Agadir
              </h2>
              <p className="text-secondary-text leading-relaxed text-lg font-serif italic">
                Découvrez une cuisine qui raconte une histoire. Nos plats sont conçus pour éveiller vos sens et vous transporter dans un voyage culinaire inoubliable, où les saveurs du Maroc sont sublimées.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 space-y-8"
            >
              <span className="text-accent-red font-sans font-medium uppercase tracking-[0.3em] text-[10px]">Savoir-Faire & Tradition</span>
              <h2 className="text-4xl md:text-5xl font-display italic text-main-text leading-tight">
                L'excellence dans <br/> chaque assiette
              </h2>
              <p className="text-secondary-text leading-relaxed text-lg font-serif italic">
                Notre engagement envers la qualité se reflète dans chaque assiette. Nous honorons les recettes ancestrales tout en y apportant une touche de créativité contemporaine pour ravir les palais les plus exigeants.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <div className="aspect-[16/10] overflow-hidden border border-border-color p-4 bg-white">
                <img 
                  src="https://res.cloudinary.com/dmgsz5ihe/image/upload/q_auto/f_auto/v1775739165/IMG_8145_copie_vcutf5.webp" 
                  alt="Savoir-Faire & Tradition" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
