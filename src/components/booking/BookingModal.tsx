'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeBookingModal, addBooking, createBookingApi } from '@/store/bookingSlice';
import { recordRentalEarnings } from '@/store/choliSlice';
import { openAuthModal } from '@/store/authSlice';
import { Booking, PaymentStatus, PaymentMode } from '@/types';
import { 
  X, 
  Sparkles, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  Scissors, 
  AlertTriangle, 
  CheckCircle2,
  Receipt,
  Layers,
  Plus,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

export function BookingModal() {
  const dispatch = useAppDispatch();
  const { isBookingModalOpen, selectedCholiForBooking, selectedCalendarDate } = useAppSelector(
    (state) => state.bookings
  );
  const cholis = useAppSelector((state) => state.cholis.items);
  const bookings = useAppSelector((state) => state.bookings.items);
  const { currentUser, registeredUsers } = useAppSelector((state) => state.auth);

  // Form State - supports multiple cholis in a single booking order
  const [selectedCholiIds, setSelectedCholiIds] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [idProof, setIdProof] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('CLEARED');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [alterationNotes, setAlterationNotes] = useState('');
  const [dateConflictWarning, setDateConflictWarning] = useState<string | null>(null);
  const [createdBookingForInvoice, setCreatedBookingForInvoice] = useState<Booking | null>(null);

  // Sync selected cholis when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      if (selectedCholiForBooking) {
        setSelectedCholiIds([selectedCholiForBooking]);
      } else if (selectedCholiIds.length === 0 && cholis.length > 0) {
        setSelectedCholiIds([cholis[0]._id]);
      }
    }
  }, [isBookingModalOpen, selectedCholiForBooking, cholis]);

  // Set dates: if selectedCalendarDate is passed from calendar, use it! Otherwise default to today + 3 days
  useEffect(() => {
    if (isBookingModalOpen) {
      if (selectedCalendarDate) {
        const ev = new Date(selectedCalendarDate);
        const pu = new Date(ev);
        pu.setDate(pu.getDate() - 1);
        const ret = new Date(ev);
        ret.setDate(ret.getDate() + 2);

        setPickupDate(pu.toISOString().split('T')[0]);
        setEventDate(selectedCalendarDate);
        setReturnDate(ret.toISOString().split('T')[0]);
      } else if (!pickupDate) {
        const today = new Date();
        const p = new Date(today);
        p.setDate(p.getDate() + 3);
        const e = new Date(p);
        e.setDate(e.getDate() + 1);
        const r = new Date(e);
        r.setDate(r.getDate() + 2);

        setPickupDate(p.toISOString().split('T')[0]);
        setEventDate(e.toISOString().split('T')[0]);
        setReturnDate(r.toISOString().split('T')[0]);
      }
    }
  }, [isBookingModalOpen, selectedCalendarDate, pickupDate]);

  const selectedCholis = cholis.filter((c) => selectedCholiIds.includes(c._id));

  // Check for date conflicts across ALL selected cholis
  useEffect(() => {
    if (selectedCholiIds.length === 0 || !pickupDate || !returnDate) {
      setDateConflictWarning(null);
      return;
    }

    const conflicts: string[] = [];

    selectedCholis.forEach((choli) => {
      const conflict = bookings.find((b) => {
        if (b.status === 'CANCELLED' || b.choliId !== choli._id) return false;
        return pickupDate <= b.returnExpectedDate && returnDate >= b.pickupDate;
      });

      if (conflict) {
        conflicts.push(
          `"${choli.name}" (${choli.sku}) is already reserved by ${conflict.customer.name} (${conflict.pickupDate} to ${conflict.returnExpectedDate})`
        );
      }
    });

    if (conflicts.length > 0) {
      setDateConflictWarning(
        `Date conflict! The following outfit(s) are already booked: ${conflicts.join('; ')}`
      );
    } else {
      setDateConflictWarning(null);
    }
  }, [selectedCholiIds, pickupDate, returnDate, bookings, selectedCholis]);

  if (!isBookingModalOpen && !createdBookingForInvoice) return null;

  if (createdBookingForInvoice) {
    return (
      <InvoiceModal
        booking={createdBookingForInvoice}
        isOpen={true}
        onClose={() => setCreatedBookingForInvoice(null)}
      />
    );
  }

  // Combined totals for all selected cholis
  const rentAmount = selectedCholis.reduce((acc, c) => acc + c.rentalPricePerEvent, 0);
  const securityDeposit = selectedCholis.reduce((acc, c) => acc + c.securityDeposit, 0);
  const finalTotal = Math.max(0, rentAmount + securityDeposit - Number(discount || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCholis.length === 0) {
      toast.error('Please select at least one outfit to book');
      return;
    }

    if (!customerName || !customerPhone) {
      toast.error('Customer name and phone number are required');
      return;
    }

    if (dateConflictWarning) {
      toast.error('Cannot book on conflicting dates! Please adjust the rental dates or selected outfits.');
      return;
    }

    const baseBookingNumber = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const discountPerCholi = Math.round(Number(discount || 0) / selectedCholis.length);
    const createdBookings: Booking[] = [];

    // Create a booking record for each selected choli
    selectedCholis.forEach((choli, idx) => {
      const bNumber = selectedCholis.length === 1 
        ? baseBookingNumber 
        : `${baseBookingNumber}-${idx + 1}`;

      const bTotal = Math.max(0, choli.rentalPricePerEvent + choli.securityDeposit - discountPerCholi);

      const newBooking: Booking = {
        _id: `bk-${Date.now()}-${idx}`,
        bookingNumber: bNumber,
        choliId: choli._id,
        choliSku: choli.sku,
        choliName: choli.name,
        choliImage: choli.images[0] || '',
        customer: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          idProofNumber: idProof,
        },
        pickupDate,
        eventDate,
        returnExpectedDate: returnDate,
        rentAmount: choli.rentalPricePerEvent,
        securityDeposit: choli.securityDeposit,
        discount: discountPerCholi,
        finalTotal: bTotal,
        paymentStatus,
        paymentMode,
        depositRefundStatus: 'HOLD',
        alterationNotes,
        status: 'CONFIRMED',
        bookedBy: currentUser 
          ? `${currentUser.name}${currentUser.employeeCode ? ` (${currentUser.employeeCode})` : ''}`
          : (registeredUsers.find(u => u.id === selectedStaffId)?.name || 'Floor Desk / Walk-in'),
        staffId: currentUser?.id || selectedStaffId || 'desk-01',
        staffCode: currentUser 
          ? (currentUser.employeeCode || (currentUser.role === 'ADMIN' ? 'OWNER-01' : 'STAFF'))
          : (registeredUsers.find(u => u.id === selectedStaffId)?.employeeCode || 'FLOOR'),
        createdAt: new Date().toISOString(),
      };

      dispatch(createBookingApi(newBooking));

      if (paymentStatus === 'CLEARED') {
        dispatch(recordRentalEarnings({ choliId: choli._id, amount: choli.rentalPricePerEvent }));
      }

      createdBookings.push(newBooking);
    });

    // Confetti animation
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DFBD76', '#084C42', '#0D6357']
      });
    } catch {
      // ignore
    }

    const firstBooking = createdBookings[0];
    toast.success(`Booking confirmed for ${customerName}!`, {
      description: `${selectedCholis.length} outfit(s) [${selectedCholis.map(c => c.sku).join(', ')}] scheduled from ${pickupDate} to ${returnDate}.`,
      action: {
        label: 'View Invoice',
        onClick: () => setCreatedBookingForInvoice(firstBooking)
      }
    });

    setCreatedBookingForInvoice(firstBooking);
    dispatch(closeBookingModal());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#DFBD76]/20 border border-[#DFBD76]/40 flex items-center justify-center text-[#DFBD76]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                Book Choli for Event
              </h2>
              <p className="text-[11px] text-[#E0E7E5]">
                Automatic schedule collision checking & live payment clearing
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(closeBookingModal())}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Staff Attendant Attribution Pill */}
        {currentUser ? (
          <div className="bg-[#FAF8F5] dark:bg-[#041A17] px-5 sm:px-6 py-2.5 border-b border-[#EADFC9] dark:border-[#1A3E38] flex items-center justify-between text-xs">
            <span className="text-[#78716C] dark:text-[#9BB5AF]">
              Order Handled By: <strong className="text-[#084C42] dark:text-[#DFBD76] font-bold">{currentUser.name}</strong> ({currentUser.employeeCode || currentUser.role})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold">
              {currentUser.role === 'ADMIN' ? '👑 Owner' : '👤 Staff Verified'}
            </span>
          </div>
        ) : (
          <div className="bg-[#FAF8F5] dark:bg-[#041A17] px-5 sm:px-6 py-2.5 border-b border-[#EADFC9] dark:border-[#1A3E38] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#78716C] dark:text-[#9BB5AF]">Attending Staff:</span>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="py-1 px-2.5 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] font-semibold text-xs focus:outline-none focus:border-[#C5A059]"
              >
                <option value="">Floor Desk / Walk-in</option>
                {registeredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.employeeCode || u.role})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => dispatch(openAuthModal())}
              className="text-[11px] text-[#084C42] dark:text-[#DFBD76] font-bold underline hover:opacity-80"
            >
              Sign In with Account
            </button>
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
          
          {/* Multi-Choli Outfit Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-xs text-[#1C1917] dark:text-[#F5F5F7] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#084C42] dark:text-[#DFBD76]" />
                <span>Select Outfits for this Event ({selectedCholiIds.length} Selected) *</span>
              </label>
              <span className="text-[11px] font-bold text-[#084C42] dark:text-[#DFBD76]">
                Subtotal Rent: ₹{(rentAmount ?? 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Selected Outfits Chip Row */}
            {selectedCholis.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38]">
                {selectedCholis.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#DFBD76]/50 shadow-sm text-xs font-semibold"
                  >
                    <img
                      src={c.images[0] || '/logo.jpg'}
                      alt={c.name}
                      className="w-6 h-7 rounded-md object-cover flex-shrink-0 border border-[#EADFC9]"
                    />
                    <span className="font-mono font-bold text-[#084C42] dark:text-[#DFBD76]">
                      {c.sku}
                    </span>
                    <span className="truncate max-w-[120px] text-[#1C1917] dark:text-[#FAF6EC]">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-bold text-[#15803D] dark:text-[#22C55E]">
                      ₹{(c.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}
                    </span>
                    {selectedCholis.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedCholiIds(selectedCholiIds.filter((id) => id !== c._id))}
                        className="p-0.5 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors ml-0.5"
                        title="Remove this choli"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Scrollable Outfit Checklist (Allows multiple choli selection for same day) */}
            <div className="max-h-48 overflow-y-auto rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] bg-[#FAF8F5]/60 dark:bg-[#041A17]/60 p-2 space-y-1.5 custom-scrollbar">
              <p className="text-[10px] uppercase tracking-wider text-[#78716C] dark:text-[#9BB5AF] px-1 font-bold">
                Check all outfits you want to reserve for this event date:
              </p>
              {cholis.map((c) => {
                const isSelected = selectedCholiIds.includes(c._id);
                return (
                  <label
                    key={c._id}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#084C42]/10 dark:bg-[#DFBD76]/15 border-[#084C42] dark:border-[#DFBD76] shadow-sm'
                        : 'bg-white dark:bg-[#041A17] border-[#EADFC9]/60 dark:border-[#1A3E38] hover:border-[#DFBD76]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCholiIds([...selectedCholiIds, c._id]);
                          } else {
                            if (selectedCholiIds.length > 1) {
                              setSelectedCholiIds(selectedCholiIds.filter((id) => id !== c._id));
                            } else {
                              toast.warning('At least one outfit must be selected for the booking.');
                            }
                          }
                        }}
                        className="w-4 h-4 rounded text-[#084C42] focus:ring-[#DFBD76] cursor-pointer"
                      />
                      <img
                        src={c.images[0] || '/logo.jpg'}
                        alt={c.name}
                        className="w-8 h-10 rounded-lg object-cover border border-[#EADFC9] dark:border-[#1A3E38] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6EC] truncate">
                          {c.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#78716C] dark:text-[#9CA3AF]">
                          <span className="font-mono font-bold text-[#084C42] dark:text-[#DFBD76]">{c.sku}</span>
                          <span>•</span>
                          <span>{c.category}</span>
                          <span>•</span>
                          <span>Size {c.blouseSize}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="font-bold text-xs text-[#084C42] dark:text-[#DFBD76]">
                        ₹{(c.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[9px] text-[#78716C]">
                        Dep: ₹{(c.securityDeposit ?? 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#084C42] dark:text-[#DFBD76]">
              <User className="w-3.5 h-3.5" />
              <span>Customer Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Customer Name *"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
              />

              <input
                type="tel"
                placeholder="WhatsApp Phone Number *"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
              />

              <input
                type="text"
                placeholder="Delivery / Residential Address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
              />

              <input
                type="text"
                placeholder="ID Proof (Aadhar / Driving License No)"
                value={idProof}
                onChange={(e) => setIdProof(e.target.value)}
                className="py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Rental Dates & Conflict Alert */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#084C42] dark:text-[#DFBD76]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Rental Schedule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] block mb-1">
                  Pickup / Trial Date *
                </label>
                <div className="p-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38]">
                  <DatePicker
                    value={pickupDate ? dayjs(pickupDate) : null}
                    onChange={(newValue: Dayjs | null) => {
                      setPickupDate(newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '');
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        variant: 'standard',
                        slotProps: { input: { disableUnderline: true } },
                        sx: {
                          width: '100%',
                          '& .MuiInputBase-input': { fontSize: '0.8125rem', py: 0.25, fontWeight: 700 }
                        }
                      },
                      popper: { sx: { zIndex: 9999 } }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] block mb-1">
                  Main Event Date *
                </label>
                <div className="p-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38]">
                  <DatePicker
                    value={eventDate ? dayjs(eventDate) : null}
                    onChange={(newValue: Dayjs | null) => {
                      setEventDate(newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '');
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        variant: 'standard',
                        slotProps: { input: { disableUnderline: true } },
                        sx: {
                          width: '100%',
                          '& .MuiInputBase-input': { fontSize: '0.8125rem', py: 0.25, fontWeight: 700 }
                        }
                      },
                      popper: { sx: { zIndex: 9999 } }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] block mb-1">
                  Return Due Date *
                </label>
                <div className="p-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38]">
                  <DatePicker
                    value={returnDate ? dayjs(returnDate) : null}
                    onChange={(newValue: Dayjs | null) => {
                      setReturnDate(newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '');
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        variant: 'standard',
                        slotProps: { input: { disableUnderline: true } },
                        sx: {
                          width: '100%',
                          '& .MuiInputBase-input': { fontSize: '0.8125rem', py: 0.25, fontWeight: 700 }
                        }
                      },
                      popper: { sx: { zIndex: 9999 } }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Date Conflict Warning Banner */}
            {dateConflictWarning ? (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{dateConflictWarning}</span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Dates are fully available! No double-booking conflict.</span>
              </div>
            )}
          </div>

          {/* Tailor / Alteration Notes */}
          <div className="space-y-1.5 pt-1">
            <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Tailor Alteration Notes (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Chest tighten to 35 inches, skirt length adjust by -1 inch, add cups"
              value={alterationNotes}
              onChange={(e) => setAlterationNotes(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Financial Calculation & Payment Status */}
          <div className="bg-[#FAF8F5] dark:bg-[#041A17] p-4 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] space-y-3">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#084C42] dark:text-[#DFBD76]">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing & Payment Settlement</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#78716C] dark:text-[#9BB5AF] block">Rental Fee ({selectedCholis.length} {selectedCholis.length === 1 ? 'Outfit' : 'Outfits'})</span>
                <span className="font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                  ₹{(rentAmount ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[#78716C] dark:text-[#9BB5AF] block">Deposit (100% Refundable)</span>
                <span className="font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                  ₹{(securityDeposit ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[#78716C] dark:text-[#9BB5AF] block">Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 py-1 px-2 rounded-lg bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] font-bold text-[#1C1917] dark:text-[#FAF6EC]"
                />
              </div>
              <div>
                <span className="text-[#78716C] dark:text-[#9BB5AF] block">Total Payable</span>
                <span className="font-serif text-base font-bold text-[#084C42] dark:text-[#DFBD76]">
                  ₹{(finalTotal ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EADFC9]/50 dark:border-[#1A3E38]/50">
              <div>
                <label className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] block mb-1">
                  Payment Status *
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] font-semibold"
                >
                  <option value="CLEARED">CLEARED (Rent offsets Choli cost immediately)</option>
                  <option value="PENDING">PENDING (Payment due on pickup)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] block mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
                >
                  <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash at Boutique</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => dispatch(closeBookingModal())}
              className="flex-1 py-3 px-4 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] text-[#78716C] dark:text-[#9BB5AF] hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28] font-semibold transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!!dateConflictWarning}
              className={`flex-2 py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                dateConflictWarning
                  ? 'bg-stone-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-[#084C42] to-[#0D6357] hover:opacity-95 shadow-[#084C42]/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm & Lock Booking</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
