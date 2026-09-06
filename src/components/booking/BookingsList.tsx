'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  updateBookingPayment, 
  updateBookingStatus, 
  updateDepositRefund,
  updateBookingPaymentApi,
  updateBookingStatusApi,
  updateDepositRefundApi
} from '@/store/bookingSlice';
import { recordRentalEarnings } from '@/store/choliSlice';
import { BookingStatus, DepositRefundStatus } from '@/types';
import { 
  ClipboardList, 
  Search, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  CreditCard,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

export function BookingsList() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.bookings.items);
  const { currentUser } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<any | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<{ bookingId: string; booking: any } | null>(null);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.phone.includes(search) ||
      b.choliSku.toLowerCase().includes(search.toLowerCase()) ||
      b.choliName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleClearPayment = (bookingId: string, choliId: string, rentAmount: number) => {
    dispatch(updateBookingPaymentApi({ id: bookingId, paymentStatus: 'CLEARED' }));
    dispatch(recordRentalEarnings({ choliId, amount: rentAmount }));
    toast.success('Payment marked as CLEARED in MongoDB!', {
      description: `₹${(rentAmount ?? 0).toLocaleString('en-IN')} rental fee was deducted from the outfit's capital costing.`
    });
  };

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    if (status === 'CANCELLED') {
      const target = bookings.find((b) => b._id === bookingId);
      if (target) {
        setBookingToCancel({ bookingId, booking: target });
        return;
      }
    }
    const returnDate = status === 'RETURNED' ? new Date().toISOString().split('T')[0] : undefined;
    dispatch(updateBookingStatusApi({ id: bookingId, status, returnDate }));
    toast.success(`Booking status updated to ${status} in MongoDB`);
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
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] placeholder-[#78716C] dark:placeholder-[#9BB5AF] focus:outline-none focus:border-[#084C42]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 rounded-xl text-xs bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="RETURNED">Returned</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table / Card List */}
      {filtered.length === 0 ? (
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
                  <div className="text-right">
                    <div className="font-serif text-lg font-bold text-[#084C42] dark:text-[#DFBD76]">
                      ₹{(b.rentAmount ?? 0).toLocaleString('en-IN')}
                      <span className="text-[10px] text-[#78716C] dark:text-[#9CA3AF] font-normal ml-1">(Rent)</span>
                    </div>
                    <div className="text-xs text-[#78716C] dark:text-[#9CA3AF]">
                      Deposit: ₹{(b.securityDeposit ?? 0).toLocaleString('en-IN')} ({b.depositRefundStatus})
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] dark:text-[#9CA3AF] block">
                      Refundable Deposit
                    </span>
                    <span className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF6EC]">
                      Status: {b.depositRefundStatus}
                    </span>
                  </div>
                )}

                {/* Payment Status Pill / Action (Admin Only can Clear Payments) */}
                {currentUser?.role === 'ADMIN' && (
                  <div>
                    {b.paymentStatus === 'CLEARED' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cleared
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClearPayment(b._id, b.choliId, b.rentAmount)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all"
                        title="Click to mark payment cleared and deduct from choli costing"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Clear (₹{b.rentAmount})</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Order Status Select */}
                <select
                  value={b.status}
                  onChange={(e) => handleStatusChange(b._id, e.target.value as BookingStatus)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    b.status === 'RETURNED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                      : b.status === 'PICKED_UP'
                      ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800'
                      : 'bg-[#FAF8F5] text-[#1C1917] border-[#EADFC9] dark:bg-[#041A17] dark:text-[#FAF6EC] dark:border-[#1A3E38]'
                  }`}
                >
                  <option value="CONFIRMED">CONFIRMED (Scheduled)</option>
                  <option value="PICKED_UP">PICKED UP (With Customer)</option>
                  <option value="RETURNED">RETURNED (At Boutique)</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                {/* Deposit Refund Action */}
                {b.status === 'RETURNED' && (
                  <select
                    value={b.depositRefundStatus}
                    onChange={(e) => handleDepositChange(b._id, e.target.value as DepositRefundStatus)}
                    className="py-1 px-2 rounded-lg text-xs bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
                  >
                    <option value="HOLD">Deposit: HOLD</option>
                    <option value="REFUNDED_FULL">Refunded Full</option>
                    <option value="DEDUCTED">Deducted (Damage)</option>
                  </select>
                )}

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

      {/* Custom Confirmation Popup for Cancelling Booking */}
      <ConfirmationModal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        onConfirm={() => {
          if (bookingToCancel) {
            dispatch(updateBookingStatusApi({ id: bookingToCancel.bookingId, status: 'CANCELLED' }));
            toast.success(`Booking ${bookingToCancel.booking.bookingNumber} marked as CANCELLED in MongoDB.`);
            setBookingToCancel(null);
          }
        }}
        title="Cancel Customer Booking?"
        description={`Are you sure you want to cancel booking order ${bookingToCancel?.booking.bookingNumber} for ${bookingToCancel?.booking.customer.name}? The reserved dates for this choli will be freed up on the rental calendar.`}
        confirmText="Yes, Cancel Booking"
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
          ]
        } : undefined}
      />

    </div>
  );
}
