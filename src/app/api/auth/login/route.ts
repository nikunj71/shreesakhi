import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';

const DEFAULT_ADMIN = {
  name: 'Boutique Owner (Admin)',
  email: 'admin@shreesakhi.com',
  password: 'admin',
  phone: '+91 98200 11223',
  role: 'ADMIN',
  employeeCode: 'OWNER-01',
  joinedDate: '2024-01-01',
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable' },
        { status: 503 }
      );
    }

    // Auto-seed initial admin if no users exist in MongoDB
    const totalUsers = await User.countDocuments();
    if (totalUsers === 0) {
      await User.create(DEFAULT_ADMIN);
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      employeeCode: user.employeeCode || '',
      joinedDate: user.joinedDate || '',
    };

    return NextResponse.json({ success: true, user: userProfile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during login' },
      { status: 500 }
    );
  }
}
