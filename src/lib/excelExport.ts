import * as XLSX from 'xlsx';
import { Booking, Choli } from '@/types';

export function exportBoutiqueDataToExcel(bookings: Booking[], cholis: Choli[], role?: string) {
  // 1. Prepare Bookings Data
  const bookingsData = bookings.map((b) => ({
    'Booking ID': b.bookingNumber,
    'Customer Name': b.customer.name,
    'Phone': b.customer.phone,
    'Choli SKU': b.choliSku,
    'Outfit Name': b.choliName,
    'Pickup Date': b.pickupDate,
    'Event Date': b.eventDate,
    'Return Due Date': b.returnExpectedDate,
    'Actual Return': b.actualReturnDate || 'Not Returned Yet',
    'Rent Fee (₹)': b.rentAmount,
    'Security Deposit (₹)': b.securityDeposit,
    'Payment Status': b.paymentStatus,
    'Payment Mode': b.paymentMode,
    'Deposit Status': b.depositRefundStatus,
    'Order Status': b.status,
    'Booked By': b.bookedBy,
  }));

  // 2. Prepare Cholis Inventory Data (Masking purchase cost if Staff)
  const cholisData = cholis.map((c) => {
    const remainingToRecover = Math.max(0, c.totalCosting - c.totalEarnedFromRent);
    const pureProfit = Math.max(0, c.totalEarnedFromRent - c.totalCosting);

    return {
      'SKU': c.sku,
      'Name': c.name,
      'Category': c.category,
      'Color': c.color,
      'Fabric': c.fabric,
      'Blouse Size': c.blouseSize,
      'Rental Price / Event (₹)': c.rentalPricePerEvent,
      'Security Deposit (₹)': c.securityDeposit,
      ...(role === 'ADMIN' ? {
        'Initial Purchase/Stitching Cost (₹)': c.totalCosting,
        'Total Rent Cleared (₹)': c.totalEarnedFromRent,
        'Remaining to Break-Even (₹)': remainingToRecover,
        'Pure Profit Earned (₹)': pureProfit,
        'Break-Even Reached': c.isBreakEvenReached ? 'YES' : 'NO',
      } : {}),
      'Status': c.status,
    };
  });

  // 3. Create Workbook and Sheets
  const wb = XLSX.utils.book_new();

  const wsBookings = XLSX.utils.json_to_sheet(bookingsData);
  XLSX.utils.book_append_sheet(wb, wsBookings, 'Bookings Register');

  const wsCholis = XLSX.utils.json_to_sheet(cholisData);
  XLSX.utils.book_append_sheet(wb, wsCholis, 'Cholis Inventory & ROI');

  // Auto-fit column widths
  [wsBookings, wsCholis].forEach((ws) => {
    const colWidths = [
      { wch: 15 },
      { wch: 22 },
      { wch: 16 },
      { wch: 14 },
      { wch: 32 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
    ];
    ws['!cols'] = colWidths;
  });

  // Save to file with timestamp
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `ShreeSakhi_Boutique_Report_${dateStr}.xlsx`);
}
