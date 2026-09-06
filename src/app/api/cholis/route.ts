import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Choli from '@/models/Choli';
import { SEED_CHOLIS } from '@/lib/seedDatabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'ADMIN';

  try {
    const conn = await dbConnect();
    let cholis: any[] = [];

    if (conn) {
      cholis = await Choli.find({}).sort({ sku: 1 }).lean();
      if (!cholis || cholis.length === 0) {
        // Auto-seed with the 5 authentic cholis (rent < 2000)
        await Choli.insertMany(SEED_CHOLIS);
        cholis = await Choli.find({}).sort({ sku: 1 }).lean();
      }
    } else {
      cholis = SEED_CHOLIS;
    }

    // Role-based security: if Staff or Guest, mask confidential initial costing
    if (role === 'STAFF' || role === 'GUEST') {
      cholis = cholis.map((c: any) => ({
        ...c,
        totalCosting: 0,
      }));
    }

    return NextResponse.json({ success: true, data: cholis });
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

    if (conn) {
      // If client sent a dummy _id starting with choli-, remove it so Mongo generates a valid ObjectId
      const { _id, ...choliData } = body;
      const newCholi = await Choli.create(choliData);
      return NextResponse.json({ success: true, data: newCholi });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Choli ID is required' }, { status: 400 });
  }

  try {
    const conn = await dbConnect();
    if (conn) {
      await Choli.findOneAndDelete({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { sku: id }],
      });
      return NextResponse.json({ success: true, message: `Choli ${id} deleted successfully` });
    }

    return NextResponse.json({ success: true, message: 'Deleted locally' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
