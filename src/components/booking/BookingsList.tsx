'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  updateBookingPayment, 
  updateBookingStatus, 
  updateDepositRefund,
  updateBookingPaymentApi,
  updateBookingStatusApi,
  updateDepositRefundApi,
  deleteBookingApi
} from '@/store/bookingSlice';
import { recordRentalEarnings, reverseRentalEarnings, fetchCholis, updateCholiApi } from '@/store/choliSlice';
import { BookingStatus, DepositRefundStatus, Choli } from '@/types';
import { 
  ClipboardList, 
  Search, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  CreditCard,
  Receipt,
  Trash2,
  Shirt,
  Waves,
  Scissors
} from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { UpdateStatusModal } from '@/components/choli/UpdateStatusModal';
import { BookingsListSkeleton } from '@/components/common/BoutiqueLoader';
import { BoutiqueAutocomplete } from '@/components/common/BoutiqueAutocomplete';

export function BookingsList() {
  const dispatch = useAppDispatch();
  const { items: bookings, loading: bookingsLoading } = useAppSelector((state) => state.bookings);
  const { items: cholis } = useAppSelector((state) => state.cholis);
  const { currentUser } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<any>(null);
  const [statusCholi, setStatusCholi] = useState<Choli | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<{ bookingId: string; booking: any } | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<any>(null);

  // Filter bookings
  const filtered = bookings.filter((b) => {
    const matchesSearch = 
      b.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.phone.includes(search) ||
      b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.choliSku.toLowerCase().includes(search.toLowerCase()) ||
      b.choliName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesPayment = filterPayment === 'ALL' || b.paymentStatus === filterPayment;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleClearPayment = (b: any) => {
    const previousRentEarned = b.paymentStatus === 'PARTIAL'
      ? Math.min(b.rentAmount, b.advanceAmount || 0)
      : (b.paymentStatus === 'CLEARED' ? b.rentAmount : 0);
    const remainingRentToAdd = Math.max(0, b.rentAmount - previousRentEarned);

    dispatch(updateBookingPaymentApi({ 
      id: b._id, 
      paymentStatus: 'CLEARED',
      advanceAmount: b.finalTotal
    }));
    if (remainingRentToAdd > 0) {
      dispatch(recordRentalEarnings({ choliId: b.choliId, amount: remainingRentToAdd }));
    }
    toast.success('Payment marked as CLEARED in MongoDB!', {
      description: remainingRentToAdd > 0 
        ? `₹${remainingRentToAdd.toLocaleString('en-IN')} remaining rental fee was deducted from the outfit's capital costing.`
        : 'Order marked as fully paid and cleared.'
    });
  };

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    const target = bookings.find((b) => b._id === bookingId || b.bookingNumber === bookingId);
    if (status === 'CANCELLED') {
      if (target) {
        setBookingToCancel({ bookingId, booking: target });
        return;
      }
    }
    const returnDate = status === 'RETURNED' ? new Date().toISOString().split('T')[0] : undefined;
    dispatch(updateBookingStatusApi({ id: bookingId, status, returnDate }));
    toast.success(`Booking status updated to ${status} in MongoDB`);

    if (status === 'RETURNED' && target) {
      const targetCholi = cholis.find((c) => c._id === target.choliId || c.sku === target.choliSku);
      if (targetCholi) {
        toast.info(`Outfit returned! Update ${targetCholi.sku} status?`, {
          action: {
            label: 'Laundry / Alteration',
            onClick: () => setStatusCholi(targetCholi),
          },
        });
      }
    }
  };

  const handleDepositChange = (bookingId: string, status: DepositRefundStatus) => {
    dispatch(updateDepositRefundApi({ id: bookingId, status }));
    toast.info(`Deposit refund status set to ${status} in MongoDB`);
  };

  const handleWhatsApp = (phone: string, customerName: string, bookingNumber: string, sku: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Namaste ${customerName}, this is ShreeSakhi Boutique regarding your Choli booking ${bookingNumber} (${sku}). Please let us know if you need any assistance with fittings or pickup!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="bg-white dark:bg-[#072622] p-5 sm:p-6 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#084C42]/10 dark:bg-[#084C42]/30 flex items-center justify-center text-[#084C42] dark:text-[#DFBD76]">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
              Boutique Bookings Register
            </h2>
            <p className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
              {bookings.length} total orders recorded • Track pickup, returns, and deposit settlement
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C] dark:text-[#9BB5AF]" />
            <input
              type="text"
              placeholder="Search booking, phone, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-xs text-[#1C1917] dark:text-[#FAF6EC] focus:border-[#084C42] dark:focus:border-[#DFBD76] outline-none"
            />
          </div>

          {/* Status Filter Autocomplete */}
          <div className="w-full sm:w-44">
            <BoutiqueAutocomplete
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'CONFIRMED', label: 'Confirmed', badge: 'Active' },
                { value: 'PICKED_UP', label: 'Picked Up', badge: 'Out' },
                { value: 'RETURNED', label: 'Returned', badge: 'Done' },
                { value: 'CANCELLED', label: 'Cancelled', badge: 'Void' },
              ]}
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              placeholder="Filter Status..."
            />
          </div>
        </div>
      </div>

      {/* Bookings Table / Card List */}
      {bookingsLoading && bookings.length === 0 ? (
        <BookingsListSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#072622] rounded-2xl border border-dashed border-[#EADFC9] dark:border-[#1A3E38] text-[#78716C]">
          <p className="font-serif text-base text-[#1C1917] dark:text-[#FAF6EC]">No bookings match your search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b._id}
              className="bg-white dark:bg-[#072622] p-5 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Customer & Choli Details */}
              <div className="flex items-start gap-4">
                <img
                  src={b.choliImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000'}
                  alt={b.choliName}
                  className="w-16 h-20 rounded-xl object-cover border border-[#EADFC9] dark:border-[#1A3E38] flex-shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-[#1C1917] dark:text-[#FAF6EC]">
                      {b.customer.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#084C42]/10 text-[#084C42] dark:bg-[#084C42]/30 dark:text-[#DFBD76]">
                      {b.bookingNumber}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#DFBD76] flex items-center gap-1.5">
                    <span>{b.choliSku}</span>
                    <span>•</span>
                    <span className="text-[#1C1917] dark:text-[#FAF6EC] font-normal">{b.choliName}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C] dark:text-[#9CA3AF]">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#DFBD76]" />
                      {b.customer.phone}
                    </span>
                    <span>•</span>
                    <span>Rental: <strong>{b.pickupDate}</strong> to <strong>{b.returnExpectedDate}</strong></span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#DFBD76]/20 text-[#084C42] dark:text-[#DFBD76] font-semibold text-[10px]">
                      Staff: {b.bookedBy || 'Floor Staff'}
                    </span>
                  </div>

                  {b.alterationNotes && (
                    <p className="text-[11px] text-[#084C42] dark:text-[#DFBD76] italic bg-[#FAF8F5] dark:bg-[#041A17] px-2.5 py-1 rounded-md border border-[#EADFC9]/50 dark:border-[#1A3E38] w-fit">
                      Alterations: {b.alterationNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Financials & Status Controls */}
              <div className="flex flex-wrap items-center gap-4 lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-[#EADFC9]/60 dark:border-[#1A3E38]">
                
                {/* Rent & Deposit Figures (ADMIN ONLY: Financial Privacy) */}
                {currentUser?.role === 'ADMIN' ? (
                  <div className="text-right space-y-0.5">
                    <div className="font-serif text-lg font-bold text-[#084C42] dark:text-[#DFBD76]">
                      ₹{(b.rentAmount ?? 0).toLocaleString('en-IN')}
                      <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF] font-normal ml-1">(Rent)</span>
                    </div>
                    <div className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
                      Deposit: ₹{(b.securityDeposit ?? 0).toLocaleString('en-IN')} ({b.depositRefundStatus})
                    </div>
                    {b.paymentStatus === 'PARTIAL' && (
                      <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        Adv: ₹{(b.advanceAmount ?? 0).toLocaleString('en-IN')} • Due: ₹{Math.max(0, b.finalTotal - (b.advanceAmount ?? 0)).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] block">
                      Refundable Deposit
                    </span>
                    <span className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF6EC] block">
                      Status: {b.depositRefundStatus}
                    </span>
                    {b.paymentStatus === 'PARTIAL' && (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                        Due: ₹{Math.max(0, b.finalTotal - (b.advanceAmount ?? 0)).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                )}

                {/* Payment Status Pill / Action */}
                {currentUser?.role === 'ADMIN' ? (
                  <div>
                    {b.paymentStatus === 'CLEARED' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cleared
                      </span>
                    ) : b.paymentStatus === 'PARTIAL' ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          Adv Paid: ₹{(b.advanceAmount || 0).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => handleClearPayment(b)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all active:scale-95"
                          title="Click to clear remaining balance and credit remaining rent"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Clear Due (₹{Math.max(0, b.finalTotal - (b.advanceAmount || 0)).toLocaleString('en-IN')})</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClearPayment(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all active:scale-95"
                        title="Click to mark payment cleared and deduct from choli costing"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Clear (₹{b.finalTotal.toLocaleString('en-IN')})</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
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
                        ? `Adv ₹${(b.advanceAmount || 0).toLocaleString('en-IN')}`
                        : 'Payment Due'}
                    </span>
                  </div>
                )}

                {/* Order Status Autocomplete */}
                <div className="w-full sm:w-56">
                  <BoutiqueAutocomplete
                    value={b.status}
                    onChange={(val) => handleStatusChange(b._id, val as BookingStatus)}
                    options={[
                      { value: 'CONFIRMED', label: 'CONFIRMED (Scheduled)', badge: 'Confirmed' },
                      { value: 'PICKED_UP', label: 'PICKED UP (Customer)', badge: 'Active' },
                      { value: 'RETURNED', label: 'RETURNED (Boutique)', badge: 'Returned' },
                      { value: 'CANCELLED', label: 'CANCELLED', badge: 'Cancelled' },
                    ]}
                    placeholder="Order Status..."
                  />
                </div>

                {/* Deposit Refund Action Autocomplete */}
                {b.status === 'RETURNED' && (
                  <div className="w-full sm:w-48">
                    <BoutiqueAutocomplete
                      value={b.depositRefundStatus}
                      onChange={(val) => handleDepositChange(b._id, val as DepositRefundStatus)}
                      options={[
                        { value: 'HOLD', label: 'Deposit: HOLD', badge: 'Hold' },
                        { value: 'REFUNDED_FULL', label: 'Refunded Full (100%)', badge: 'Full Refund' },
                        { value: 'DEDUCTED', label: 'Deducted (Damage Fee)', badge: 'Deducted' },
                      ]}
                      placeholder="Deposit Action..."
                    />
                  </div>
                )}

                {/* Choli Status (Cleaning / Alteration / Available) */}
                <button
                  type="button"
                  onClick={() => {
                    const foundCholi = cholis.find((c) => c._id === b.choliId || c.sku === b.choliSku);
                    if (foundCholi) {
                      setStatusCholi(foundCholi);
                    } else {
                      toast.error(`Outfit ${b.choliSku} not found in inventory.`);
                    }
                  }}
                  className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-[#FAF8F5] dark:bg-[#041A17] border border-[#DFBD76]/60 hover:bg-[#DFBD76]/20 text-[#084C42] dark:text-[#DFBD76] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                  title="Update Choli Status (Laundry, Alteration, Available, etc.)"
                >
                  <Shirt className="w-3.5 h-3.5 text-[#DFBD76]" />
                  <span className="hidden sm:inline">Choli Status</span>
                </button>

                {/* WhatsApp Quick Message */}
                <button
                  onClick={() => handleWhatsApp(b.customer.phone, b.customer.name, b.bookingNumber, b.choliSku)}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-all"
                  title="WhatsApp Customer"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                {/* View / Print Tax Invoice */}
                <button
                  onClick={() => setSelectedInvoiceBooking(b)}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFBD76] text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all"
                  title="View and Print Official Tax Invoice"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>

                {/* Delete Booking Button */}
                <button
                  onClick={() => setBookingToDelete(b)}
                  className="py-1.5 px-2.5 rounded-xl border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                  title="Delete Booking (Amount will be calculated into choli recovery)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        booking={selectedInvoiceBooking}
        isOpen={!!selectedInvoiceBooking}
        onClose={() => setSelectedInvoiceBooking(null)}
      />

      {/* Staff / Admin Update Choli Status Modal */}
      <UpdateStatusModal
        choli={statusCholi}
        isOpen={Boolean(statusCholi)}
        onClose={() => setStatusCholi(null)}
      />

      {/* Custom Confirmation Popup for Cancelling Booking */}
      <ConfirmationModal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        onConfirm={async () => {
          if (bookingToCancel) {
            const rentAmount = Number(bookingToCancel.booking.rentAmount || 0);
            const previouslyCredited = bookingToCancel.booking.paymentStatus === 'PARTIAL'
              ? Math.min(rentAmount, Number(bookingToCancel.booking.advanceAmount || 0))
              : (bookingToCancel.booking.paymentStatus === 'CLEARED' ? rentAmount : 0);

            await dispatch(updateBookingStatusApi({ id: bookingToCancel.bookingId, status: 'CANCELLED' }));
            if (previouslyCredited > 0) {
              dispatch(reverseRentalEarnings({ choliId: bookingToCancel.booking.choliId, amount: previouslyCredited }));
            }
            dispatch(fetchCholis(currentUser?.role || 'ADMIN'));
            toast.success(`Booking ${bookingToCancel.booking.bookingNumber} marked as CANCELLED; ₹${previouslyCredited.toLocaleString('en-IN')} rent calculation reversed.`);
            setBookingToCancel(null);
          }
        }}
        title="Cancel Customer Booking & Reverse Rent?"
        description={`Are you sure you want to cancel booking order ${bookingToCancel?.booking.bookingNumber} for ${bookingToCancel?.booking.customer.name}? Any rent calculation from this order will be reversed and the reserved dates will be freed on the calendar.`}
        confirmText="Yes, Cancel Booking & Reverse Rent"
        cancelText="No, Keep Active"
        type="warning"
        itemPreview={bookingToCancel ? {
          title: bookingToCancel.booking.customer.name,
          badge: bookingToCancel.booking.bookingNumber,
          subtitle: bookingToCancel.booking.choliName,
          image: bookingToCancel.booking.choliImage,
          details: [
            { label: 'Event Date', value: bookingToCancel.booking.eventDate },
            { label: 'Total Payable', value: `₹${(bookingToCancel.booking.finalTotal ?? 0).toLocaleString('en-IN')}` },
            ...(bookingToCancel.booking.advanceAmount ? [{ label: 'Advance Paid', value: `₹${Number(bookingToCancel.booking.advanceAmount).toLocaleString('en-IN')}` }] : []),
          ]
        } : undefined}
      />

      {/* Custom Confirmation Popup for Deleting Booking & Reversing Rent */}
      <ConfirmationModal
        isOpen={Boolean(bookingToDelete)}
        onClose={() => setBookingToDelete(null)}
        onConfirm={async () => {
          if (bookingToDelete) {
            const rentAmount = Number(bookingToDelete.rentAmount || 0);
            const previouslyCredited = bookingToDelete.paymentStatus === 'PARTIAL'
              ? Math.min(rentAmount, Number(bookingToDelete.advanceAmount || 0))
              : (bookingToDelete.paymentStatus === 'CLEARED' ? rentAmount : 0);

            const rentToReverse = bookingToDelete.status === 'CANCELLED' ? 0 : previouslyCredited;

            await dispatch(deleteBookingApi(bookingToDelete._id));
            if (rentToReverse > 0) {
              dispatch(reverseRentalEarnings({ choliId: bookingToDelete.choliId, amount: rentToReverse }));
            }
            dispatch(fetchCholis(currentUser?.role || 'ADMIN'));
            toast.success(
              `Booking ${bookingToDelete.bookingNumber} deleted! Rent calculation of ₹${rentToReverse.toLocaleString('en-IN')} reversed from ${bookingToDelete.choliSku}.`
            );
            setBookingToDelete(null);
          }
        }}
        title="Delete Booking & Reverse Rent?"
        description={`Are you sure you want to delete booking ${bookingToDelete?.bookingNumber} for ${bookingToDelete?.customer?.name}? All rent calculation (₹${Number(bookingToDelete?.rentAmount || 0).toLocaleString('en-IN')}) will be reversed and deducted from the choli's total earned revenue.`}
        confirmText="Yes, Delete & Reverse Rent"
        cancelText="No, Keep Booking"
        type="danger"
        itemPreview={bookingToDelete ? {
          title: bookingToDelete.customer.name,
          badge: bookingToDelete.bookingNumber,
          subtitle: bookingToDelete.choliName,
          image: bookingToDelete.choliImage,
          details: [
            { label: 'Choli SKU', value: bookingToDelete.choliSku },
            { label: 'Event Date', value: bookingToDelete.eventDate },
            { label: 'Rent to Reverse', value: `₹${Number(bookingToDelete.rentAmount || 0).toLocaleString('en-IN')}` },
            { label: 'Payment Status', value: bookingToDelete.paymentStatus },
          ]
        } : undefined}
      />

    </div>
  );
}
