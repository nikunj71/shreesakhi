import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Choli from '@/models/Choli';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'ADMIN';

  try {
    const conn = await dbConnect();
    let cholis: any[] = [];

    if (conn) {
      cholis = (await Choli.find({}).sort({ sku: 1 }).lean()) || [];
    } else {
      cholis = [];
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
  let body: any = null;
  try {
    body = await request.json();
    const conn = await dbConnect();

    if (!body.name || !body.sku) {
      return NextResponse.json(
        { success: false, error: 'Choli name and SKU are required' },
        { status: 400 }
      );
    }

    if (conn) {
      // Check if SKU already exists
      const existing = await Choli.findOne({ sku: body.sku.trim() });
      if (existing) {
        return NextResponse.json(
          { 
            success: false, 
            error: `SKU "${body.sku.trim()}" is already registered in the vault. Please use a unique SKU.` 
          },
          { status: 409 }
        );
      }

      // Ensure all fields have valid values and defaults
      const choliData = {
        ...body,
        sku: body.sku.trim(),
        name: body.name.trim(),
        category: body.category || 'Bridal',
        color: body.color || 'Royal Classic',
        fabric: body.fabric || 'Pure Heritage Fabric',
        blouseSize: body.blouseSize || '36 (Alterable 34-38)',
        skirtLength: Number(body.skirtLength || 42),
        images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['/logo-cropped.png'],
        totalCosting: Number(body.totalCosting || 0),
        rentalPricePerEvent: Number(body.rentalPricePerEvent || 0),
        securityDeposit: Number(body.securityDeposit || 0),
        dryCleaningFee: Number(body.dryCleaningFee || 0),
        totalEarnedFromRent: Number(body.totalEarnedFromRent || 0),
        isBreakEvenReached: Boolean(body.isBreakEvenReached || false),
        status: body.status || 'AVAILABLE',
        description: body.description || '',
        instagramUrl: body.instagramUrl || '',
        bufferDaysBefore: Number(body.bufferDaysBefore || 1),
        bufferDaysAfter: Number(body.bufferDaysAfter || 2),
      };
      delete (choliData as any)._id;

      const created = await Choli.create(choliData);
      const newCholi = created.toObject ? created.toObject() : created;
      
      return NextResponse.json({ 
        success: true, 
        data: {
          ...newCholi,
          _id: newCholi._id?.toString() || `choli-${Date.now()}`,
        } 
      });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    if (error.code === 11000 || error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, error: `SKU "${body?.sku}" already exists. Please choose a different SKU.` },
        { status: 409 }
      );
    }
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
