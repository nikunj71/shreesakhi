'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Sparkles } from 'lucide-react';

interface OutfitPhotoCarouselProps {
  images: string[];
  title: string;
  sku: string;
  onOpenLightbox: (imgUrl: string) => void;
}

export function OutfitPhotoCarousel({ images, title, sku, onOpenLightbox }: OutfitPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeImages = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop'];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-900 group">
      {/* Main Image */}
      <img
        src={safeImages[currentIndex]}
        alt={`${title} - Angle ${currentIndex + 1}`}
        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 cursor-pointer"
        onClick={() => onOpenLightbox(safeImages[currentIndex])}
      />

      {/* Subtle Vignette Gradient for Luxury Fashion Feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Angle Count Pill */}
      {safeImages.length > 1 && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-[#DFBD76] backdrop-blur-md border border-[#C5A059]/30">
          {currentIndex + 1} / {safeImages.length}
        </div>
      )}

      {/* Carousel Navigation Arrows */}
      {safeImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md"
            title="Previous Angle"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md"
            title="Next Angle"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Micro-Thumbnail Strip Overlay */}
      {safeImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 z-10">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`relative w-4 h-5 rounded-sm overflow-hidden border transition-all ${
                idx === currentIndex
                  ? 'border-[#DFBD76] scale-110 shadow-sm shadow-[#C5A059]'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Trigger */}
      <button
        onClick={() => onOpenLightbox(safeImages[currentIndex])}
        className="absolute top-3 left-3 p-1.5 rounded-full bg-black/50 hover:bg-black text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
        title="Full Screen View"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
