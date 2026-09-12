import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import Choli from '@/models/Choli';

export async function GET() {
  try {
    const conn = await dbConnect();
    let bookings: any[] = [];

    if (conn) {
      bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const conn = await dbConnect();

    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    // Check for overlapping dates if outfit is not cancelled
    const existingOverlap = await Booking.findOne({
      $or: [
        { choliId: body.choliId },
        { choliSku: body.choliSku },
      ],
      status: { $ne: 'CANCELLED' },
      pickupDate: { $lte: body.returnExpectedDate },
      returnExpectedDate: { $gte: body.pickupDate },
    });

    if (existingOverlap) {
      return NextResponse.json(
        {
          success: false,
          error: `Outfit "${body.choliName}" is already reserved by ${existingOverlap.customer.name} (${existingOverlap.pickupDate} to ${existingOverlap.returnExpectedDate})`,
        },
        { status: 400 }
      );
    }

    // Clean client-provided _id if it's a temporary timestamp
    const { _id, ...bookingData } = body;
    const newBooking = await Booking.create(bookingData);

    // If payment is cleared or advance paid upon booking, update Choli totalEarnedFromRent
    const rentEarnedNow = body.paymentStatus === 'CLEARED'
      ? Number(body.rentAmount || 0)
      : Math.min(Number(body.rentAmount || 0), Number(body.advanceAmount || 0));

    if (rentEarnedNow > 0) {
      const isObjectId = body.choliId && body.choliId.match(/^[0-9a-fA-F]{24}$/);
      const choli = await Choli.findOne({
        $or: [
          ...(isObjectId ? [{ _id: body.choliId }] : []),
          { sku: body.choliSku },
        ],
      });

      if (choli) {
        choli.totalEarnedFromRent = (choli.totalEarnedFromRent || 0) + rentEarnedNow;
        choli.isBreakEvenReached = choli.totalEarnedFromRent >= (choli.totalCosting || 0);
        await choli.save();
      }
    }

    return NextResponse.json({ success: true, data: newBooking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });
    }

    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const existing = await Booking.findOne({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { bookingNumber: id },
      ],
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Check if payment changed from PENDING/PARTIAL to CLEARED
    const wasCleared = existing.paymentStatus === 'CLEARED';
    const previousRentEarned = existing.paymentStatus === 'PARTIAL' 
      ? Math.min(existing.rentAmount, existing.advanceAmount || 0) 
      : (existing.paymentStatus === 'CLEARED' ? existing.rentAmount : 0);
    const isNowCleared = updates.paymentStatus === 'CLEARED';

    Object.assign(existing, updates);
    const updatedBooking = await existing.save();

    if (!wasCleared && isNowCleared && updatedBooking.rentAmount > 0) {
      const remainingRentToAdd = Math.max(0, updatedBooking.rentAmount - previousRentEarned);
      if (remainingRentToAdd > 0) {
        const choliIsObjectId = updatedBooking.choliId && updatedBooking.choliId.match(/^[0-9a-fA-F]{24}$/);
        const choli = await Choli.findOne({
          $or: [
            ...(choliIsObjectId ? [{ _id: updatedBooking.choliId }] : []),
            { sku: updatedBooking.choliSku },
          ],
        });

        if (choli) {
          choli.totalEarnedFromRent = (choli.totalEarnedFromRent || 0) + remainingRentToAdd;
          choli.isBreakEvenReached = choli.totalEarnedFromRent >= (choli.totalCosting || 0);
          await choli.save();
        }
      }
    }

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });
  }

  try {
    const conn = await dbConnect();
    if (conn) {
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
      await Booking.findOneAndDelete({
        $or: [
          ...(isObjectId ? [{ _id: id }] : []),
          { bookingNumber: id },
        ],
      });
      return NextResponse.json({ success: true, message: `Booking ${id} deleted` });
    }

    return NextResponse.json({ success: true, message: 'Deleted locally' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
