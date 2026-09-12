'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Fullscreen luxury boutique loading screen.
 * Seamlessly adapts to Dark Mode (#041A17) and Light Mode (#FAF8F5) with gold (#DFBD76) accents.
 */
export function BoutiquePageLoader({ message = 'Opening Shree Sakhi Choli Vault...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#041A17] text-[#1C1917] dark:text-[#FAF6EC] px-4 select-none">
      {/* Background ambient royal glow */}
      <div className="absolute w-72 h-72 rounded-full bg-[#DFBD76]/10 dark:bg-[#DFBD76]/5 blur-3xl pointer-events-none" />

      {/* Royal Boutique Logo Emblem */}
      <div className="relative mb-6">
        <div className="h-20 sm:h-24 px-5 sm:px-6 rounded-3xl bg-[#025151] border-2 border-[#DFBD76]/70 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform overflow-hidden relative">
          <img
            src="/logo-cropped.png"
            alt="श्री SAKHI BOUTIQUE"
            className="h-12 sm:h-14 w-auto object-contain drop-shadow-md"
          />
          <Sparkles className="w-4 h-4 text-[#DFBD76] absolute top-2 right-2 animate-pulse" />
        </div>
        {/* Pulsing ring around crest */}
        <div className="absolute -inset-1.5 rounded-3xl border border-[#DFBD76]/40 animate-ping opacity-25 pointer-events-none" />
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

/**
 * Skeleton rows for Admin Choli Table view during inventory loading.
 */
export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-[#EADFC9]/40 dark:border-[#1A3E38]/50">
          {/* SKU */}
          <td className="py-3.5 px-4">
            <div className="h-4 w-16 rounded-full bg-stone-200 dark:bg-[#1A3E38]" />
          </td>
          {/* Choli Preview (Image + Name + Color) */}
          <td className="py-3.5 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-12 rounded-lg bg-stone-200 dark:bg-[#1A3E38] flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-32 rounded bg-stone-300 dark:bg-[#1A3E38]" />
                <div className="h-2.5 w-20 rounded bg-stone-200 dark:bg-[#1A3E38]/70" />
              </div>
            </div>
          </td>
          {/* Category */}
          <td className="py-3.5 px-4">
            <div className="h-5 w-20 rounded-full bg-stone-200 dark:bg-[#1A3E38]" />
          </td>
          {/* Status */}
          <td className="py-3.5 px-4">
            <div className="h-5 w-16 rounded-full bg-stone-200 dark:bg-[#1A3E38]" />
          </td>
          {/* Rental Price */}
          <td className="py-3.5 px-4 text-right">
            <div className="h-4 w-16 rounded bg-stone-300 dark:bg-[#DFBD76]/30 ml-auto" />
          </td>
          {/* Total Cost */}
          <td className="py-3.5 px-4 text-right">
            <div className="h-4 w-16 rounded bg-stone-200 dark:bg-[#1A3E38] ml-auto" />
          </td>
          {/* Cost Recovery / Break-even Progress */}
          <td className="py-3.5 px-4">
            <div className="space-y-1.5 max-w-[140px]">
              <div className="flex justify-between">
                <div className="h-2 w-8 rounded bg-stone-200 dark:bg-[#1A3E38]" />
                <div className="h-2 w-10 rounded bg-stone-200 dark:bg-[#1A3E38]" />
              </div>
              <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-[#1A3E38]" />
            </div>
          </td>
          {/* Actions */}
          <td className="py-3.5 px-4 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-[#1A3E38]" />
              <div className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-[#1A3E38]" />
              <div className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-[#1A3E38]" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

/**
 * Skeleton cards for BookingsList order register during fetch.
 */
export function BookingsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#072622] p-5 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm animate-pulse flex flex-col lg:flex-row lg:items-center justify-between gap-5"
        >
          {/* Customer & Choli details */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-20 rounded-xl bg-stone-200 dark:bg-[#1A3E38] flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 rounded bg-stone-300 dark:bg-[#1A3E38]" />
                <div className="h-4 w-16 rounded-full bg-stone-200 dark:bg-[#1A3E38]" />
              </div>
              <div className="h-3 w-40 rounded bg-stone-200 dark:bg-[#1A3E38]/80" />
              <div className="flex items-center gap-3 pt-1">
                <div className="h-3 w-24 rounded bg-stone-200 dark:bg-[#1A3E38]" />
                <div className="h-3 w-24 rounded bg-stone-200 dark:bg-[#1A3E38]" />
              </div>
            </div>
          </div>

          {/* Dates & Schedule */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-28 rounded-xl bg-stone-200 dark:bg-[#1A3E38]" />
            <div className="h-8 w-28 rounded-xl bg-stone-200 dark:bg-[#1A3E38]" />
          </div>

          {/* Financials & Status */}
          <div className="flex items-center gap-3">
            <div className="space-y-1 text-right">
              <div className="h-4 w-20 rounded bg-stone-300 dark:bg-[#DFBD76]/30 ml-auto" />
              <div className="h-3 w-16 rounded bg-stone-200 dark:bg-[#1A3E38] ml-auto" />
            </div>
            <div className="h-8 w-24 rounded-full bg-stone-200 dark:bg-[#1A3E38]" />
            <div className="h-8 w-20 rounded-xl bg-stone-200 dark:bg-[#1A3E38]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Booking Calendar grid while loading dates and outfits.
 */
export function BookingCalendarSkeleton() {
  return (
    <div className="bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] p-5 sm:p-6 shadow-sm animate-pulse space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EADFC9]/60 dark:border-[#1A3E38]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-[#1A3E38]" />
          <div className="space-y-1.5">
            <div className="h-5 w-36 rounded bg-stone-300 dark:bg-[#1A3E38]" />
            <div className="h-3 w-48 rounded bg-stone-200 dark:bg-[#1A3E38]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-48 rounded-2xl bg-stone-200 dark:bg-[#1A3E38]" />
          <div className="h-9 w-24 rounded-2xl bg-stone-200 dark:bg-[#1A3E38]" />
        </div>
      </div>

      {/* Weekday Grid */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
          <div key={d} className="h-6 rounded-lg bg-stone-200/60 dark:bg-[#1A3E38]/60" />
        ))}
      </div>

      {/* 35 Calendar Day Cells */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[70px] sm:min-h-[90px] p-2 rounded-2xl border border-[#EADFC9]/40 dark:border-[#1A3E38]/40 bg-[#FAF8F5]/50 dark:bg-[#041A17]/40 flex flex-col justify-between"
          >
            <div className="h-3.5 w-5 rounded bg-stone-300 dark:bg-[#1A3E38]" />
            {i % 4 === 1 && (
              <div className="h-4 w-full rounded bg-stone-300/80 dark:bg-[#DFBD76]/20 mt-1" />
            )}
            {i % 6 === 2 && (
              <div className="h-4 w-full rounded bg-stone-300/80 dark:bg-[#084C42]/20 mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Analytics & ROI Dashboard during financial calculations.
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38]">
        <div className="space-y-2">
          <div className="h-6 w-56 rounded bg-stone-300 dark:bg-[#1A3E38]" />
          <div className="h-3.5 w-72 rounded bg-stone-200 dark:bg-[#1A3E38]" />
        </div>
        <div className="h-9 w-32 rounded-2xl bg-stone-200 dark:bg-[#1A3E38]" />
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-stone-200 dark:bg-[#1A3E38]" />
              <div className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-[#1A3E38]" />
            </div>
            <div className="h-7 w-32 rounded bg-stone-300 dark:bg-[#DFBD76]/30" />
            <div className="h-3 w-40 rounded bg-stone-200 dark:bg-[#1A3E38]" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38] space-y-6">
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-44 rounded bg-stone-300 dark:bg-[#1A3E38]" />
              <div className="h-3 w-60 rounded bg-stone-200 dark:bg-[#1A3E38]" />
            </div>
            <div className="h-6 w-20 rounded-full bg-stone-200 dark:bg-[#1A3E38]" />
          </div>
          {/* Chart Bars Placeholder */}
          <div className="h-56 flex items-end justify-between gap-3 pt-8 px-2 border-b border-[#EADFC9]/60 dark:border-[#1A3E38]/60">
            {[40, 65, 30, 80, 95, 55, 75, 90, 60, 85, 70, 100].map((h, idx) => (
              <div key={idx} className="w-full flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-stone-200 dark:bg-[#1A3E38]"
                  style={{ height: `${h}%` }}
                />
                <div className="h-2.5 w-6 rounded bg-stone-200 dark:bg-[#1A3E38]" />
              </div>
            ))}
          </div>
        </div>

        {/* Donut / Secondary Stats */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38] space-y-6">
          <div className="space-y-1.5">
            <div className="h-5 w-36 rounded bg-stone-300 dark:bg-[#1A3E38]" />
            <div className="h-3 w-48 rounded bg-stone-200 dark:bg-[#1A3E38]" />
          </div>
          <div className="w-36 h-36 rounded-full border-8 border-stone-200 dark:border-[#1A3E38] mx-auto my-4" />
          <div className="space-y-2 pt-2">
            <div className="h-3.5 w-full rounded bg-stone-200 dark:bg-[#1A3E38]" />
            <div className="h-3.5 w-full rounded bg-stone-200 dark:bg-[#1A3E38]" />
            <div className="h-3.5 w-full rounded bg-stone-200 dark:bg-[#1A3E38]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Choli Detail Page (/choli/[id]) during fetch.
 */
export function CholiDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#041A17] text-[#1C1917] dark:text-[#F5F5F7] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
        {/* Top Back Nav & Actions */}
        <div className="flex items-center justify-between">
          <div className="h-9 w-28 rounded-2xl bg-stone-200 dark:bg-[#1A3E38]" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded-2xl bg-stone-200 dark:bg-[#1A3E38]" />
            <div className="h-9 w-9 rounded-2xl bg-stone-200 dark:bg-[#1A3E38]" />
          </div>
        </div>

        {/* Main Grid: Gallery on left, Info on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[3/4] rounded-3xl bg-stone-200 dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38] overflow-hidden" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="aspect-square rounded-2xl bg-stone-200 dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38]" />
              ))}
            </div>
          </div>

          {/* Right Column: Info & Booking */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="h-5 w-24 rounded-full bg-stone-200 dark:bg-[#1A3E38]" />
              <div className="h-8 w-3/4 rounded bg-stone-300 dark:bg-[#1A3E38]" />
              <div className="h-4 w-32 rounded bg-stone-200 dark:bg-[#1A3E38]" />
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38] grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-3 w-20 rounded bg-stone-200 dark:bg-[#1A3E38]" />
                <div className="h-7 w-28 rounded bg-stone-300 dark:bg-[#DFBD76]/30" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-20 rounded bg-stone-200 dark:bg-[#1A3E38]" />
                <div className="h-7 w-28 rounded bg-stone-300 dark:bg-[#1A3E38]" />
              </div>
            </div>

            {/* Spec pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38] space-y-1">
                  <div className="h-2.5 w-12 rounded bg-stone-200 dark:bg-[#1A3E38]" />
                  <div className="h-4 w-20 rounded bg-stone-300 dark:bg-[#1A3E38]" />
                </div>
              ))}
            </div>

            {/* Date Picker Check Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38] space-y-3">
              <div className="h-4 w-40 rounded bg-stone-300 dark:bg-[#1A3E38]" />
              <div className="h-11 w-full rounded-2xl bg-stone-200 dark:bg-[#1A3E38]" />
            </div>

            {/* Large CTA Button */}
            <div className="h-14 w-full rounded-2xl bg-stone-300 dark:bg-[#DFBD76]/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

