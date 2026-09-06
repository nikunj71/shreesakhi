import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF';
  employeeCode?: string;
  joinedDate?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['ADMIN', 'STAFF'], default: 'STAFF' },
  employeeCode: { type: String, default: '' },
  joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
