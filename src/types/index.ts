export type CholiCategory = 'Bridal' | 'Sangeet' | 'Navratri' | 'Reception' | 'Partywear';

export type CholiStatus = 'AVAILABLE' | 'RENTED' | 'IN_ALTERATION' | 'AT_DRY_CLEANER' | 'RETIRED';

export interface Choli {
  _id: string;
  sku: string;
  name: string;
  category: CholiCategory;
  color: string;
  fabric: string;
  blouseSize: string; // e.g. "36 (Alterable 34-38)"
  skirtLength: number; // inches
  images: string[]; // Multiple high-res photos: Front, Back, Flare, Dupatta, Close-up
  totalCosting: number; // Purchase/tailoring initial cost (ADMIN ONLY)
  rentalPricePerEvent: number;
  securityDeposit: number;
  dryCleaningFee: number;
  totalEarnedFromRent: number; // ADMIN ONLY
  isBreakEvenReached: boolean; // ADMIN ONLY
  status: CholiStatus;
  description: string;
  bufferDaysBefore: number;
  bufferDaysAfter: number;
  instagramUrl?: string;
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'CLEARED' | 'PARTIAL';
export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
export type DepositRefundStatus = 'HOLD' | 'REFUNDED_FULL' | 'DEDUCTED';
export type BookingStatus = 'CONFIRMED' | 'PICKED_UP' | 'RETURNED' | 'CANCELLED';

export interface CustomerInfo {
  name: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  idProofNumber?: string;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  choliId: string;
  choliSku: string;
  choliName: string;
  choliImage: string;
  customer: CustomerInfo;
  pickupDate: string; // YYYY-MM-DD
  eventDate: string;
  returnExpectedDate: string;
  actualReturnDate?: string;
  rentAmount: number;
  securityDeposit: number;
  discount: number;
  advanceAmount?: number; // Advance paid at booking time
  finalTotal: number;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  depositRefundStatus: DepositRefundStatus;
  alterationNotes?: string;
  status: BookingStatus;
  bookedBy: string; // Name of staff or admin
  staffId?: string; // ID of staff who created the booking
  staffCode?: string; // Employee code e.g. "EMP-101"
  createdAt: string;
}

export type UserRole = 'ADMIN' | 'STAFF' | 'GUEST';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  employeeCode?: string; // e.g. "EMP-101"
  password?: string;
  joinedDate?: string;
}
