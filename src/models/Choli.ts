import mongoose, { Schema, Document } from 'mongoose';

export interface ICholiDocument extends Document {
  sku: string;
  name: string;
  category: string;
  color: string;
  fabric: string;
  blouseSize: string;
  skirtLength: number;
  images: string[];
  totalCosting: number;
  rentalPricePerEvent: number;
  securityDeposit: number;
  dryCleaningFee: number;
  totalEarnedFromRent: number;
  isBreakEvenReached: boolean;
  status: string;
  description: string;
  instagramUrl?: string;
  bufferDaysBefore: number;
  bufferDaysAfter: number;
  createdAt: Date;
}

const CholiSchema: Schema = new Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Bridal', 'Sangeet', 'Navratri', 'Reception', 'Partywear'], 
    default: 'Bridal' 
  },
  color: { type: String, required: true },
  fabric: { type: String, default: 'Silk Velvet & Net' },
  blouseSize: { type: String, default: '36 (Alterable 34-38)' },
  skirtLength: { type: Number, default: 42 },
  images: [{ type: String }],
  totalCosting: { type: Number, required: true },
  rentalPricePerEvent: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  dryCleaningFee: { type: Number, default: 500 },
  totalEarnedFromRent: { type: Number, default: 0 },
  isBreakEvenReached: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'RENTED', 'IN_ALTERATION', 'AT_DRY_CLEANER', 'RETIRED'], 
    default: 'AVAILABLE' 
  },
  description: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  bufferDaysBefore: { type: Number, default: 1 },
  bufferDaysAfter: { type: Number, default: 2 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Choli || mongoose.model<ICholiDocument>('Choli', CholiSchema);
