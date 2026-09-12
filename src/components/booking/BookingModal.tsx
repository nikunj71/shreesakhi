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
  Check,
  Wallet,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';
import { BoutiqueAutocomplete } from '@/components/common/BoutiqueAutocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { sendWhatsAppInvoice } from '@/lib/whatsapp';

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
  const [customDeposit, setCustomDeposit] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('CLEARED');
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [alterationNotes, setAlterationNotes] = useState('');
  const [dateConflictWarning, setDateConflictWarning] = useState<string | null>(null);
  const [createdBookingForInvoice, setCreatedBookingForInvoice] = useState<Booking | null>(null);

  // Escape key handler to close popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(closeBookingModal());
      }
    };
    if (isBookingModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBookingModalOpen, dispatch]);

  // Combined totals for all selected cholis with customizable deposit support
  const selectedCholis = cholis.filter((c) => selectedCholiIds.includes(c._id));
  const dryCleaningCholis = selectedCholis.filter((c) => c.status === 'AT_DRY_CLEANER');
  const rentAmount = selectedCholis.reduce((acc, c) => acc + (c.rentalPricePerEvent || 0), 0);
  const defaultSecurityDeposit = selectedCholis.reduce((acc, c) => acc + (c.securityDeposit || 0), 0);
  const activeSecurityDeposit = customDeposit !== null ? customDeposit : defaultSecurityDeposit;
  const finalTotal = Math.max(0, rentAmount + activeSecurityDeposit - Number(discount || 0));

  // Sync selected cholis and reset custom deposit when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      setCustomDeposit(null);
      if (selectedCholiForBooking) {
        setSelectedCholiIds([selectedCholiForBooking]);
      } else if (selectedCholiIds.length === 0 && cholis.length > 0) {
        const firstAvailable = cholis.find((c) => c.status !== 'AT_DRY_CLEANER') || cholis[0];
        setSelectedCholiIds([firstAvailable._id]);
      }
    }
  }, [isBookingModalOpen, selectedCholiForBooking, cholis]);

  // Keep advanceAmount synchronized when paymentStatus is CLEARED or PENDING
  useEffect(() => {
    if (isBookingModalOpen) {
      if (paymentStatus === 'CLEARED') {
        setAdvanceAmount(finalTotal);
      } else if (paymentStatus === 'PENDING') {
        setAdvanceAmount(0);
      }
    }
  }, [isBookingModalOpen, paymentStatus, finalTotal]);

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

  const balanceDue = Math.max(0, finalTotal - Number(advanceAmount || 0));

  const handlePaymentStatusTabChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    if (status === 'CLEARED') {
      setAdvanceAmount(finalTotal);
    } else if (status === 'PENDING') {
      setAdvanceAmount(0);
    } else if (status === 'PARTIAL') {
      if (advanceAmount === 0 || advanceAmount >= finalTotal) {
        const half = Math.round(finalTotal * 0.5);
        setAdvanceAmount(half > 0 ? half : 500);
      }
    }
  };

  const handleAdvanceInputChange = (val: number) => {
    const clamped = Math.min(finalTotal, Math.max(0, val));
    setAdvanceAmount(clamped);
    if (clamped >= finalTotal && finalTotal > 0) {
      setPaymentStatus('CLEARED');
    } else if (clamped > 0) {
      setPaymentStatus('PARTIAL');
    } else {
      setPaymentStatus('PENDING');
    }
  };

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

    if (dryCleaningCholis.length > 0) {
      toast.error(
        `Cannot book outfit(s) currently in dry cleaning: ${dryCleaningCholis.map((c) => `${c.name} (${c.sku})`).join(', ')}. Please remove them before proceeding.`
      );
      return;
    }

    if (dateConflictWarning) {
      toast.error('Cannot book on conflicting dates! Please adjust the rental dates or selected outfits.');
      return;
    }

    const baseBookingNumber = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const discountPerCholi = Math.round(Number(discount || 0) / selectedCholis.length);
    const depositPerCholi = selectedCholis.length === 1 
      ? activeSecurityDeposit 
      : Math.round(activeSecurityDeposit / selectedCholis.length);

    const totalAdvance = Math.min(finalTotal, Math.max(0, Number(advanceAmount || 0)));
    const advancePerCholi = selectedCholis.length === 1
      ? totalAdvance
      : Math.round(totalAdvance / selectedCholis.length);

    const createdBookings: Booking[] = [];

    // Create a booking record for each selected choli
    selectedCholis.forEach((choli, idx) => {
      const bNumber = selectedCholis.length === 1 
        ? baseBookingNumber 
        : `${baseBookingNumber}-${idx + 1}`;

      const bTotal = Math.max(0, choli.rentalPricePerEvent + depositPerCholi - discountPerCholi);
      const thisAdvance = Math.min(bTotal, advancePerCholi);

      let thisPaymentStatus: PaymentStatus = 'PENDING';
      if (thisAdvance >= bTotal && bTotal > 0) {
        thisPaymentStatus = 'CLEARED';
      } else if (thisAdvance > 0) {
        thisPaymentStatus = 'PARTIAL';
      } else {
        thisPaymentStatus = paymentStatus === 'CLEARED' && totalAdvance === 0 ? 'CLEARED' : 'PENDING';
      }

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
        securityDeposit: depositPerCholi,
        discount: discountPerCholi,
        finalTotal: bTotal,
        advanceAmount: thisAdvance,
        paymentStatus: thisPaymentStatus,
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

      // Deduct rent earned immediately from choli costing
      const rentEarnedNow = thisPaymentStatus === 'CLEARED'
        ? choli.rentalPricePerEvent
        : Math.min(choli.rentalPricePerEvent, thisAdvance);

      if (rentEarnedNow > 0) {
        dispatch(recordRentalEarnings({ choliId: choli._id, amount: rentEarnedNow }));
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

    // Automatically send WhatsApp booking invoice to customer without requiring external services
    if (firstBooking) {
      try {
        sendWhatsAppInvoice(firstBooking, { multipleBookings: createdBookings });
      } catch (err) {
        console.error('Failed to trigger WhatsApp automatically:', err);
      }
    }

    const advanceMsg = totalAdvance > 0 && totalAdvance < finalTotal
      ? ` • Advance Received: ₹${totalAdvance.toLocaleString('en-IN')} (Balance Due on Pickup: ₹${(finalTotal - totalAdvance).toLocaleString('en-IN')})`
      : totalAdvance >= finalTotal
      ? ' • Fully Cleared'
      : ' • Payment Due on Pickup';

    toast.success(`Booking confirmed! WhatsApp invoice launched for ${customerName}.`, {
      description: `${selectedCholis.length} outfit(s) [${selectedCholis.map(c => c.sku).join(', ')}] scheduled from ${pickupDate} to ${returnDate}${advanceMsg}.`,
      action: {
        label: '📱 WhatsApp Invoice',
        onClick: () => {
          if (firstBooking) {
            sendWhatsAppInvoice(firstBooking, { multipleBookings: createdBookings });
          }
        }
      }
    });

    setCreatedBookingForInvoice(firstBooking);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setIdProof('');
    setDiscount(0);
    setCustomDeposit(null);
    setAdvanceAmount(0);
    setPaymentStatus('CLEARED');
    setAlterationNotes('');
    dispatch(closeBookingModal());
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={() => dispatch(closeBookingModal())}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#072622] rounded-2xl sm:rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Pinned Sticky Modal Header */}
        <div className="bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#DFBD76]/20 border border-[#DFBD76]/40 flex items-center justify-center text-[#DFBD76]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                Book Choli for Event
              </h2>
              <p className="text-[11px] text-[#E0E7E5]">
                Schedule collision checking, advance payment & live cost recovery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch(closeBookingModal())}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Staff Attendant Attribution Pill - flex-shrink-0 */}
        {currentUser ? (
          <div className="bg-[#FAF8F5] dark:bg-[#041A17] px-4 sm:px-6 py-2 border-b border-[#EADFC9] dark:border-[#1A3E38] flex items-center justify-between text-xs flex-shrink-0">
            <span className="text-[#78716C] dark:text-[#9BB5AF]">
              Order Handled By: <strong className="text-[#084C42] dark:text-[#DFBD76] font-bold">{currentUser.name}</strong> ({currentUser.employeeCode || currentUser.role})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold">
              {currentUser.role === 'ADMIN' ? '👑 Owner' : '👤 Staff Verified'}
            </span>
          </div>
        ) : (
          <div className="bg-[#FAF8F5] dark:bg-[#041A17] px-4 sm:px-6 py-2 border-b border-[#EADFC9] dark:border-[#1A3E38] flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <span className="text-[#78716C] dark:text-[#9BB5AF] whitespace-nowrap">Attending Staff:</span>
              <BoutiqueAutocomplete
                value={selectedStaffId}
                onChange={(val) => setSelectedStaffId(val)}
                options={[
                  { value: '', label: 'Floor Desk / Walk-in', sublabel: 'General Boutique Desk' },
                  ...registeredUsers.map((u) => ({
                    value: u.id,
                    label: u.name,
                    sublabel: u.employeeCode ? `Code: ${u.employeeCode}` : u.role,
                    badge: u.role === 'ADMIN' ? '👑 Owner' : '👤 Staff',
                  })),
                ]}
                placeholder="Select Staff..."
                size="small"
                className="w-56"
              />
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

        {/* Scrollable Modal Form Body */}
        <form id="booking-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm custom-scrollbar">
          
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

            {/* Dry Cleaning Warning Banner */}
            {dryCleaningCholis.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-amber-700 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Cannot Book — In Dry Cleaning:</strong>{' '}
                  {dryCleaningCholis.map((c) => `${c.name} (${c.sku})`).join(', ')} is currently at the dry cleaner and cannot be booked. Please remove it from your selection.
                </span>
              </div>
            )}

            {/* Autocomplete Outfit Quick-Search */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#78716C] dark:text-[#9BB5AF]">
                Quick Search / Add Outfit by Name or SKU:
              </span>
              <BoutiqueAutocomplete
                value=""
                onChange={(val) => {
                  if (val && !selectedCholiIds.includes(val)) {
                    const c = cholis.find((ch) => ch._id === val);
                    if (c?.status === 'AT_DRY_CLEANER') {
                      toast.error(`"${c.name}" (${c.sku}) is currently at the dry cleaner and cannot be booked.`);
                      return;
                    }
                    setSelectedCholiIds([...selectedCholiIds, val]);
                    toast.success(`Added "${c?.name || val}" to booking selection`);
                  }
                }}
                options={cholis.map((c) => ({
                  value: c._id,
                  label: `${c.sku} - ${c.name}`,
                  sublabel: `${c.category} • Rent: ₹${(c.rentalPricePerEvent ?? 0).toLocaleString('en-IN')}`,
                  badge: selectedCholiIds.includes(c._id) ? '✓ Added' : c.status === 'AT_DRY_CLEANER' ? 'Dry Cleaning' : c.status,
                  disabled: c.status === 'AT_DRY_CLEANER',
                }))}
                placeholder="Type SKU or outfit name to add to booking..."
              />
            </div>

            {/* Scrollable Outfit Checklist */}
            <div className="max-h-44 overflow-y-auto rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] bg-[#FAF8F5]/60 dark:bg-[#041A17]/60 p-2 space-y-1.5 custom-scrollbar">
              <p className="text-[10px] uppercase tracking-wider text-[#78716C] dark:text-[#9BB5AF] px-1 font-bold">
                Check all outfits you want to reserve for this event date:
              </p>
              {cholis.map((c) => {
                const isSelected = selectedCholiIds.includes(c._id);
                const isDryCleaning = c.status === 'AT_DRY_CLEANER';

                return (
                  <label
                    key={c._id}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isDryCleaning
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 opacity-80'
                        : isSelected
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
                            if (isDryCleaning) {
                              toast.error(`"${c.name}" (${c.sku}) is currently in dry cleaning and cannot be booked.`);
                              return;
                            }
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-xs text-[#1C1917] dark:text-[#FAF6EC] truncate">
                            {c.name}
                          </p>
                          {isDryCleaning && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                              🧺 In Dry Cleaning
                            </span>
                          )}
                        </div>
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

          {/* Billing & Advance Payment Settlement Card */}
          <div className="bg-[#FAF8F5] dark:bg-[#041A17] p-4 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#084C42] dark:text-[#DFBD76]">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Billing & Advance Settlement</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#084C42]/10 text-[#084C42] dark:bg-[#DFBD76]/20 dark:text-[#DFBD76]">
                Flexible Payment Options
              </span>
            </div>

            {/* Financial Overview 4-Column Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#78716C] dark:text-[#9BB5AF] block">
                  Rent ({selectedCholis.length} {selectedCholis.length === 1 ? 'Outfit' : 'Outfits'})
                </span>
                <span className="font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                  ₹{(rentAmount ?? 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="text-[#78716C] dark:text-[#9BB5AF] block mb-0.5">
                  Deposit (Refundable)
                </label>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-stone-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={activeSecurityDeposit}
                    onChange={(e) => setCustomDeposit(Math.max(0, Number(e.target.value)))}
                    className="w-20 py-1 px-2 rounded-lg bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] font-bold text-[#1C1917] dark:text-[#FAF6EC]"
                    title="Customize security deposit amount"
                  />
                </div>
                {customDeposit !== null && customDeposit !== defaultSecurityDeposit && (
                  <button
                    type="button"
                    onClick={() => setCustomDeposit(null)}
                    className="text-[9px] text-[#084C42] dark:text-[#DFBD76] underline block mt-0.5"
                  >
                    Reset (₹{defaultSecurityDeposit.toLocaleString('en-IN')})
                  </button>
                )}
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
                <span className="text-[#78716C] dark:text-[#9BB5AF] block">Total Order</span>
                <span className="font-serif text-base font-bold text-[#084C42] dark:text-[#DFBD76]">
                  ₹{(finalTotal ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Type Segmented Switcher */}
            <div className="space-y-1.5 pt-2 border-t border-[#EADFC9]/50 dark:border-[#1A3E38]/50">
              <label className="text-[11px] font-bold text-[#78716C] dark:text-[#9BB5AF] block">
                Select Payment Structure:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePaymentStatusTabChange('CLEARED')}
                  className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all border ${
                    paymentStatus === 'CLEARED'
                      ? 'bg-[#084C42] text-white border-[#084C42] shadow-sm'
                      : 'bg-white dark:bg-[#0A2E28] text-stone-700 dark:text-stone-300 border-[#EADFC9] dark:border-[#1A3E38] hover:bg-stone-50'
                  }`}
                >
                  Full Payment (₹{finalTotal.toLocaleString('en-IN')})
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentStatusTabChange('PARTIAL')}
                  className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all border flex items-center justify-center gap-1 ${
                    paymentStatus === 'PARTIAL'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-[#0A2E28] text-stone-700 dark:text-stone-300 border-[#EADFC9] dark:border-[#1A3E38] hover:bg-stone-50'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Advance / Token</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentStatusTabChange('PENDING')}
                  className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all border ${
                    paymentStatus === 'PENDING'
                      ? 'bg-stone-600 text-white border-stone-600 shadow-sm'
                      : 'bg-white dark:bg-[#0A2E28] text-stone-700 dark:text-stone-300 border-[#EADFC9] dark:border-[#1A3E38] hover:bg-stone-50'
                  }`}
                >
                  Pay on Pickup (₹0 Now)
                </button>
              </div>
            </div>

            {/* Advance Amount Custom Input & Quick Presets */}
            {paymentStatus === 'PARTIAL' && (
              <div className="space-y-2.5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Advance Amount Paid Today (₹) *</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-amber-700">₹</span>
                    <input
                      type="number"
                      min="1"
                      max={finalTotal}
                      value={advanceAmount || ''}
                      placeholder="e.g. 1000"
                      onChange={(e) => handleAdvanceInputChange(Number(e.target.value))}
                      className="w-28 py-1.5 px-3 rounded-lg bg-white dark:bg-[#0A2E28] border border-amber-300 dark:border-amber-700 font-bold text-sm text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Quick Advance Amount Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium mr-1">Quick Presets:</span>
                  {[500, 1000, 2000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={preset > finalTotal}
                      onClick={() => handleAdvanceInputChange(preset)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                        advanceAmount === preset
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white dark:bg-[#0A2E28] text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                      } ${preset > finalTotal ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                  {finalTotal > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceInputChange(Math.round(finalTotal * 0.5))}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                        advanceAmount === Math.round(finalTotal * 0.5)
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white dark:bg-[#0A2E28] text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                      }`}
                    >
                      50% (₹{Math.round(finalTotal * 0.5).toLocaleString('en-IN')})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Live Settlement Breakdown Pill */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#78716C] dark:text-[#9BB5AF]">Total Order Value:</span>
                <span className="font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                  ₹{(finalTotal ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#78716C] dark:text-[#9BB5AF]">Advance Received Today:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{(advanceAmount ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EADFC9]/60 dark:border-[#1A3E38]/60">
                <span className="font-bold text-[#1C1917] dark:text-[#FAF6EC]">
                  Remaining Balance Due on Pickup:
                </span>
                <span className="font-serif font-bold text-sm text-amber-600 dark:text-amber-400">
                  ₹{balanceDue.toLocaleString('en-IN')}
                </span>
              </div>

              {balanceDue > 0 && advanceAmount > 0 && (
                <p className="text-[10px] text-amber-700 dark:text-amber-300 italic pt-0.5">
                  ⭐ ₹{advanceAmount.toLocaleString('en-IN')} token advance recorded. The remaining balance of ₹{balanceDue.toLocaleString('en-IN')} will be collected during pickup/trial.
                </p>
              )}
            </div>

            {/* Payment Mode Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EADFC9]/50 dark:border-[#1A3E38]/50">
              <div>
                <label className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] block mb-1 font-semibold">
                  Payment Mode Used {advanceAmount > 0 ? '(for Advance/Payment)' : ''}
                </label>
                <BoutiqueAutocomplete
                  value={paymentMode}
                  onChange={(val) => setPaymentMode(val as PaymentMode)}
                  options={[
                    { value: 'UPI', label: 'UPI (GooglePay / PhonePe / Paytm)', sublabel: 'Instant digital settlement' },
                    { value: 'CASH', label: 'Cash at Boutique', sublabel: 'Physical currency counter' },
                    { value: 'CARD', label: 'Credit / Debit Card', sublabel: 'POS card terminal swipe' },
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer / NEFT', sublabel: 'Direct RTGS / NEFT transfer' },
                  ]}
                  placeholder="Select Payment Mode..."
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9]/70 dark:border-[#1A3E38] text-[10px] text-[#78716C] dark:text-[#9BB5AF]">
                  <span className="font-bold text-[#084C42] dark:text-[#DFBD76]">Auto Ledger Sync:</span> Advance payments up to rent amount are credited to choli capital recovery immediately.
                </div>
              </div>
            </div>
          </div>

        </form>

        {/* Pinned Sticky Footer with Action Buttons */}
        <div className="p-3 sm:p-4 bg-[#FAF8F5] dark:bg-[#041A17] border-t border-[#EADFC9] dark:border-[#1A3E38] flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => dispatch(closeBookingModal())}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] text-[#78716C] dark:text-[#9BB5AF] hover:bg-stone-200 dark:hover:bg-[#0A2E28] font-semibold text-xs sm:text-sm transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="booking-modal-form"
            disabled={!!dateConflictWarning || dryCleaningCholis.length > 0 || selectedCholis.length === 0}
            className={`flex-2 py-2.5 px-6 rounded-xl font-bold text-white text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
              dateConflictWarning || dryCleaningCholis.length > 0 || selectedCholis.length === 0
                ? 'bg-stone-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[#084C42] to-[#0D6357] hover:opacity-95 shadow-[#084C42]/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Confirm & Lock Booking</span>
          </button>
        </div>

      </div>
    </div>
  );
}

