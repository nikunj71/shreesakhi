'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openBookingModal, setSelectedCalendarDate } from '@/store/bookingSlice';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Sparkles,
  ShieldAlert,
  Layers,
  Tag,
  RotateCcw
} from 'lucide-react';

interface BookingCalendarProps {
  initialCholiFilter?: string | null;
}

export function BookingCalendar({ initialCholiFilter = null }: BookingCalendarProps) {
  const dispatch = useAppDispatch();
  const cholis = useAppSelector((state) => state.cholis.items);
  const bookings = useAppSelector((state) => state.bookings.items);

  const [selectedCholiId, setSelectedCholiId] = useState<string>(initialCholiFilter || 'ALL');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayBookings, setSelectedDayBookings] = useState<any[] | null>(null);
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  const filteredBookings = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    if (selectedCholiId !== 'ALL' && b.choliId !== selectedCholiId) return false;
    return true;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Helper to check bookings on a given day
  const getBookingsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return bookings.filter((b) => {
      if (b.status === 'CANCELLED') return false;
      if (selectedCholiId !== 'ALL' && b.choliId !== selectedCholiId) return false;

      // Check if dayStr falls between pickupDate and returnExpectedDate
      return dayStr >= b.pickupDate && dayStr <= b.returnExpectedDate;
    });
  };

  const handleDayClick = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBookings = getBookingsForDay(day);
    setSelectedDayStr(dayStr);
    setSelectedDayBookings(dayBookings);
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Control Header */}
      <div className="bg-white dark:bg-[#072622] p-4 sm:p-6 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#084C42]/10 dark:bg-[#084C42]/30 flex items-center justify-center text-[#084C42] dark:text-[#DFBD76]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
              Real-time choli booking & buffer date schedule
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28] text-[#1C1917] dark:text-[#FAF6EC] transition-all shadow-sm"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28] text-[#1C1917] dark:text-[#FAF6EC] transition-all shadow-sm"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Choli SKU Filter Bar & Quick Stats */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Choli Filter Dropdown */}
          <div className="flex-1 sm:flex-initial relative min-w-[200px]">
            <select
              value={selectedCholiId}
              onChange={(e) => setSelectedCholiId(e.target.value)}
              className="w-full py-2 px-3 rounded-xl text-xs bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] font-semibold focus:outline-none focus:border-[#084C42] cursor-pointer"
            >
              <option value="ALL">🗓️ All Vault Outfits ({cholis.length})</option>
              {cholis.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.sku} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCholiId !== 'ALL' && (
            <button
              onClick={() => setSelectedCholiId('ALL')}
              className="p-2 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] text-xs font-semibold text-[#78716C] hover:text-[#084C42] dark:hover:text-[#DFBD76]"
              title="Reset SKU filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Stats Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-[#084C42]/10 dark:bg-[#DFBD76]/15 border border-[#DFBD76]/30 text-xs font-bold text-[#084C42] dark:text-[#DFBD76]">
            {filteredBookings.length} Active Bookings
          </div>
        </div>
      </div>

      {/* Main Calendar Grid & Detail Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (2 Cols on Desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#072622] p-4 sm:p-6 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm">
          
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[78px] sm:min-h-[88px] rounded-xl bg-transparent opacity-0 pointer-events-none" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayBookings = getBookingsForDay(day);
              const isBooked = dayBookings.length > 0;
              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDayStr === dayStr;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`relative min-h-[78px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#084C42] dark:border-[#DFBD76] ring-2 ring-[#084C42]/20 shadow-md bg-white dark:bg-[#072622]'
                      : isBooked
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 hover:border-[#DFBD76]'
                      : 'bg-[#FAF8F5]/50 dark:bg-[#041A17]/50 border-[#EADFC9]/50 dark:border-[#1A3E38]/50 hover:border-[#C5A059]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        isBooked
                          ? 'text-[#084C42] dark:text-[#DFBD76] font-bold'
                          : 'text-[#1C1917] dark:text-[#FAF6EC]'
                      }`}
                    >
                      {day}
                    </span>
                    {isBooked && (
                      <span className="flex items-center gap-1">
                        {dayBookings.length > 1 && (
                          <span className="text-[9px] font-bold px-1 rounded-full bg-[#DFBD76]/30 text-[#084C42] dark:text-[#DFBD76]">
                            {dayBookings.length}
                          </span>
                        )}
                        <span className="w-1.5 h-1.5 rounded-full bg-[#084C42] dark:bg-[#DFBD76]" />
                      </span>
                    )}
                  </div>

                  {/* Explicit list showing WHICH cholis are booked on this day */}
                  {isBooked && (
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div
                          key={b._id}
                          className="text-[9px] font-mono font-bold truncate px-1.5 py-0.5 rounded-md bg-[#084C42] text-[#FAF6EC] border border-[#DFBD76]/30 flex items-center gap-1 shadow-sm"
                          title={`${b.choliSku}: ${b.choliName} (Client: ${b.customer.name})`}
                        >
                          <span className="w-1 h-1 rounded-full bg-[#DFBD76] flex-shrink-0" />
                          <span className="truncate">{b.choliSku}</span>
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[8px] font-bold text-center px-1 py-0.5 rounded bg-[#DFBD76]/25 text-[#084C42] dark:text-[#DFBD76] font-mono">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-[#EADFC9]/60 dark:border-[#1A3E38] flex flex-wrap items-center gap-4 text-xs text-[#78716C] dark:text-[#9CA3AF]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38]" />
              <span>Available Date</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-200 dark:bg-amber-900 border border-amber-400" />
              <span>Reserved Date</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#084C42] text-white flex items-center justify-center text-[9px] font-bold">
                ✓
              </span>
              <span>Choli SKU Badges Shown on Day</span>
            </div>
          </div>

        </div>

        {/* Selected Day Details Panel */}
        <div className="bg-white dark:bg-[#072622] p-5 sm:p-6 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFC9]/60 dark:border-[#1A3E38]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFBD76]">
                  Schedule Details
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                  {selectedDayStr ? new Date(selectedDayStr).toDateString() : 'Select any calendar day'}
                </h3>
              </div>
            </div>

            {!selectedDayStr ? (
              <div className="text-center py-12 text-[#78716C] dark:text-[#9CA3AF] space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto opacity-40 text-[#DFBD76]" />
                <p className="text-xs">Tap on any date to inspect which cholis are booked or schedule a new event.</p>
              </div>
            ) : selectedDayBookings && selectedDayBookings.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#084C42] dark:text-[#DFBD76] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{selectedDayBookings.length} Outfit(s) Booked on this date:</span>
                </p>

                {selectedDayBookings.map((b) => {
                  const isMainEvent = b.eventDate === selectedDayStr;
                  return (
                    <div
                      key={b._id}
                      className="bg-[#FAF8F5] dark:bg-[#041A17] p-3.5 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] space-y-2.5 text-xs shadow-sm hover:border-[#DFBD76]/60 transition-all"
                    >
                      {/* Outfit Header with Photo & SKU */}
                      <div className="flex items-center gap-3">
                        <img
                          src={b.choliImage || '/logo.jpg'}
                          alt={b.choliName}
                          className="w-12 h-14 rounded-xl object-cover border border-[#EADFC9] dark:border-[#1A3E38] flex-shrink-0 shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[#084C42] text-[#FAF6EC]">
                              {b.choliSku}
                            </span>
                            <span className="font-mono text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
                              {b.bookingNumber}
                            </span>
                          </div>
                          <p className="font-serif font-bold text-xs text-[#1C1917] dark:text-[#FAF6EC] truncate mt-0.5">
                            {b.choliName}
                          </p>
                          {isMainEvent && (
                            <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#DFBD76]/20 text-[#084C42] dark:text-[#DFBD76] border border-[#DFBD76]/40">
                              ⭐ Main Event Date
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Client & Rental Specs */}
                      <div className="space-y-1 text-[#78716C] dark:text-[#9CA3AF] text-[11px] bg-white dark:bg-[#0A2E28] p-2.5 rounded-xl border border-[#EADFC9]/50 dark:border-[#1A3E38]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-[#DFBD76]" />
                            <span>Customer: <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{b.customer.name}</strong></span>
                          </div>
                          <a href={`tel:${b.customer.phone}`} className="flex items-center gap-1 text-[#084C42] dark:text-[#DFBD76] font-semibold hover:underline">
                            <Phone className="w-3 h-3" />
                            <span>{b.customer.phone}</span>
                          </a>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <Clock className="w-3 h-3 text-[#DFBD76]" />
                          <span>Rental Window: <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{b.pickupDate}</strong> to <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{b.returnExpectedDate}</strong></span>
                        </div>
                      </div>

                      {/* Pricing & Settlement */}
                      <div className="pt-1 flex items-center justify-between">
                        <div>
                          <span className="font-serif font-bold text-xs text-[#084C42] dark:text-[#DFBD76]">
                            ₹{(b.rentAmount ?? 0).toLocaleString('en-IN')} Rent
                          </span>
                          <span className="text-[10px] text-[#78716C] block">
                            Dep: ₹{(b.securityDeposit ?? 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.paymentStatus === 'CLEARED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : b.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                          }`}
                        >
                          {b.paymentStatus === 'CLEARED'
                            ? 'Cleared'
                            : b.paymentStatus === 'PARTIAL'
                            ? `Adv: ₹${(b.advanceAmount || 0).toLocaleString('en-IN')}`
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-center space-y-1.5">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-bold">100% Available Date</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  {selectedCholiId === 'ALL'
                    ? 'All boutique outfits are currently available on this day.'
                    : 'This specific choli is available for booking on this day.'}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (selectedDayStr) {
                dispatch(setSelectedCalendarDate(selectedDayStr));
              }
              dispatch(openBookingModal(selectedCholiId === 'ALL' ? null : selectedCholiId));
            }}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#084C42] to-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/40 hover:opacity-95 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#DFBD76]" />
            <span>
              {selectedDayBookings && selectedDayBookings.length > 0
                ? `Book Another Outfit for ${new Date(selectedDayStr || '').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
                : 'Create New Booking for this Date'}
            </span>
          </button>

        </div>

      </div>

    </div>
  );
}
