import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Choli from '@/models/Choli';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const decodedId = decodeURIComponent(id || '').trim();
    const isObjectId = decodedId.match(/^[0-9a-fA-F]{24}$/);
    const escaped = decodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const choli = await Choli.findOne({
      $or: [
        ...(isObjectId ? [{ _id: decodedId }] : []),
        { sku: decodedId },
        { sku: new RegExp(`^${escaped}$`, 'i') },
      ],
    }).lean();

    if (!choli) {
      return NextResponse.json({ success: false, error: 'Choli not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...choli,
        _id: (choli as any)._id?.toString() || decodedId,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const conn = await dbConnect();

    if (!conn) {
      return NextResponse.json({ success: true, data: { ...body, _id: id } });
    }

    const decodedId = decodeURIComponent(id || '').trim();
    const isObjectId = decodedId.match(/^[0-9a-fA-F]{24}$/);
    const escaped = decodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const { _id, ...updateData } = body;

    const filterConditions: any[] = [];
    if (isObjectId) {
      filterConditions.push({ _id: decodedId });
    }
    filterConditions.push({ sku: decodedId });
    filterConditions.push({ sku: new RegExp(`^${escaped}$`, 'i') });
    if (body.sku && body.sku !== decodedId) {
      filterConditions.push({ sku: body.sku });
    }

    // Recalculate isBreakEvenReached if totalCosting or totalEarnedFromRent is updated
    if (updateData.totalCosting !== undefined || updateData.totalEarnedFromRent !== undefined) {
      const existing = await Choli.findOne({ $or: filterConditions });
      if (existing) {
        const totalCost = updateData.totalCosting !== undefined ? Number(updateData.totalCosting) : existing.totalCosting;
        const totalEarned = updateData.totalEarnedFromRent !== undefined ? Number(updateData.totalEarnedFromRent) : existing.totalEarnedFromRent;
        updateData.isBreakEvenReached = totalEarned >= totalCost;
      }
    }

    const updated = await Choli.findOneAndUpdate(
      { $or: filterConditions },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Choli not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...updated,
        _id: (updated as any)._id?.toString() || decodedId,
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const deleted = await Choli.findOneAndDelete({
      $or: [
        ...(isObjectId ? [{ _id: id }] : []),
        { sku: id },
      ],
    });

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Choli not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Choli deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
