import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, employeeCode, password, role } = body;

    if (!name || !email || !employeeCode) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and employee code are required' },
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

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A user with this email is already registered' },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '',
      employeeCode: employeeCode.trim(),
      password: password || 'staff123',
      role: role || 'STAFF',
      joinedDate: new Date().toISOString().split('T')[0],
    });

    const userProfile = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '',
      role: newUser.role,
      employeeCode: newUser.employeeCode || '',
      joinedDate: newUser.joinedDate || '',
    };

    return NextResponse.json({ success: true, user: userProfile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during registration' },
      { status: 500 }
    );
  }
}
