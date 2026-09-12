'use client';

import React, { useState, useEffect } from 'react';
import { Choli, CholiStatus } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCholiApi } from '@/store/choliSlice';
import { 
  X, 
  Sparkles, 
  Scissors, 
  Waves, 
  ShoppingBag, 
  Archive, 
  Check, 
  ShieldAlert,
  Clock,
  Shirt
} from 'lucide-react';
import { toast } from 'sonner';

interface UpdateStatusModalProps {
  choli: Choli | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (updatedCholi: Choli) => void;
}

interface StatusOption {
  value: CholiStatus;
  title: string;
  badge: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  selectedRing: string;
  description: string;
  warningNote?: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'AVAILABLE',
    title: 'Ready & Available',
    badge: 'Available',
    icon: Sparkles,
    colorClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800/50',
    selectedRing: 'ring-2 ring-emerald-500 border-emerald-500',
    description: 'Pristine condition. Displayed on showroom rack and available for instant client trials and event bookings.',
  },
  {
    value: 'AT_DRY_CLEANER',
    title: 'Dry Cleaning',
    badge: 'Dry Cleaning',
    icon: Waves,
    colorClass: 'text-sky-700 dark:text-sky-300',
    bgClass: 'bg-sky-50 dark:bg-sky-950/40',
    borderClass: 'border-sky-200 dark:border-sky-800/50',
    selectedRing: 'ring-2 ring-sky-500 border-sky-500',
    description: 'Sent to laundry for specialty fabric cleaning & steam ironing.',
    warningNote: 'Outfit will be protected from new event bookings while in laundry.',
  },
  {
    value: 'IN_ALTERATION',
    title: 'In Alteration',
    badge: 'In Alteration',
    icon: Scissors,
    colorClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-200 dark:border-amber-800/50',
    selectedRing: 'ring-2 ring-amber-500 border-amber-500',
    description: 'With boutique master tailor for blouse sizing, hooks, zipper, or skirt flare adjustments.',
    warningNote: 'Recommended to set back to Available once tailoring is inspected.',
  },
  {
    value: 'RENTED',
    title: 'Rented to Client',
    badge: 'Rented',
    icon: ShoppingBag,
    colorClass: 'text-[#084C42] dark:text-[#DFBD76]',
    bgClass: 'bg-[#084C42]/10 dark:bg-[#DFBD76]/15',
    borderClass: 'border-[#084C42]/25 dark:border-[#DFBD76]/40',
    selectedRing: 'ring-2 ring-[#084C42] dark:ring-[#DFBD76] border-[#084C42]',
    description: 'Dispatched or handed over to the client for their wedding or festive celebration.',
  },
  {
    value: 'RETIRED',
    title: 'Archived / Maintenance',
    badge: 'Archived',
    icon: Archive,
    colorClass: 'text-stone-700 dark:text-stone-300',
    bgClass: 'bg-stone-100 dark:bg-stone-800/60',
    borderClass: 'border-stone-300 dark:border-stone-700',
    selectedRing: 'ring-2 ring-stone-500 border-stone-500',
    description: 'Decommissioned, damaged, or placed in seasonal storage out of active showroom circulation.',
  },
];

