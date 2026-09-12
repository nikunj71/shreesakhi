import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import { buildInvoicePdf } from '@/lib/pdf';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Universal Mobile & Desktop PDF Download Endpoint: /d/[id]
 * Supports:
 * 1. Direct binary download: /d/[id]?download=raw
 * 2. In-browser PDF view: /d/[id]?view=1
 * 3. Fast, mobile-optimized auto-download landing page when opened from WhatsApp/mobile browsers
 *    with native Web Share API (Save to Files/Share) and fallback download buttons.
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
      const siteUrl = request.nextUrl.origin;
      return NextResponse.redirect(`${siteUrl}/invoice/${searchTerm}`);
    }

    // Build the high-resolution luxury PDF
    const doc = buildInvoicePdf(booking as any);
    const arrayBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `ShreeSakhi-Invoice-${booking.bookingNumber}.pdf`;

    const searchParams = request.nextUrl.searchParams;
    const downloadRaw =
      searchParams.get('download') === 'raw' ||
      searchParams.get('raw') === '1' ||
      searchParams.get('dl') === '1';
    const viewInline =
      searchParams.get('view') === '1' || searchParams.get('inline') === '1';

    const acceptHeader = request.headers.get('accept') || '';

    // If direct raw download or inline view requested, or if client specifically requests PDF
    if (downloadRaw || viewInline || acceptHeader === 'application/pdf' || !acceptHeader.includes('text/html')) {
      const disposition = viewInline ? 'inline' : 'attachment';
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `${disposition}; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=3600, must-revalidate',
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Otherwise, render an ultra-fast, mobile-optimized boutique auto-download page
    const grandTotalFormatted = (booking.finalTotal || 0).toLocaleString('en-IN');
    const paymentStatusText =
      booking.paymentStatus === 'CLEARED'
        ? 'PAID IN FULL ✅'
        : booking.paymentStatus === 'PARTIAL'
          ? 'ADVANCE RECEIVED 🟡'
          : 'PENDING ⏳';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="theme-color" content="#041A17" />
  <title>Shree Sakhi - Invoice ${booking.bookingNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #041A17;
      color: #FAF6EC;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .card {
      background: #072622;
      border: 1px solid #DFBD76;
      border-radius: 24px;
      max-width: 440px;
      width: 100%;
      padding: 28px 22px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .logo-container {
      background: #025151;
      border: 2px solid #DFBD76;
      border-radius: 16px;
      padding: 8px 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .logo-img {
      height: 44px;
      width: auto;
      object-fit: contain;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #DFBD76;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .subtitle {
      font-size: 13px;
      color: #9BB5AF;
      margin-bottom: 18px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .info-box {
      background: #041A17;
      border: 1px solid rgba(223, 189, 118, 0.25);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 20px;
      text-align: left;
      font-size: 13px;
      line-height: 1.5;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .info-row:last-child {
      margin-bottom: 0;
      padding-top: 10px;
      border-top: 1px dashed rgba(223, 189, 118, 0.3);
      font-weight: 700;
      color: #DFBD76;
      font-size: 14px;
    }
    .label {
      color: #9BB5AF;
    }
    .val {
      font-weight: 600;
      color: #FAF6EC;
    }
    .btn-download {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      background: linear-gradient(135deg, #DFBD76 0%, #C29B48 100%);
      color: #041A17;
      font-weight: 700;
      font-size: 15px;
      padding: 15px;
      border-radius: 14px;
      text-decoration: none;
      margin-bottom: 12px;
      box-shadow: 0 4px 15px rgba(223, 189, 118, 0.35);
      cursor: pointer;
      border: none;
      transition: transform 0.1s ease;
    }
    .btn-download:active {
      transform: scale(0.98);
    }
    .btn-share {
      display: none;
      width: 100%;
      background: #084C42;
      color: #DFBD76;
      font-weight: 600;
      font-size: 13.5px;
      padding: 13px;
      border-radius: 14px;
      text-decoration: none;
      border: 1px solid #DFBD76;
      cursor: pointer;
      margin-bottom: 12px;
    }
    .btn-share:active {
      transform: scale(0.98);
    }
    .btn-view {
      display: block;
      width: 100%;
      background: rgba(255, 255, 255, 0.06);
      color: #FAF6EC;
      font-weight: 600;
      font-size: 13px;
      padding: 12px;
      border-radius: 12px;
      text-decoration: none;
      border: 1px solid rgba(223, 189, 118, 0.2);
      margin-bottom: 16px;
    }
    .status-text {
      font-size: 12px;
      color: #34D399;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 10px;
      background: rgba(52, 211, 153, 0.1);
      border: 1px solid rgba(52, 211, 153, 0.2);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-container">
      <img src="/logo-cropped.png" alt="श्री SAKHI BOUTIQUE" class="logo-img" />
    </div>
    <div class="title">Official Rental Tax Invoice</div>
    <div class="subtitle">Booking #${booking.bookingNumber}</div>

    <div class="info-box">
      <div class="info-row">
        <span class="label">Billed To:</span>
        <span class="val">${booking.customer.name}</span>
      </div>
      <div class="info-row">
        <span class="label">Attire:</span>
        <span class="val">${booking.choliName || 'Designer Choli'} (${booking.choliSku})</span>
      </div>
      <div class="info-row">
        <span class="label">Rental Dates:</span>
        <span class="val">${booking.pickupDate} to ${booking.returnExpectedDate}</span>
      </div>
      <div class="info-row">
        <span class="label">Payment:</span>
        <span class="val" style="color: ${booking.paymentStatus === 'CLEARED' ? '#34D399' : '#DFBD76'};">${paymentStatusText}</span>
      </div>
      <div class="info-row">
        <span>Grand Total:</span>
        <span>Rs. ${grandTotalFormatted}</span>
      </div>
    </div>

    <!-- Primary Download Button -->
    <a id="downloadBtn" href="/d/${id}?download=raw" download="${fileName}" class="btn-download">
      📥 Download PDF Invoice
    </a>

    <!-- Mobile Native Save/Share Button (iOS & Android) -->
    <button id="shareBtn" class="btn-share">
      📲 Save / Share PDF to Phone
    </button>

    <!-- View Online Option -->
    <a href="/invoice/${id}" class="btn-view">
      👁️ View & Print Full Invoice
    </a>

    <div id="statusIndicator" class="status-text">
      <span>⚡ Downloading PDF directly to your device...</span>
    </div>
  </div>

  <script>
    const rawDownloadUrl = '/d/' + encodeURIComponent('${id}') + '?download=raw';
    const fileName = '${fileName}';

    // 1. Automatically initiate download in mobile & desktop browsers
    try {
      const a = document.createElement('a');
      a.href = rawDownloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { 
        if (a.parentNode) document.body.removeChild(a); 
      }, 1000);
    } catch(e) {
      console.warn('Auto download blocked:', e);
    }

    // 2. Web Share API support (for iOS Safari & Android mobile sharing)
    if (navigator.share) {
      const shareBtn = document.getElementById('shareBtn');
      if (shareBtn) {
        shareBtn.style.display = 'block';
        shareBtn.addEventListener('click', async () => {
          try {
            shareBtn.textContent = '⏳ Preparing PDF...';
            const resp = await fetch(rawDownloadUrl);
            const blob = await resp.blob();
            const file = new File([blob], fileName, { type: 'application/pdf' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'Shree Sakhi Tax Invoice',
                text: 'Official Rental Tax Invoice #${booking.bookingNumber} from Shree Sakhi Boutique.',
                files: [file],
              });
            } else {
              window.location.href = rawDownloadUrl;
            }
          } catch(err) {
            console.error(err);
            window.location.href = rawDownloadUrl;
          } finally {
            shareBtn.textContent = '📲 Save / Share PDF to Phone';
          }
        });
      }
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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
