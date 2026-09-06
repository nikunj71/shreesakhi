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

export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Ensure default admin exists if database has 0 users
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create(DEFAULT_ADMIN);
    }

    const users = await User.find({}).sort({ createdAt: 1 }).lean();

    const formattedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      employeeCode: u.employeeCode || '',
      joinedDate: u.joinedDate || '',
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
