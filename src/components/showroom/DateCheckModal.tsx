'use client';

import React, { useState } from 'react';
import { Choli, Booking } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openBookingModal } from '@/store/bookingSlice';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  X, 
  Sparkles, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import Button from '@mui/material/Button';

interface DateCheckModalProps {
  choli: Choli | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DateCheckModal({ choli, isOpen, onClose }: DateCheckModalProps) {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.bookings.items);

  // Default to today + 5 days
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 5);
  const defaultDateStr = defaultDate.toISOString().split('T')[0];

  const [checkDate, setCheckDate] = useState(defaultDateStr);

  if (!isOpen || !choli) return null;

  // Check if choli is booked on `checkDate`
  // An outfit is booked if checkDate falls between pickupDate and returnExpectedDate
  const conflictingBooking = bookings.find((b) => {
    if (b.status === 'CANCELLED' || b.choliId !== choli._id) return false;
    return checkDate >= b.pickupDate && checkDate <= b.returnExpectedDate;
  });

  const isAvailable = !conflictingBooking;

  // Find all future bookings for this choli to show a schedule list
  const futureBookings = bookings
    .filter((b) => b.choliId === choli._id && b.status !== 'CANCELLED')
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));

  const handleBookNow = () => {
    if (choli.status === 'AT_DRY_CLEANER') {
      toast.error(`"${choli.name}" (${choli.sku}) is currently at the dry cleaner and cannot be booked.`);
      return;
    }
    onClose();
    dispatch(openBookingModal(choli._id));
  };

  const formattedDate = new Date(checkDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1.5rem)] flex flex-col">
        
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] p-4 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DFBD76]/20 border border-[#DFBD76]/40 flex items-center justify-center text-[#DFBD76]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                Check Date Availability
              </h2>
              <p className="text-[11px] text-[#E0E7E5] truncate max-w-xs">
                {choli.name} ({choli.sku})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs sm:text-sm overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Choli Quick Summary */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38]">
            <img
              src={choli.images[0]}
              alt={choli.name}
              className="w-12 h-14 rounded-xl object-cover border border-[#EADFC9] dark:border-[#1A3E38]"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6EC] truncate">
                {choli.name}
              </p>
              <p className="text-[11px] text-[#78716C] dark:text-[#9BB5AF]">
                SKU: <strong className="text-[#DFBD76]">{choli.sku}</strong> • Rent: <strong className="text-[#15803D] dark:text-[#22C55E]">₹{(choli.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}</strong>/event
              </p>
            </div>
          </div>

          {/* Date Selector Input (MUI DatePicker) */}
          <div className="space-y-2">
            <label className="font-bold text-xs uppercase tracking-wider text-[#1C1917] dark:text-[#FAF6EC] block">
              Select Your Target Event Date:
            </label>
            <div className="p-2 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border-2 border-[#DFBD76]">
              <DatePicker
                value={checkDate ? dayjs(checkDate) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue && newValue.isValid()) {
                    setCheckDate(newValue.format('YYYY-MM-DD'));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'medium',
                    variant: 'standard',
                    slotProps: {
                      input: { disableUnderline: true },
                    },
                    sx: {
                      px: 1,
                      '& .MuiInputBase-input': {
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#084C42',
                      },
                    },
                  },
                  popper: {
                    sx: { zIndex: 9999 },
                  },
                }}
              />
            </div>
            <p className="text-[11px] text-[#78716C] dark:text-[#9BB5AF]">
              Checking date: <strong>{formattedDate}</strong>
            </p>
          </div>

          {/* Availability Result Banner */}
          {choli.status === 'AT_DRY_CLEANER' ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-500/40 text-amber-900 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="font-bold text-sm sm:text-base">
                  Currently at Dry Cleaner
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                This outfit is currently out for professional dry cleaning and sanitization. It cannot be booked until it returns to available showroom inventory.
              </p>
            </div>
          ) : isAvailable ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/40 text-emerald-900 dark:text-emerald-300 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="font-bold text-sm sm:text-base">
                  Available on {formattedDate}!
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
                This choli is 100% free and ready for reservation for your event. No overlapping bookings exist on this date.
              </p>
              <button
                onClick={handleBookNow}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Book this Choli for {formattedDate}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border-2 border-red-500/40 text-red-900 dark:text-red-300 space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span className="font-bold text-sm sm:text-base">
                  Unavailable on {formattedDate}
                </span>
              </div>
              <p className="text-xs text-red-800 dark:text-red-400 leading-relaxed">
                Already reserved for customer <strong>{conflictingBooking?.customer.name}</strong> from{' '}
                <strong>{conflictingBooking?.pickupDate}</strong> to{' '}
                <strong>{conflictingBooking?.returnExpectedDate}</strong> (Order {conflictingBooking?.bookingNumber}).
              </p>
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 pt-1">
                💡 Tip: Please pick an alternate date or choose another gorgeous choli from our collection.
              </p>
            </div>
          )}

          {/* Existing Reserved Schedule for this Outfit */}
          <div className="pt-2 border-t border-[#EADFC9]/60 dark:border-[#1A3E38] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] block">
              Current Reservation Schedule for {choli.sku}:
            </span>

            {futureBookings.length === 0 ? (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 italic">
                ✓ No active bookings for this outfit. It is available on all dates!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {futureBookings.map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/60 dark:border-[#1A3E38] text-[11px]"
                  >
                    <span className="font-semibold text-[#084C42] dark:text-[#DFBD76]">
                      {b.pickupDate} to {b.returnExpectedDate}
                    </span>
                    <span className="text-[#78716C] dark:text-[#9BB5AF]">
                      Reserved ({b.customer.name.split(' ')[0]})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