export function UpdateStatusModal({ choli, isOpen, onClose, onStatusUpdated }: UpdateStatusModalProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  
  const [selectedStatus, setSelectedStatus] = useState<CholiStatus>('AVAILABLE');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (choli && isOpen) {
      setSelectedStatus(choli.status || 'AVAILABLE');
    }
  }, [choli, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !choli) return null;

  const currentOption = STATUS_OPTIONS.find((s) => s.value === choli.status) || STATUS_OPTIONS[0];
  const isChanged = selectedStatus !== choli.status;

  const handleConfirmUpdate = async () => {
    if (!isChanged) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      const resultAction = await dispatch(
        updateCholiApi({
          _id: choli._id,
          sku: choli.sku,
          status: selectedStatus,
        })
      ).unwrap();

      const newOption = STATUS_OPTIONS.find((s) => s.value === selectedStatus);
      toast.success(
        `Choli ${choli.sku} updated to "${newOption?.badge || selectedStatus}" successfully!`
      );

      if (onStatusUpdated) {
        onStatusUpdated(resultAction);
      }
      onClose();
    } catch (error: any) {
      console.error('Error updating choli status:', error);
      toast.error(error?.message || 'Failed to update choli status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#072622] rounded-3xl border border-[#DFBD76]/50 shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1.5rem)] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DFBD76]/20 border border-[#DFBD76]/40 flex items-center justify-center text-[#DFBD76] flex-shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                Update Choli Status
              </h2>
              <p className="text-[11px] text-[#E0E7E5]">
                Manage showroom lifecycle & garment care
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Choli Snapshot Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38]">
            <div className="w-14 h-16 rounded-xl overflow-hidden bg-black/10 flex-shrink-0 border border-[#DFBD76]/40">
              <img 
                src={choli.images?.[0] || '/logo.jpg'} 
                alt={choli.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#084C42] text-[#FAF6EC]">
                  {choli.sku}
                </span>
                <span className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] uppercase font-bold">
                  {choli.category}
                </span>
              </div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#1C1917] dark:text-[#FAF6EC] truncate mt-0.5">
                {choli.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-[#78716C] dark:text-[#9BB5AF]">Current:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentOption.bgClass} ${currentOption.colorClass} border ${currentOption.borderClass}`}>
                  <currentOption.icon className="w-3 h-3" />
                  <span>{currentOption.badge}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Status Selection Cards */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] dark:text-[#9BB5AF] block px-1">
              Select New Garment Status
            </span>

            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = selectedStatus === opt.value;
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedStatus(opt.value)}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? `${opt.selectedRing} ${opt.bgClass} shadow-md`
                        : 'border-[#EADFC9] dark:border-[#1A3E38] hover:border-[#DFBD76] bg-white dark:bg-[#072622]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${opt.bgClass} ${opt.colorClass} border ${opt.borderClass}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs sm:text-sm ${isSelected ? opt.colorClass : 'text-[#1C1917] dark:text-[#FAF6EC]'}`}>
                          {opt.title}
                        </span>
                        {choli.status === opt.value && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] mt-0.5 leading-relaxed">
                        {opt.description}
                      </p>
                      {opt.warningNote && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
                          <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                          <span>{opt.warningNote}</span>
                        </p>
                      )}
                    </div>

                    {/* Radio indicator */}
                    <div className="absolute right-3.5 top-4">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#084C42] dark:border-[#DFBD76] bg-[#084C42] dark:bg-[#DFBD76] text-white dark:text-stone-950'
                          : 'border-stone-300 dark:border-stone-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User/Staff Attribution Footer Note */}
          <div className="p-2.5 rounded-xl bg-[#DFBD76]/10 dark:bg-[#0A2E28] border border-[#DFBD76]/30 flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#9BB5AF]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#DFBD76]" />
              <span>
                Staff Member: <strong className="text-[#084C42] dark:text-[#DFBD76]">{currentUser?.name || 'Staff User'}</strong> ({currentUser?.role === 'ADMIN' ? '👑 Boutique Admin' : (currentUser?.employeeCode || 'Floor Staff')})
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] dark:bg-[#041A17] border-t border-[#EADFC9] dark:border-[#1A3E38] flex items-center justify-end gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#78716C] dark:text-[#9BB5AF] hover:bg-stone-200 dark:hover:bg-[#0A2E28] transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmUpdate}
            disabled={isUpdating || !isChanged}
            className={`py-2.5 px-5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all active:scale-95 ${
              isChanged && !isUpdating
                ? 'bg-gradient-to-r from-[#084C42] to-[#0D6357] hover:opacity-95 shadow-[#084C42]/30'
                : 'bg-stone-400 dark:bg-stone-700 cursor-not-allowed opacity-60'
            }`}
          >
            {isUpdating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating Status...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Status Change</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
