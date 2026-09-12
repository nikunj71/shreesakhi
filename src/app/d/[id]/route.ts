import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import { buildInvoicePdf } from '@/lib/pdf';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Direct short/masked PDF download endpoint: /d/[id] (e.g. /d/8495 or /d/BK-8495)
 * Immediately generates and serves the official PDF file with attachment header
 * so clicking the link triggers an automatic direct download on mobile and desktop.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });
    }

    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const searchTerm = id.trim();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(searchTerm);
    const queryConditions: any[] = [];

    if (isObjectId) {
      queryConditions.push({ _id: searchTerm });
    }

    queryConditions.push({ bookingNumber: searchTerm });
    queryConditions.push({ bookingNumber: new RegExp(`^${searchTerm}$`, 'i') });
    const stripped = searchTerm.replace(/^BK-/i, '');
    queryConditions.push({ bookingNumber: `BK-${stripped}` });

    const booking = await Booking.findOne({ $or: queryConditions }).lean();

    if (!booking) {
      // If booking not found in DB, redirect to fallback invoice page
      const siteUrl = request.nextUrl.origin;
      return NextResponse.redirect(`${siteUrl}/invoice/${searchTerm}`);
    }

    // Build the high-resolution luxury PDF
    const doc = buildInvoicePdf(booking as any);
    const arrayBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `ShreeSakhi-Invoice-${booking.bookingNumber}.pdf`;

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Error generating direct PDF download:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
