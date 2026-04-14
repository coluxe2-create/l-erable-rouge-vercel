import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Slide } from '../types';

interface CarouselProps {
  slides: Slide[];
}

const Carousel: React.FC<CarouselProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const activeSlides = Array.isArray(slides) ? slides.filter(s => s.actif) : [];

  const nextSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (activeSlides.length === 0) return null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="relative w-full h-[220px] md:h-[500px] overflow-hidden bg-deep-black">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) > 50;
            if (swipe) {
              if (offset.x > 0) prevSlide();
              else nextSlide();
            }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={activeSlides[currentIndex].photo_url}
            alt={activeSlides[currentIndex].titre || "Slide"}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {(activeSlides[currentIndex].titre || activeSlides[currentIndex].description) && (
            <div className="absolute inset-0 bg-deep-black/30 flex flex-col justify-center items-center text-center p-4">
              {activeSlides[currentIndex].titre && (
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-white text-xl md:text-5xl font-serif italic mb-1 md:mb-2"
                >
                  {activeSlides[currentIndex].titre}
                </motion.h2>
              )}
              {activeSlides[currentIndex].description && (
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/90 text-sm md:text-xl max-w-2xl line-clamp-2 md:line-clamp-none"
                >
                  {activeSlides[currentIndex].description}
                </motion.p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 p-1.5 md:p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 p-1.5 md:p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
      >
        <ChevronRight className="w-5 h-5 md:w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
