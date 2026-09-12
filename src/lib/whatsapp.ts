import { Booking } from '@/types';
import { APP_CONFIG } from '@/constants';
import { shareInvoicePdf, downloadInvoicePdf } from '@/lib/pdf';

/**
 * Normalizes Indian and international phone numbers for WhatsApp wa.me links.
 * Strips all non-digit characters and ensures country code (defaulting to 91 for India).
 */
export function formatIndianPhone(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');

  // 10 digits: standard Indian mobile (e.g. 7990529066 -> 917990529066)
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  // 11 digits starting with 0 (e.g. 07990529066 -> 917990529066)
  else if (clean.length === 11 && clean.startsWith('0')) {
    clean = `91${clean.substring(1)}`;
  }

  return clean;
}

/**
 * Generates an elegant, luxury WhatsApp invoice and booking confirmation message.
 * No external API service required — uses native WhatsApp web/app deep-linking.
 */
export function generateBookingInvoiceWhatsAppMessage(
  booking: Booking,
  options?: { multipleBookings?: Booking[] }
): string {
  const invoiceNumber = `INV-${booking.bookingNumber.replace('BK-', '')}`;
  const isMultiple = Boolean(options?.multipleBookings && options.multipleBookings.length > 1);

  const outfitLines = isMultiple
    ? options!.multipleBookings!
      .map(
        (b, i) =>
          `  ${i + 1}. *${b.choliName}* (${b.choliSku})\n     • Rental Fee: ₹${(b.rentAmount || 0).toLocaleString('en-IN')}\n     • Deposit: ₹${(b.securityDeposit || 0).toLocaleString('en-IN')}`
      )
      .join('\n')
    : `• *Outfit:* ${booking.choliName} (${booking.choliSku})`;

  const totalRent = isMultiple
    ? options!.multipleBookings!.reduce((sum, b) => sum + (b.rentAmount || 0), 0)
    : (booking.rentAmount || 0);

  const totalDeposit = isMultiple
    ? options!.multipleBookings!.reduce((sum, b) => sum + (b.securityDeposit || 0), 0)
    : (booking.securityDeposit || 0);

  const totalDiscount = isMultiple
    ? options!.multipleBookings!.reduce((sum, b) => sum + (b.discount || 0), 0)
    : (booking.discount || 0);

  const grandTotal = isMultiple
    ? options!.multipleBookings!.reduce((sum, b) => sum + (b.finalTotal || 0), 0)
    : (booking.finalTotal || 0);

  const totalAdvance = isMultiple
    ? options!.multipleBookings!.reduce((sum, b) => sum + (b.advanceAmount || 0), 0)
    : (booking.advanceAmount || 0);

  const balanceDue = Math.max(0, grandTotal - totalAdvance);

  const paymentStatusText =
    booking.paymentStatus === 'CLEARED'
      ? 'PAID IN FULL ✅'
      : booking.paymentStatus === 'PARTIAL'
        ? `ADVANCE RECEIVED 🟡 (Balance Due on Pickup: ₹${balanceDue.toLocaleString('en-IN')})`
        : 'PAYMENT PENDING ⏳ (Due on Pickup)';

  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
  const windowOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const siteOrigin = envUrl || windowOrigin;
  const shortBookingId = booking.bookingNumber.replace(/^BK-/i, '');
  const directDownloadUrl = siteOrigin ? `${siteOrigin}/d/${shortBookingId}` : '';

  let msg = `✨ *SHREE SAKHI LUXURY BOUTIQUE* ✨\n`;
  msg += `*Official Booking Confirmation & Rental Tax Invoice*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `👤 *Customer Name:* ${booking.customer.name}\n`;
  msg += `📞 *Customer Contact:* ${booking.customer.phone}\n`;
  if (booking.customer.address) {
    msg += `🏠 *Customer Address:* ${booking.customer.address}\n`;
  }
  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👗 *RESERVED DESIGNER ATTIRE*\n`;
  msg += `${outfitLines}\n\n`;
  msg += `📅 *RENTAL & EVENT TIMELINE*\n`;
  if (booking.eventDate) {
    msg += `• *Event Date:* ${booking.eventDate}\n`;
  }
  msg += `• *Pickup Date:* ${booking.pickupDate}\n`;
  msg += `• *Expected Return Date:* ${booking.returnExpectedDate}\n`;
  if (booking.alterationNotes) {
    msg += `• *Custom Fitting / Notes:* ${booking.alterationNotes}\n`;
  }
  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *FINANCIAL & DEPOSIT SUMMARY*\n`;
  msg += `• *Rental Fee:* ₹${totalRent.toLocaleString('en-IN')}\n`;
  msg += `• *Security Deposit:* ₹${totalDeposit.toLocaleString('en-IN')} (100% Refundable on Return)\n`;
  if (totalDiscount > 0) {
    msg += `• *Privilege Discount:* -₹${totalDiscount.toLocaleString('en-IN')}\n`;
  }
  msg += `• *Grand Total Payable:* ₹${grandTotal.toLocaleString('en-IN')}\n`;
  if (totalAdvance > 0) {
    msg += `• *Advance Received:* ₹${totalAdvance.toLocaleString('en-IN')}\n`;
  }
  if (balanceDue > 0) {
    msg += `• *Balance Due upon Pickup:* ₹${balanceDue.toLocaleString('en-IN')}\n`;
  }
  msg += `• *Payment Status:* ${paymentStatusText}\n`;
  msg += `• *Payment Mode:* ${booking.paymentMode || 'UPI / Cash'}\n`;
  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📌 *COLLECTION GUIDELINES:*\n`;
  msg += `1. Security deposit is credited back in full immediately upon safe return of the attire.\n`;
  msg += `2. Complimentary custom alteration & steam sanitization are completed prior to pickup.\n\n`;
  if (directDownloadUrl) {
    msg += `📥 *Click here to download PDF Invoice:*\n${directDownloadUrl}\n\n`;
  }
  msg += `📍 *Boutique Address:* ${APP_CONFIG.LOCATION}\n`;
  msg += `📞 *Concierge Helpline:* ${APP_CONFIG.PHONE}\n`;
  msg += `📸 *Follow Us:* ${APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE}\n\n`;
  msg += `Thank you for trusting Shree Sakhi for your celebratory celebration! ✨🙏`;

  return msg;
}

/**
 * Returns the direct WhatsApp link for sending the booking invoice to the customer.
 * Uses direct api.whatsapp.com to prevent wa.me redirect from stripping or mangling UTF-8 emojis.
 */
export function getWhatsAppInvoiceUrl(
  booking: Booking,
  options?: { multipleBookings?: Booking[] }
): string {
  const cleanPhone = formatIndianPhone(booking.customer.phone);
  const rawMessage = generateBookingInvoiceWhatsAppMessage(booking, options);
  const encoded = encodeURIComponent(rawMessage);
  return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encoded}`;
}

/**
 * Sends the invoice in PDF format:
 * 1. Automatically downloads the official luxury PDF invoice to the device.
 * 2. Directly opens WhatsApp with the full rich emoji tax invoice message prefilled
 *    (including outfit breakdown, timeline, terms, and online PDF download link).
 */
export async function sendWhatsAppInvoice(
  booking: Booking,
  options?: { multipleBookings?: Booking[] }
): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Download official PDF document to device for immediate access / attachment
  try {
    downloadInvoicePdf(booking, options);
  } catch (err) {
    console.error('Failed to auto-download PDF:', err);
  }

  // 2. Open WhatsApp with direct api.whatsapp.com preserving all emojis
  const url = getWhatsAppInvoiceUrl(booking, options);
  window.open(url, '_blank');
}
