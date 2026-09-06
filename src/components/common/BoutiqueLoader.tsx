'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Fullscreen luxury boutique loading screen.
 * Seamlessly adapts to Dark Mode (#041A17) and Light Mode (#FAF8F5) with gold (#DFBD76) accents.
 */
export function BoutiquePageLoader({ message = 'Opening Shree Sakhi Choli Vault...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#041A17] text-[#1C1917] dark:text-[#FAF6EC] px-4 select-none">
      {/* Background ambient royal glow */}
      <div className="absolute w-72 h-72 rounded-full bg-[#DFBD76]/10 dark:bg-[#DFBD76]/5 blur-3xl pointer-events-none" />

      {/* Royal Crest / Emblem */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#084C42] via-[#041A17] to-[#02100E] border-2 border-[#DFBD76]/60 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
          <div className="relative flex flex-col items-center justify-center">
            <span className="font-serif text-3xl font-extrabold text-[#DFBD76] drop-shadow-md">
              श्री
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#DFBD76] absolute -top-1 -right-2 animate-pulse" />
          </div>
        </div>
        {/* Pulsing ring around crest */}
        <div className="absolute -inset-1 rounded-3xl border border-[#DFBD76]/30 animate-ping opacity-30 pointer-events-none" />
      </div>

      {/* Boutique Branding */}
      <div className="text-center space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-widest text-[#084C42] dark:text-[#DFBD76]">
          SHREE SAKHI
        </h1>
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-[#78716C] dark:text-[#DFBD76]/70 font-medium">
          Royal Choli Rental Atelier
        </p>
      </div>

      {/* Dual Ring Gold Spinner */}
      <div className="relative w-12 h-12 mt-8 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-[#DFBD76]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[#DFBD76] border-r-[#DFBD76]/40 border-b-transparent border-l-transparent animate-spin" />
      </div>

      {/* Status Message */}
      <p className="text-xs sm:text-sm font-medium text-[#78716C] dark:text-[#9BB5AF] animate-pulse">
        {message}
      </p>

      {/* Subtle bottom tag */}
      <span className="mt-8 text-[10px] tracking-wider text-[#A8A29E] dark:text-[#5C7D76]">
        HAUTE COUTURE • RENTAL MANAGEMENT SYSTEM
      </span>
    </div>
  );
}

/**
 * Single skeleton card matching the exact dimensions of an Outfit card.
 */
export function CholiCardSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] overflow-hidden shadow-sm animate-pulse">
      {/* Image Skeleton (aspect-[3/4]) */}
      <div className="relative aspect-[3/4] bg-stone-200/70 dark:bg-[#041A17] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        {/* Top badges skeleton */}
        <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-stone-300 dark:bg-[#1A3E38]" />
        <div className="absolute top-3 right-3 w-12 h-5 rounded-full bg-stone-300 dark:bg-[#1A3E38]" />
      </div>

      {/* Card Info Skeleton */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & Status */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-stone-200 dark:bg-[#1A3E38]" />
            <div className="h-4 w-16 rounded-full bg-stone-200 dark:bg-[#1A3E38]" />
          </div>
          {/* Title */}
          <div className="h-5 w-3/4 rounded bg-stone-300 dark:bg-[#1A3E38]" />
          <div className="h-3 w-1/2 rounded bg-stone-200 dark:bg-[#1A3E38]" />
        </div>

        {/* Pricing Box Skeleton */}
        <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/60 dark:border-[#1A3E38]/60 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-12 rounded bg-stone-200 dark:bg-[#1A3E38]" />
            <div className="h-4 w-20 rounded bg-stone-300 dark:bg-[#DFBD76]/30" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-2.5 w-12 rounded bg-stone-200 dark:bg-[#1A3E38] ml-auto" />
            <div className="h-4 w-16 rounded bg-stone-300 dark:bg-[#1A3E38] ml-auto" />
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="h-10 w-full rounded-2xl bg-stone-200 dark:bg-[#1A3E38]" />
      </div>
    </div>
  );
}

/**
 * Grid of 6 luxury skeleton cards for ShowroomGallery during initial data fetch.
 */
export function CholiGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38]">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-[#DFBD76] border-t-transparent animate-spin" />
          <span className="text-xs font-serif font-bold text-[#084C42] dark:text-[#DFBD76]">
            Opening Shree Sakhi vault & fetching couture...
          </span>
        </div>
        <span className="text-[11px] text-[#78716C] dark:text-[#9CA3AF] animate-pulse hidden sm:inline">
          Live Inventory Sync
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <CholiCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
