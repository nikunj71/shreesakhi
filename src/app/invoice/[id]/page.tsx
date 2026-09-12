'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Booking } from '@/types';
import { APP_CONFIG } from '@/constants';
import { downloadInvoicePdf, shareInvoicePdf } from '@/lib/pdf';
import { sendWhatsAppInvoice } from '@/lib/whatsapp';
import { 
  Download, 
  Printer, 
  MessageCircle, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function PublicInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      if (!id) return;
      try {
        setLoading(true);
        // Try fetching from API
        const res = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setBooking(json.data);
        } else {
          // Fallback to localStorage bookings if offline or just created
          const local = localStorage.getItem('shreesakhi_bookings');
          if (local) {
            const list: Booking[] = JSON.parse(local);
            const found = list.find((b) => b._id === id || b.bookingNumber === id || b.bookingNumber === `BK-${id}`);
            if (found) {
              setBooking(found);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load booking for invoice:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [id]);

  const handleDownloadPdf = () => {
    if (!booking) return;
    try {
      setIsGeneratingPdf(true);
      downloadInvoicePdf(booking);
      toast.success(`Official PDF Invoice downloaded: ShreeSakhi-Invoice-${booking.bookingNumber}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please use the Print option.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!booking) return;
    await sendWhatsAppInvoice(booking);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#041A17] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#DFBD76] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-sm font-semibold text-[#084C42] dark:text-[#DFBD76]">
            Loading Shree Sakhi Official Tax Invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#041A17] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#072622] p-8 rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-[#DFBD76]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAF6EC]">
            Invoice Not Found
          </h1>
          <p className="text-xs text-[#78716C] dark:text-[#9BB5AF]">
            We could not find booking invoice record <strong className="text-[#084C42] dark:text-[#DFBD76]">{id}</strong>. Please verify the booking reference or contact our atelier concierge.
          </p>
          <button
            onClick={() => router.push('/')}
            className="py-2.5 px-5 rounded-2xl bg-[#084C42] hover:bg-[#0D5C51] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Boutique</span>
          </button>
        </div>
      </div>
    );
  }

  const invoiceNumber = `INV-${booking.bookingNumber.replace('BK-', '')}`;
  const invoiceDate = new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const totalRent = booking.rentAmount || 0;
  const totalDeposit = booking.securityDeposit || 0;
  const totalDiscount = booking.discount || 0;
  const grandTotal = booking.finalTotal || 0;
  const totalAdvance = booking.advanceAmount || 0;
  const balanceDue = Math.max(0, grandTotal - totalAdvance);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#041A17] py-6 sm:py-10 px-3 sm:px-6 select-none sm:select-auto print:bg-white print:p-0">
      
      {/* Top Controls Header (Hidden on Print) */}
      <div className="max-w-3xl mx-auto mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => router.push('/')}
          className="py-2 px-4 rounded-xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38] text-xs font-semibold text-[#1C1917] dark:text-[#FAF6EC] hover:bg-[#FAF8F5] dark:hover:bg-[#041A17] flex items-center gap-1.5 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Boutique Home</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Direct PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#DFBD76] to-[#C5A059] hover:opacity-95 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            title="Download Official PDF Invoice"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          {/* WhatsApp Direct Share */}
          <button
            onClick={handleWhatsApp}
            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="Send or Share on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Browser Print */}
          <button
            onClick={() => window.print()}
            className="py-2 px-3.5 rounded-xl bg-white dark:bg-[#072622] border border-[#EADFC9] dark:border-[#1A3E38] text-xs font-bold text-[#1C1917] dark:text-[#FAF6EC] hover:bg-[#FAF8F5] flex items-center gap-1.5 shadow-sm transition-all"
            title="Print Tax Invoice"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Main Printable Tax Invoice Card */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
        
        {/* Luxury Header Banner */}
        <div className="bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] p-6 sm:p-8 text-white relative overflow-hidden border-b-4 border-[#DFBD76]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-16 px-3 py-1 rounded-2xl bg-[#025151] border-2 border-[#DFBD76] flex items-center justify-center shadow-md flex-shrink-0">
                <img src="/logo-cropped.png" alt="श्री SAKHI BOUTIQUE" className="h-full w-auto object-contain" />
              </div>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#FAF6EC]">
                  श्री SAKHI BOUTIQUE
                </h1>
                <p className="text-xs text-stone-200 mt-1 max-w-sm">
                  Official Rental Tax Invoice & Fitting Agreement
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 sm:min-w-44">
              <span className="text-[10px] uppercase font-bold text-stone-300 block">
                Tax Invoice No.
              </span>
              <div className="font-mono font-bold text-base text-[#DFBD76]">
                {invoiceNumber}
              </div>
              <span className="text-[11px] text-stone-300 block mt-0.5">
                Date: {invoiceDate}
              </span>
              <span className="text-[10px] text-stone-400 block font-mono">
                Order: {booking.bookingNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6 sm:p-8 space-y-6 text-[#1C1917] dark:text-[#FAF6EC] print:text-black">
          
          {/* Customer Details & Boutique Atelier (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Card */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#084C42] dark:text-[#DFBD76] tracking-wider block">
                Billed To (Customer Details)
              </span>
              <div className="font-serif font-bold text-base text-[#1C1917] dark:text-[#FAF6EC]">
                {booking.customer.name}
              </div>
              <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#DFBD76]" />
                <span>{booking.customer.phone}</span>
              </p>
              {booking.customer.address && (
                <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] flex items-start gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#DFBD76] flex-shrink-0 mt-0.5" />
                  <span>{booking.customer.address}</span>
                </p>
              )}
              {booking.customer.idProofNumber && (
                <p className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] pt-1">
                  ID Proof: <strong className="text-[#1C1917] dark:text-[#FAF6EC]">{booking.customer.idProofNumber}</strong>
                </p>
              )}
            </div>

            {/* Boutique Atelier */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#084C42] dark:text-[#DFBD76] tracking-wider block">
                Boutique Studio & Atelier
              </span>
              <div className="font-serif font-bold text-base text-[#084C42] dark:text-[#DFBD76]">
                {APP_CONFIG.BRAND_NAME || 'Shree Sakhi Boutique'}
              </div>
              <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#DFBD76] flex-shrink-0 mt-0.5" />
                <span>{APP_CONFIG.LOCATION}</span>
              </p>
              <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#DFBD76]" />
                <span>{APP_CONFIG.PHONE}</span>
              </p>
              <p className="text-xs text-[#78716C] dark:text-[#9BB5AF] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#DFBD76]" />
                <span>{APP_CONFIG.EMAIL}</span>
              </p>
            </div>

          </div>

          {/* Rental Timeline Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#084C42]/5 dark:bg-[#DFBD76]/10 border border-[#DFBD76]/30">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#9BB5AF] block">
                Pickup Date
              </span>
              <span className="font-bold text-xs sm:text-sm text-[#084C42] dark:text-[#DFBD76]">
                {booking.pickupDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#9BB5AF] block">
                Event Date
              </span>
              <span className="font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#FAF6EC]">
                {booking.eventDate || 'As scheduled'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#9BB5AF] block">
                Expected Return
              </span>
              <span className="font-bold text-xs sm:text-sm text-[#084C42] dark:text-[#DFBD76]">
                {booking.returnExpectedDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-[#9BB5AF] block">
                Outfit Care
              </span>
              <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                Steam Sanitized
              </span>
            </div>
          </div>

          {/* Reserved Attire Table */}
          <div className="rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] overflow-hidden">
            <div className="bg-[#041A17] text-[#DFBD76] px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>Item / Outfit Details</span>
              <span>Rental Fee</span>
            </div>
            <div className="p-4 bg-white dark:bg-[#072622] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADFC9]/60 dark:border-[#1A3E38]">
              <div className="flex items-center gap-3">
                {booking.choliImage && (
                  <img
                    src={booking.choliImage}
                    alt={booking.choliName}
                    className="w-14 h-16 rounded-xl object-cover border border-[#EADFC9] dark:border-[#1A3E38] flex-shrink-0"
                  />
                )}
                <div>
                  <div className="font-bold text-sm text-[#1C1917] dark:text-[#FAF6EC]">
                    {booking.choliName}
                  </div>
                  <div className="text-xs font-mono text-[#DFBD76] font-semibold">
                    SKU: {booking.choliSku}
                  </div>
                  <div className="text-[11px] text-[#78716C] dark:text-[#9BB5AF]">
                    Security Deposit: ₹{totalDeposit.toLocaleString('en-IN')} (100% Refundable)
                  </div>
                </div>
              </div>

              <div className="text-right font-serif font-bold text-lg text-[#084C42] dark:text-[#DFBD76]">
                ₹{totalRent.toLocaleString('en-IN')}
              </div>
            </div>

            {booking.alterationNotes && (
              <div className="p-3 bg-[#FAF8F5] dark:bg-[#041A17] text-xs text-[#084C42] dark:text-[#DFBD76] italic border-t border-[#EADFC9]/60 dark:border-[#1A3E38]">
                * Custom Fitting Notes: {booking.alterationNotes}
              </div>
            )}
          </div>

          {/* Financial Summary & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Terms */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#084C42] dark:text-[#DFBD76] tracking-wider block">
                Rental Policy & Terms
              </span>
              <ul className="text-[11px] text-[#78716C] dark:text-[#9BB5AF] space-y-1.5 list-disc pl-3.5">
                <li>Original government ID proof required at the time of pickup.</li>
                <li>100% Security deposit returned immediately upon outfit check.</li>
                <li>Complimentary alteration and sanitized steaming provided.</li>
              </ul>
            </div>

            {/* Financial Totals Card */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] space-y-2">
              <div className="flex justify-between text-xs text-[#78716C] dark:text-[#9BB5AF]">
                <span>Rental Subtotal:</span>
                <span className="font-semibold text-[#1C1917] dark:text-[#FAF6EC]">₹{totalRent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-[#78716C] dark:text-[#9BB5AF]">
                <span>Refundable Deposit:</span>
                <span className="font-semibold text-[#1C1917] dark:text-[#FAF6EC]">₹{totalDeposit.toLocaleString('en-IN')}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                  <span>Privilege Discount:</span>
                  <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#EADFC9] dark:border-[#1A3E38] flex justify-between font-serif font-bold text-base text-[#084C42] dark:text-[#DFBD76]">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              {totalAdvance > 0 && (
                <div className="flex justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>Advance Paid:</span>
                  <span>₹{totalAdvance.toLocaleString('en-IN')}</span>
                </div>
              )}
              {balanceDue > 0 && (
                <div className="flex justify-between text-xs font-bold text-amber-700 dark:text-amber-400 pt-1">
                  <span>Balance Due on Pickup:</span>
                  <span>₹{balanceDue.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-full justify-center ${
                  booking.paymentStatus === 'CLEARED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : booking.paymentStatus === 'PARTIAL'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}>
                  {booking.paymentStatus === 'CLEARED'
                    ? 'Payment Status: PAID IN FULL'
                    : booking.paymentStatus === 'PARTIAL'
                    ? `Payment Status: ADVANCE ₹${totalAdvance.toLocaleString('en-IN')} RECEIVED`
                    : 'Payment Status: PAYMENT PENDING ON PICKUP'}
                </span>
              </div>
            </div>

          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#EADFC9]/60 dark:border-[#1A3E38] text-center">
            <div>
              <div className="h-10 border-b border-stone-300 dark:border-stone-700 mb-1" />
              <span className="text-[11px] text-[#78716C] dark:text-[#9BB5AF]">Customer Signature</span>
            </div>
            <div>
              <div className="h-10 border-b border-stone-300 dark:border-stone-700 mb-1" />
              <span className="text-[11px] text-[#78716C] dark:text-[#9BB5AF]">Atelier Concierge Signature</span>
            </div>
          </div>

        </div>

        {/* Invoice Footer */}
        <div className="p-4 bg-[#FAF8F5] dark:bg-[#041A17] border-t border-[#EADFC9] dark:border-[#1A3E38] text-center">
          <p className="text-[11px] font-bold text-[#084C42] dark:text-[#DFBD76]">
            Thank you for choosing Shree Sakhi Couture for your auspicious celebration! ✨
          </p>
          <p className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] mt-0.5">
            {APP_CONFIG.LOCATION} • Helpline: {APP_CONFIG.PHONE}
          </p>
        </div>

      </div>

    </div>
  );
}
