'use client';

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Camera } from 'lucide-react';

interface OutfitPhotoCarouselProps {
  images: string[];
  title: string;
  sku: string;
  onOpenLightbox: (imgUrl: string) => void;
  aspectRatio?: string;
}

export function OutfitPhotoCarousel({
  images,
  title,
  sku,
  onOpenLightbox,
  aspectRatio = 'aspect-[3/4]',
}: OutfitPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const isHorizontalSwipe = useRef(false);

  const safeImages = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop'];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  // Mobile Touch Swipe Handlers (Slide Right-to-Left for Next, Left-to-Right for Previous)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (safeImages.length <= 1) return;
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setDragOffset(0);
    setIsDragging(true);
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStartX === null || touchStartY === null) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    // Detect if the user is swiping horizontally or scrolling the page vertically
    if (!isHorizontalSwipe.current) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(diffY) > 8) {
        // Vertical page scroll detected -> cancel image drag
        setIsDragging(false);
        setDragOffset(0);
        return;
      }
    }

    if (isHorizontalSwipe.current) {
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = 35; // px required to change slide
    if (isHorizontalSwipe.current && Math.abs(dragOffset) > threshold) {
      if (dragOffset < -threshold) {
        // Slid right-to-left -> Next Photo
        handleNext();
      } else if (dragOffset > threshold) {
        // Slid left-to-right -> Previous Photo
        handlePrev();
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    setTouchStartX(null);
    setTouchStartY(null);
    isHorizontalSwipe.current = false;
  };

  const handleImageClick = (img: string) => {
    // Only open lightbox if user tapped without swiping
    if (Math.abs(dragOffset) < 10) {
      onOpenLightbox(img);
    }
  };

  return (
    <div 
      className={`relative ${aspectRatio} overflow-hidden bg-stone-100 dark:bg-stone-900 group select-none touch-pan-y`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Sliding Image Track with Live Drag & Smooth Spring Transition */}
      <div
        className="flex w-full h-full"
        style={{
          transform: isDragging && dragOffset !== 0
            ? `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`
            : `translateX(-${currentIndex * 100}%)`,
          transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
      >
        {safeImages.map((img, idx) => (
          <div
            key={idx}
            className="relative w-full h-full flex-shrink-0 cursor-pointer overflow-hidden"
            onClick={() => handleImageClick(img)}
          >
            <img
              src={img}
              alt={`${title} - Angle ${idx + 1}`}
              className="w-full h-full object-cover object-top pointer-events-none transition-transform duration-500 group-hover:scale-105"
              loading={idx === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Subtle Vignette Gradient for Luxury Fashion Feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Angle Count Pill (Top Right) */}
      {safeImages.length > 1 && (
        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-[#DFBD76] backdrop-blur-md border border-[#DFBD76]/30 shadow-md flex items-center gap-1 z-10 pointer-events-none">
          <Camera className="w-3 h-3 text-[#DFBD76]" />
          <span>{currentIndex + 1} / {safeImages.length}</span>
        </div>
      )}

      {/* Carousel Navigation Arrows: Subtle on mobile, hover-reveal on desktop */}
      {safeImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm shadow-md active:scale-90 z-20 sm:opacity-0 sm:group-hover:opacity-100"
            title="Previous Photo"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm shadow-md active:scale-90 z-20 sm:opacity-0 sm:group-hover:opacity-100"
            title="Next Photo"
            aria-label="Next Photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Pagination Indicator Dots (Bottom Center) */}
      {safeImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 z-20">
          {safeImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`transition-all rounded-full ${
                idx === currentIndex
                  ? 'w-4 h-1.5 bg-[#DFBD76] shadow-sm shadow-[#DFBD76]/50'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
              }`}
              title={`View photo ${idx + 1}`}
              aria-label={`View photo ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Trigger (Top Left on hover) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenLightbox(safeImages[currentIndex]);
        }}
        className="absolute top-3 left-3 p-1.5 rounded-full bg-black/50 hover:bg-black text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20"
        title="Full Screen View"
        aria-label="Full Screen View"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
