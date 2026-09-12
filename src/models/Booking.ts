import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingDocument extends Document {
  bookingNumber: string;
  choliId: string;
  choliSku: string;
  choliName: string;
  choliImage: string;
  customer: {
    name: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    idProofNumber?: string;
  };
  pickupDate: string;
  eventDate: string;
  returnExpectedDate: string;
  actualReturnDate?: string;
  rentAmount: number;
  securityDeposit: number;
  discount: number;
  advanceAmount?: number;
  finalTotal: number;
  paymentStatus: string;
  paymentMode: string;
  depositRefundStatus: string;
  alterationNotes?: string;
  status: string;
  bookedBy: string;
  staffId?: string;
  staffCode?: string;
  createdAt: Date;
}

const BookingSchema: Schema = new Schema({
  bookingNumber: { type: String, required: true, unique: true },
  choliId: { type: String, required: true },
  choliSku: { type: String, required: true },
  choliName: { type: String, required: true },
  choliImage: { type: String, default: '' },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    address: { type: String },
    idProofNumber: { type: String }
  },
  pickupDate: { type: String, required: true },
  eventDate: { type: String, required: true },
  returnExpectedDate: { type: String, required: true },
  actualReturnDate: { type: String },
  rentAmount: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  advanceAmount: { type: Number, default: 0 },
  finalTotal: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'CLEARED', 'PARTIAL'], 
    default: 'PENDING' 
  },
  paymentMode: { 
    type: String, 
    enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'], 
    default: 'UPI' 
  },
  depositRefundStatus: { 
    type: String, 
    enum: ['HOLD', 'REFUNDED_FULL', 'DEDUCTED'], 
    default: 'HOLD' 
  },
  alterationNotes: { type: String },
  status: { 
    type: String, 
    enum: ['CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED'], 
    default: 'CONFIRMED' 
  },
  bookedBy: { type: String, default: 'Staff' },
  staffId: { type: String },
  staffCode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

if (mongoose.models && mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

export default mongoose.model<IBookingDocument>('Booking', BookingSchema);
