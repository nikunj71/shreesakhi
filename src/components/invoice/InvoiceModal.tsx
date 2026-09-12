'use client';

import React, { useRef, useEffect } from 'react';
import { Booking, Choli } from '@/types';
import { 
  Printer, 
  Download, 
  MessageCircle, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  CreditCard,
  Scissors
} from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceModalProps {
  booking: Booking | null;
  choli?: Choli;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ booking, choli, isOpen, onClose }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const invoiceNumber = `INV-${booking.bookingNumber.replace('BK-', '')}`;
  const invoiceDate = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = booking.customer.phone.replace(/[^0-9]/g, '');
    const advanceInfo = booking.advanceAmount && booking.advanceAmount > 0
      ? `*Advance Paid:* ₹${Number(booking.advanceAmount).toLocaleString('en-IN')}\n` +
        (booking.advanceAmount < booking.finalTotal
          ? `*Balance Due on Pickup:* ₹${Math.max(0, booking.finalTotal - Number(booking.advanceAmount)).toLocaleString('en-IN')}\n`
          : '')
      : '';

    const statusDisplay = booking.paymentStatus === 'CLEARED'
      ? 'PAID IN FULL'
      : booking.paymentStatus === 'PARTIAL'
      ? 'ADVANCE RECEIVED (Balance due on pickup)'
      : 'PAYMENT PENDING (Due on pickup)';

    const message = encodeURIComponent(
      `*ShreeSakhi Luxury Boutique - Rental Invoice & Booking Confirmation*\n\n` +
      `*Invoice No:* ${invoiceNumber}\n` +
      `*Customer:* ${booking.customer.name}\n` +
      `*Outfit:* ${booking.choliName} (${booking.choliSku})\n` +
      `*Rental Dates:* ${booking.pickupDate} to ${booking.returnExpectedDate}\n` +
      `*Rental Fee:* ₹${booking.rentAmount.toLocaleString('en-IN')}\n` +
      `*Security Deposit:* ₹${booking.securityDeposit.toLocaleString('en-IN')} (Refundable on Return)\n` +
      (booking.discount > 0 ? `*Discount:* -₹${booking.discount.toLocaleString('en-IN')}\n` : '') +
      `*Total Order:* ₹${booking.finalTotal.toLocaleString('en-IN')}\n` +
      advanceInfo +
      `*Payment Status:* ${statusDisplay}\n\n` +
      `Thank you for choosing ShreeSakhi for your special occasion! ✨`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static select-none sm:select-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#072622] rounded-2xl sm:rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[96vh] sm:max-h-[92vh] flex flex-col print:border-none print:shadow-none print:my-0 print:rounded-none print:w-full print:max-h-none print:overflow-visible print:block"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Modal Top Action Bar (Always visible while scrolling, hidden during print) */}
        <div className="sticky top-0 z-30 flex-shrink-0 bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] px-3.5 py-3 sm:px-5 sm:py-3.5 text-white flex items-center justify-between border-b border-white/10 shadow-md">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-2">
            <span className="font-serif font-bold text-sm sm:text-base text-[#DFBD76] truncate">
              Tax Invoice
            </span>
            <span className="text-[10px] sm:text-xs text-stone-300 font-mono font-semibold truncate">
              ({invoiceNumber})
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-[#DFBD76] hover:bg-[#C5A059] text-stone-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
              title="Send to Customer WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Close Button - High Contrast, Always Visible on Mobile */}
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 sm:p-2 rounded-xl sm:rounded-full bg-white/20 hover:bg-white/30 text-white transition-all flex items-center gap-1.5 active:scale-90 border border-white/25 shadow-sm"
              title="Close Invoice (Esc)"
              aria-label="Close Invoice"
            >
              <X className="w-4 h-4 text-white" />
              <span className="text-xs font-bold sm:hidden">Close</span>
            </button>
          </div>
        </div>

        {/* Printable Invoice Container (Scrollable on screen, full on print) */}
        <div ref={invoiceRef} className="flex-1 overflow-y-auto p-4 sm:p-10 text-[#1C1917] dark:text-[#FAF6EC] print:text-black print:p-8 print:overflow-visible print:h-auto space-y-6">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-[#EADFC9] dark:border-[#1A3E38] print:border-stone-300">
            <div>
              <div className="flex items-center gap-4">
                <div className="h-16 px-3 py-1.5 rounded-2xl bg-[#025151] border-2 border-[#DFBD76] flex items-center justify-center shadow-sm print:border-stone-800 print:shadow-none flex-shrink-0">
                  <img src="/logo-cropped.png" alt="श्री SAKHI BOUTIQUE" className="h-full w-auto object-contain" />
                </div>
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#084C42] dark:text-[#DFBD76] print:text-[#084C42]">
                    श्री SAKHI BOUTIQUE
                  </h1>
                </div>
              </div>
              <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] print:text-stone-600 mt-2 max-w-xs leading-relaxed">
                Plot 14, Designer Atelier Lane, Heritage Fashion Avenue, Mumbai - 400050<br/>
                Phone: +91 98200 12345 | GSTIN: 24AAACS1234F1Z8
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#084C42]/10 text-[#084C42] dark:bg-[#084C42]/30 dark:text-[#DFBD76] print:border print:border-[#084C42]">
                Rental Tax Invoice
              </span>
              <p className="font-mono text-sm font-bold pt-1 text-[#084C42] dark:text-[#DFBD76]">
                {invoiceNumber}
              </p>
              <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] print:text-stone-600">
                Date: {invoiceDate}
              </p>
              <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] print:text-stone-600">
                Ref Order: <span className="font-semibold">{booking.bookingNumber}</span>
              </p>
            </div>
          </div>

          {/* Customer & Schedule Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF8F5] dark:bg-[#041A17] print:bg-stone-50 p-4 sm:p-5 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] print:border-stone-300 text-xs">
            {/* Customer Information */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#084C42] dark:text-[#DFBD76] block">
                Billed To (Client Details)
              </span>
              <p className="font-bold text-sm text-[#1C1917] dark:text-[#F5F5F7] print:text-black">
                {booking.customer.name}
              </p>
              <p className="text-[#78716C] dark:text-[#9CA3AF] print:text-stone-700">
                Phone: <strong>{booking.customer.phone}</strong>
              </p>
              {booking.customer.address && (
                <p className="text-[#78716C] dark:text-[#9CA3AF] print:text-stone-700">
                  Address: {booking.customer.address}
                </p>
              )}
              {booking.customer.idProofNumber && (
                <p className="text-[#78716C] dark:text-[#9CA3AF] print:text-stone-700">
                  Verified ID Proof: {booking.customer.idProofNumber}
                </p>
              )}
            </div>

            {/* Rental Schedule */}
            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#084C42] dark:text-[#DFBD76] block">
                Rental Schedule & Return Policy
              </span>
              <p className="text-[#78716C] dark:text-[#9BB5AF] print:text-stone-700">
                Pickup Date: <strong className="text-[#1C1917] dark:text-[#FAF6EC] print:text-black">{booking.pickupDate}</strong>
              </p>
              <p className="text-[#78716C] dark:text-[#9BB5AF] print:text-stone-700">
                Event Date: <strong className="text-[#084C42] dark:text-[#DFBD76] print:text-[#084C42]">{booking.eventDate}</strong>
              </p>
              <p className="text-[#78716C] dark:text-[#9BB5AF] print:text-stone-700">
                Return Due Date: <strong className="text-[#1C1917] dark:text-[#FAF6EC] print:text-black">{booking.returnExpectedDate}</strong>
              </p>
              <p className="text-[11px] text-[#DFBD76] font-medium pt-1">
                Authorized By: {booking.bookedBy}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-[#EADFC9] dark:border-[#1A3E38] print:border-stone-400 text-[#78716C] dark:text-[#9BB5AF] uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-2.5 px-2">Choli Item & SKU</th>
                  <th className="py-2.5 px-2 text-center">Rental Duration</th>
                  <th className="py-2.5 px-2 text-right">Fee (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFC9]/60 dark:divide-[#1A3E38]/60 print:divide-stone-200">
                <tr>
                  <td className="py-3 px-2">
                    <p className="font-bold text-sm text-[#1C1917] dark:text-[#FAF6EC] print:text-black">
                      {booking.choliName}
                    </p>
                    <p className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] print:text-stone-600">
                      SKU: {booking.choliSku} • Premium Handcrafted Outfit
                    </p>
                    {booking.alterationNotes && (
                      <p className="text-[10px] text-[#084C42] dark:text-[#DFBD76] print:text-[#084C42] italic mt-0.5">
                        Fitting & Alteration Notes: {booking.alterationNotes}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {booking.pickupDate} to {booking.returnExpectedDate}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold">
                    ₹{booking.rentAmount.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-2">
                    <span className="font-semibold">Refundable Security Deposit</span>
                    <p className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] print:text-stone-500">
                      Refunded upon choli return inspection
                    </p>
                  </td>
                  <td className="py-2.5 px-2 text-center">Held on Deposit</td>
                  <td className="py-2.5 px-2 text-right font-semibold">
                    ₹{booking.securityDeposit.toLocaleString('en-IN')}
                  </td>
                </tr>

                {booking.discount > 0 && (
                  <tr>
                    <td className="py-2 px-2 text-emerald-700 dark:text-emerald-400 print:text-emerald-700 font-medium">
                      Special Boutique Discount
                    </td>
                    <td className="py-2 px-2 text-center text-emerald-700">-</td>
                    <td className="py-2 px-2 text-right text-emerald-700 font-semibold">
                      -₹{booking.discount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}

                {booking.advanceAmount && booking.advanceAmount > 0 && (
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20 print:bg-stone-50">
                    <td className="py-2.5 px-2">
                      <span className="font-semibold text-amber-900 dark:text-amber-300 print:text-black">
                        Advance Payment Received
                      </span>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 print:text-stone-500">
                        Token advance paid at booking
                      </p>
                    </td>
                    <td className="py-2.5 px-2 text-center text-amber-800 dark:text-amber-400">Paid</td>
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-700">
                      -₹{Number(booking.advanceAmount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Totals & Settlement Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t-2 border-[#EADFC9] dark:border-[#1A3E38] print:border-stone-400">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#78716C] dark:text-[#9BB5AF] print:text-stone-600">Payment Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    booking.paymentStatus === 'CLEARED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 print:border print:border-emerald-600'
                      : booking.paymentStatus === 'PARTIAL'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 print:border print:border-amber-600'
                      : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  {booking.paymentStatus === 'CLEARED'
                    ? 'PAID / CLEARED'
                    : booking.paymentStatus === 'PARTIAL'
                    ? 'PARTIALLY PAID (ADVANCE)'
                    : 'PAYMENT PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] print:text-stone-600">
                Payment Mode: <strong>{booking.paymentMode}</strong>
              </p>
              <p className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] print:text-stone-600">
                Security Deposit Status: <strong>{booking.depositRefundStatus}</strong>
              </p>
            </div>

            <div className="text-right space-y-1 w-full sm:w-auto">
              <span className="text-xs text-[#78716C] dark:text-[#9BB5AF] print:text-stone-600 block">
                Total Order Value
              </span>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#084C42] dark:text-[#DFBD76] print:text-[#084C42]">
                ₹{booking.finalTotal.toLocaleString('en-IN')}
              </p>

              {booking.advanceAmount && booking.advanceAmount > 0 && booking.paymentStatus === 'PARTIAL' && (
                <div className="pt-1 text-xs space-y-0.5">
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    Advance Paid: ₹{Number(booking.advanceAmount).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    Balance Due on Pickup: ₹{Math.max(0, booking.finalTotal - Number(booking.advanceAmount)).toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              <span className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] print:text-stone-500 block">
                (Inclusive of ₹{booking.securityDeposit.toLocaleString('en-IN')} refundable deposit)
              </span>
            </div>
          </div>

          {/* Rental Terms & Conditions */}
          <div className="pt-4 border-t border-[#EADFC9]/60 dark:border-[#1A3E38]/60 print:border-stone-300 text-[10px] text-[#78716C] dark:text-[#9BB5AF] print:text-stone-600 space-y-1">
            <p className="font-bold text-[#1C1917] dark:text-[#FAF6EC] print:text-black uppercase tracking-wider">
              Terms & Care Agreement:
            </p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Please return the outfit on or before <strong>{booking.returnExpectedDate}</strong> by 7:00 PM to avoid late fees of ₹500/day.</li>
              <li>Dry cleaning is professionally managed by ShreeSakhi Atelier. <strong>Do not hand-wash, dry clean, or iron at home.</strong></li>
              <li>The security deposit of ₹{booking.securityDeposit.toLocaleString('en-IN')} will be refunded immediately upon return inspection. In case of major fabric tears, permanent stains, or missing tassels/latkans, repair charges will be deducted.</li>
            </ul>
          </div>

          {/* Signature & Seal Footer */}
          <div className="pt-6 flex justify-between items-end text-xs print:pt-10">
            <div className="text-center">
              <div className="w-32 border-b border-stone-400 pb-1 mb-1"></div>
              <span className="text-[10px] text-[#78716C] print:text-stone-600">Client Signature</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-stone-400 pb-1 mb-1 font-serif font-bold text-[#084C42] print:text-[#084C42]">
                ShreeSakhi Atelier
              </div>
              <span className="text-[10px] text-[#78716C] print:text-stone-600">Authorized Signatory</span>
            </div>
          </div>

        </div>

        {/* Bottom Action Footer for Mobile & Desktop (Hidden during print) */}
        <div className="print:hidden p-3 sm:p-4 bg-[#FAF8F5] dark:bg-[#041A17] border-t border-[#EADFC9] dark:border-[#1A3E38] flex flex-col sm:flex-row items-center justify-between gap-2.5 flex-shrink-0">
          <div className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[10px] font-mono">ESC</kbd> or click outside to dismiss
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] hover:bg-stone-200 dark:hover:bg-[#0A2E28] text-stone-700 dark:text-stone-200 text-xs font-bold transition-all text-center active:scale-95"
            >
              Close Invoice
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[#084C42] hover:bg-[#0D5C51] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
