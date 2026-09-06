import { NextResponse } from 'next/server';
import { resetAndSeedDatabase } from '@/lib/seedDatabase';
import { dbConnect } from '@/lib/dbConnect';
import Choli from '@/models/Choli';
import Booking from '@/models/Booking';

export async function POST() {
  try {
    const inserted = await resetAndSeedDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database successfully cleared. Dummy data removed.',
      count: 0,
      data: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const count = await Choli.countDocuments();
    const cholis = await Choli.find({}).sort({ sku: 1 }).lean();
    const bookingCount = await Booking.countDocuments();
    return NextResponse.json({
      success: true,
      choliCount: count,
      bookingCount,
      cholis: cholis.map((c: any) => ({
        _id: c._id,
        sku: c.sku,
        name: c.name,
        rentalPricePerEvent: c.rentalPricePerEvent,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
