import { jsPDF } from 'jspdf';
import { Booking } from '@/types';
import { APP_CONFIG } from '@/constants';

interface PdfOptions {
  multipleBookings?: Booking[];
}

/**
 * Builds a luxury, high-resolution A4 tax invoice PDF for Shree Sakhi Boutique.
 */
export function buildInvoicePdf(booking: Booking, options?: PdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Palette definition
  const colorTeal = [8, 76, 66] as const; // #084C42
  const colorDark = [4, 26, 23] as const; // #041A17
  const colorGold = [223, 189, 118] as const; // #DFBD76
  const colorLightBg = [250, 248, 245] as const; // #FAF8F5
  const colorBorder = [234, 223, 201] as const; // #EADFC9
  const colorText = [28, 25, 23] as const; // #1C1917
  const colorMuted = [120, 113, 108] as const; // #78716C
  const colorEmerald = [21, 128, 61] as const;

  const invoiceNumber = `INV-${booking.bookingNumber.replace('BK-', '')}`;
  const invoiceDate = new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const bookingsList =
    options?.multipleBookings && options.multipleBookings.length > 0
      ? options.multipleBookings
      : [booking];

  const totalRent = bookingsList.reduce((sum, b) => sum + (b.rentAmount || 0), 0);
  const totalDeposit = bookingsList.reduce((sum, b) => sum + (b.securityDeposit || 0), 0);
  const totalDiscount = bookingsList.reduce((sum, b) => sum + (b.discount || 0), 0);
  const grandTotal = bookingsList.reduce((sum, b) => sum + (b.finalTotal || 0), 0);
  const totalAdvance = bookingsList.reduce((sum, b) => sum + (b.advanceAmount || 0), 0);
  const balanceDue = Math.max(0, grandTotal - totalAdvance);

  // ==========================================
  // 1. TOP LUXURY HEADER BANNER
  // ==========================================
  doc.setFillColor(...colorTeal);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Gold accent bar
  doc.setFillColor(...colorGold);
  doc.rect(0, 38, pageWidth, 2.5, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...colorGold);
  doc.text('SHREE SAKHI', margin, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('LUXURY DESIGNER ATELIER & COUTURE ON RENT', margin, 24);

  doc.setFontSize(7.5);
  doc.setTextColor(215, 235, 230);
  doc.text(`Official Tax Invoice & Rental Receipt • GST & Boutique Certified`, margin, 31);

  // Invoice Title & Meta Box (Right Side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('RENTAL TAX INVOICE', pageWidth - margin, 15, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...colorGold);
  doc.text(invoiceNumber, pageWidth - margin, 21, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(240, 240, 240);
  doc.text(`Date: ${invoiceDate}`, pageWidth - margin, 27, { align: 'right' });
  doc.text(`Order ID: ${booking.bookingNumber}`, pageWidth - margin, 32, { align: 'right' });

  let curY = 47;

  // ==========================================
  // 2. CUSTOMER INFO & BOUTIQUE INFO CARDS (2 COLS)
  // ==========================================
  const colWidth = (contentWidth - 6) / 2;

  // Left Card: Billed To
  doc.setFillColor(...colorLightBg);
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, curY, colWidth, 34, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorTeal);
  doc.text('BILLED TO (CUSTOMER DETAILS)', margin + 4, curY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colorText);
  doc.text(booking.customer.name, margin + 4, curY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colorMuted);
  doc.text(`Phone: ${booking.customer.phone}`, margin + 4, curY + 17);
  if (booking.customer.address) {
    const splitAddr = doc.splitTextToSize(`Address: ${booking.customer.address}`, colWidth - 8);
    doc.text(splitAddr, margin + 4, curY + 22);
  }
  if (booking.customer.idProofNumber) {
    doc.text(`ID Proof: ${booking.customer.idProofNumber}`, margin + 4, curY + 30);
  }

  // Right Card: Boutique Atelier
  const colRightX = margin + colWidth + 6;
  doc.setFillColor(...colorLightBg);
  doc.setDrawColor(...colorBorder);
  doc.roundedRect(colRightX, curY, colWidth, 34, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorTeal);
  doc.text('BOUTIQUE ATELIER & STUDIO', colRightX + 4, curY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colorText);
  doc.text(APP_CONFIG.BRAND_NAME || 'Shree Sakhi Couture', colRightX + 4, curY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorMuted);
  const locLines = doc.splitTextToSize(`Location: ${APP_CONFIG.LOCATION}`, colWidth - 8);
  doc.text(locLines, colRightX + 4, curY + 17);
  doc.text(`Helpline: ${APP_CONFIG.PHONE}`, colRightX + 4, curY + 26);
  doc.text(`Email: ${APP_CONFIG.EMAIL}`, colRightX + 4, curY + 30);

  curY += 39;

  // ==========================================
  // 3. RENTAL DATES & SCHEDULE BAR
  // ==========================================
  doc.setFillColor(...colorTeal);
  doc.roundedRect(margin, curY, contentWidth, 12, 2.5, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorGold);

  const colQuarter = contentWidth / 4;
  doc.text('PICKUP DATE', margin + 4, curY + 4.5);
  doc.text('EVENT DATE', margin + colQuarter + 4, curY + 4.5);
  doc.text('EXPECTED RETURN', margin + colQuarter * 2 + 4, curY + 4.5);
  doc.text('STATUS & CARE', margin + colQuarter * 3 + 4, curY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(booking.pickupDate || 'Scheduled', margin + 4, curY + 9.5);
  doc.text(booking.eventDate || 'Scheduled', margin + colQuarter + 4, curY + 9.5);
  doc.text(booking.returnExpectedDate || 'Scheduled', margin + colQuarter * 2 + 4, curY + 9.5);
  doc.text('Steam Sanitized', margin + colQuarter * 3 + 4, curY + 9.5);

  curY += 16;

  // ==========================================
  // 4. ITEMS TABLE (RESERVED DESIGNER ATTIRE)
  // ==========================================
  // Table Header
  doc.setFillColor(...colorDark);
  doc.rect(margin, curY, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorGold);
  doc.text('#', margin + 3, curY + 5);
  doc.text('ITEM & CRAFTSMANSHIP DESCRIPTION', margin + 12, curY + 5);
  doc.text('SKU CODE', margin + 95, curY + 5);
  doc.text('SECURITY DEPOSIT', margin + 125, curY + 5);
  doc.text('RENTAL FEE', pageWidth - margin - 3, curY + 5, { align: 'right' });

  curY += 7;

  // Table Rows
  bookingsList.forEach((b, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 250, isEven ? 255 : 248, isEven ? 255 : 245);
    doc.setDrawColor(...colorBorder);
    doc.setLineWidth(0.2);
    doc.rect(margin, curY, contentWidth, 9, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colorText);
    doc.text(String(idx + 1), margin + 3, curY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text(b.choliName || 'Designer Bridal Choli', margin + 12, curY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorMuted);
    doc.text(b.choliSku || 'SS-001', margin + 95, curY + 6);
    doc.text(`₹${(b.securityDeposit || 0).toLocaleString('en-IN')}`, margin + 125, curY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorTeal);
    doc.text(`₹${(b.rentAmount || 0).toLocaleString('en-IN')}`, pageWidth - margin - 3, curY + 6, {
      align: 'right',
    });

    curY += 9;
  });

  if (booking.alterationNotes) {
    doc.setFillColor(254, 252, 245);
    doc.setDrawColor(...colorBorder);
    doc.rect(margin, curY, contentWidth, 7, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorTeal);
    doc.text(`* Alteration / Fitting Notes: ${booking.alterationNotes}`, margin + 3, curY + 4.8);
    curY += 7;
  }

  curY += 5;

  // ==========================================
  // 5. FINANCIAL SUMMARY & PAYMENT STATUS (2 COLS)
  // ==========================================
  const finWidth = 85;
  const finX = pageWidth - margin - finWidth;

  // Left Note box
  const noteWidth = contentWidth - finWidth - 6;
  doc.setFillColor(...colorLightBg);
  doc.setDrawColor(...colorBorder);
  doc.roundedRect(margin, curY, noteWidth, 44, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorTeal);
  doc.text('RENTAL POLICY & RETURN TERMS', margin + 4, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colorMuted);
  const termsText = [
    '• 100% Refundable Security Deposit will be credited back immediately upon garment return.',
    '• Please present an original ID proof during physical collection at the atelier.',
    '• Handover includes protective travel garment bag and care instructions.',
    '• Custom alterations and steam sanitization are performed complimentary prior to pickup.',
  ];
  let termY = curY + 12;
  termsText.forEach((t) => {
    const splitT = doc.splitTextToSize(t, noteWidth - 8);
    doc.text(splitT, margin + 4, termY);
    termY += splitT.length * 3.8 + 1.2;
  });

  // Right Summary Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...colorBorder);
  doc.roundedRect(finX, curY, finWidth, 44, 2.5, 2.5, 'FD');

  let sY = curY + 6;
  const addSummaryRow = (label: string, val: string, isBold = false, isAccent = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(isAccent ? colorTeal[0] : colorText[0], isAccent ? colorTeal[1] : colorText[1], isAccent ? colorTeal[2] : colorText[2]);
    doc.text(label, finX + 4, sY);
    doc.text(val, finX + finWidth - 4, sY, { align: 'right' });
    sY += 5;
  };

  addSummaryRow('Rental Fee Subtotal:', `₹${totalRent.toLocaleString('en-IN')}`);
  addSummaryRow('Security Deposit (Refundable):', `₹${totalDeposit.toLocaleString('en-IN')}`);
  if (totalDiscount > 0) {
    addSummaryRow('Privilege Discount:', `-₹${totalDiscount.toLocaleString('en-IN')}`);
  }

  // Separator line
  doc.setDrawColor(...colorBorder);
  doc.line(finX + 4, sY - 1, finX + finWidth - 4, sY - 1);
  sY += 1.5;

  addSummaryRow('Grand Total Order Value:', `₹${grandTotal.toLocaleString('en-IN')}`, true, true);
  if (totalAdvance > 0) {
    addSummaryRow('Advance Amount Paid:', `₹${totalAdvance.toLocaleString('en-IN')}`, true);
  }
  if (balanceDue > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9); // Amber
    doc.text('Balance Due on Pickup:', finX + 4, sY);
    doc.text(`₹${balanceDue.toLocaleString('en-IN')}`, finX + finWidth - 4, sY, { align: 'right' });
    sY += 5;
  }

  // Payment Status Pill inside summary
  const isPaid = booking.paymentStatus === 'CLEARED';
  const isPartial = booking.paymentStatus === 'PARTIAL';
  doc.setFillColor(
    isPaid ? 220 : isPartial ? 254 : 243,
    isPaid ? 252 : isPartial ? 243 : 244,
    isPaid ? 231 : isPartial ? 199 : 246
  );
  doc.roundedRect(finX + 4, sY, finWidth - 8, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(isPaid ? 21 : isPartial ? 180 : 100, isPaid ? 128 : isPartial ? 83 : 116, isPaid ? 61 : isPartial ? 9 : 139);
  const statusLabel = isPaid
    ? 'PAID IN FULL • CLEARED'
    : isPartial
    ? `PARTIAL • ₹${totalAdvance.toLocaleString('en-IN')} ADVANCE RECEIVED`
    : 'PAYMENT PENDING ON PICKUP';
  doc.text(statusLabel, finX + finWidth / 2, sY + 4.2, { align: 'center' });

  curY += 51;

  // ==========================================
  // 6. SIGNATURE & STAMP ROW
  // ==========================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorMuted);

  doc.line(margin + 5, curY + 10, margin + 55, curY + 10);
  doc.text('Customer Signature & Acceptance', margin + 7, curY + 14);

  doc.line(pageWidth - margin - 55, curY + 10, pageWidth - margin - 5, curY + 10);
  doc.text('Authorized Atelier Signature', pageWidth - margin - 52, curY + 14);

  // ==========================================
  // 7. FOOTER ACCENT BAR
  // ==========================================
  const footerY = 282;
  doc.setDrawColor(...colorGold);
  doc.setLineWidth(0.8);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorTeal);
  doc.text('THANK YOU FOR CHOOSING SHREE SAKHI COUTURE ✨', pageWidth / 2, footerY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colorMuted);
  doc.text(
    `Boutique Atelier: ${APP_CONFIG.LOCATION} • Helpline: ${APP_CONFIG.PHONE} • IG: ${APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE}`,
    pageWidth / 2,
    footerY + 4,
    { align: 'center' }
  );

  return doc;
}

/**
 * Downloads the generated PDF directly to the device.
 */
export function downloadInvoicePdf(booking: Booking, options?: PdfOptions): void {
  const doc = buildInvoicePdf(booking, options);
  const fileName = `ShreeSakhi-Invoice-${booking.bookingNumber}.pdf`;
  doc.save(fileName);
}

/**
 * Returns a Blob containing the generated PDF.
 */
export function getInvoicePdfBlob(booking: Booking, options?: PdfOptions): Blob {
  const doc = buildInvoicePdf(booking, options);
  return doc.output('blob');
}

/**
 * Returns a native File object containing the generated PDF invoice.
 */
export function getInvoicePdfFile(booking: Booking, options?: PdfOptions): File {
  const blob = getInvoicePdfBlob(booking, options);
  const fileName = `ShreeSakhi-Invoice-${booking.bookingNumber}.pdf`;
  return new File([blob], fileName, { type: 'application/pdf' });
}

/**
 * Shares the PDF invoice via the Web Share API if supported by the browser/device.
 * On mobile devices (Android / iOS) and macOS, this opens the native share sheet
 * where WhatsApp is available as a direct target to attach the PDF!
 */
export async function shareInvoicePdf(booking: Booking, options?: PdfOptions): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const blob = getInvoicePdfBlob(booking, options);
    const fileName = `ShreeSakhi-Invoice-${booking.bookingNumber}.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `✨ Shree Sakhi Invoice ${booking.bookingNumber}`,
        text: `✨ Official Tax Invoice & Rental Confirmation for ${booking.customer.name} (Order: ${booking.bookingNumber}) • Shree Sakhi Couture ✨`,
      });
      return true;
    }
  } catch (err: unknown) {
    // AbortError indicates user cancelled share sheet, not a failure
    if ((err as Error)?.name !== 'AbortError') {
      console.warn('Web Share API failed or unsupported, falling back to download:', err);
    }
  }

  return false;
}
