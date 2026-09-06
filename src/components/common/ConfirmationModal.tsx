'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, 
  Trash2, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  X,
  Sparkles
} from 'lucide-react';

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

export interface ItemPreviewData {
  title: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  details?: { label: string; value: string }[];
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  itemPreview?: ItemPreviewData;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  itemPreview,
  isLoading = false,
}: ConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key press & scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !mounted) return null;

  // Visual styles by confirmation type
  const typeConfig = {
    danger: {
      icon: Trash2,
      badgeColor: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50',
      confirmButton: 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-lg shadow-red-600/30',
      borderColor: 'border-red-200 dark:border-red-900/50',
      tag: 'Destructive Action',
    },
    warning: {
      icon: AlertCircle,
      badgeColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      confirmButton: 'bg-gradient-to-r from-amber-600 to-[#DFBD76] hover:opacity-95 text-white shadow-lg shadow-amber-600/25',
      borderColor: 'border-amber-200 dark:border-amber-900/50',
      tag: 'Important Notice',
    },
    info: {
      icon: HelpCircle,
      badgeColor: 'bg-teal-50 dark:bg-[#084C42]/30 text-[#084C42] dark:text-[#DFBD76] border-[#DFBD76]/30',
      confirmButton: 'bg-gradient-to-r from-[#084C42] to-[#0D6357] hover:opacity-95 text-[#FAF6EC] border border-[#DFBD76]/50 shadow-lg shadow-[#084C42]/30',
      borderColor: 'border-[#EADFC9] dark:border-[#1A3E38]',
      tag: 'Boutique Confirmation',
    },
    success: {
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      confirmButton: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white shadow-lg shadow-emerald-600/25',
      borderColor: 'border-emerald-200 dark:border-emerald-900/50',
      tag: 'Action Ready',
    },
  }[type];

  const IconComponent = typeConfig.icon;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={!isLoading ? onClose : undefined}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`bg-white dark:bg-[#072622] rounded-3xl border ${typeConfig.borderColor} max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center transform animate-in zoom-in-95 duration-200 relative my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-[#0A2E28] text-stone-400 hover:text-stone-600 dark:hover:text-[#DFBD76] transition-colors"
            title="Close popup"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Centered Top Icon with Soft Glow Ring & Tag */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 pt-1">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-md ${typeConfig.badgeColor}`}>
            <IconComponent className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#78716C] dark:text-[#9CA3AF] block">
              {typeConfig.tag}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF6EC] leading-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* Centered Description Body */}
        <p className="text-xs sm:text-sm text-[#78716C] dark:text-[#9CA3AF] leading-relaxed max-w-sm mx-auto text-center">
          {description}
        </p>

        {/* Optional Item Visual Preview Card */}
        {itemPreview && (
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] flex items-center gap-3.5 text-left mx-auto w-full shadow-sm">
            {itemPreview.image && (
              <div className="w-14 h-16 rounded-xl overflow-hidden border border-[#EADFC9] dark:border-[#1A3E38] flex-shrink-0 bg-stone-100 dark:bg-stone-900">
                <img 
                  src={itemPreview.image} 
                  alt={itemPreview.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-serif font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#FAF6EC] truncate">
                  {itemPreview.title}
                </p>
                {itemPreview.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#084C42]/10 dark:bg-[#DFBD76]/15 text-[#084C42] dark:text-[#DFBD76] flex-shrink-0">
                    {itemPreview.badge}
                  </span>
                )}
              </div>
              {itemPreview.subtitle && (
                <p className="text-[11px] text-[#78716C] dark:text-[#9CA3AF] truncate">
                  {itemPreview.subtitle}
                </p>
              )}
              {itemPreview.details && itemPreview.details.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-[#78716C] dark:text-[#9CA3AF] pt-0.5">
                  {itemPreview.details.map((d, i) => (
                    <span key={i}>
                      {d.label}: <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{d.value}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Centered Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] bg-white dark:bg-[#0A2E28] hover:bg-stone-50 dark:hover:bg-[#072622] text-xs sm:text-sm font-bold text-[#1C1917] dark:text-[#FAF6EC] transition-all disabled:opacity-50 shadow-sm"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 ${typeConfig.confirmButton}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
