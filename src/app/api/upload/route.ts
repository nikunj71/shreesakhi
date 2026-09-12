import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const maxDuration = 60; // Allow sufficient time for multi-image uploads

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Support multiple files under 'files' or 'file', or single 'file'
    const fileEntries = [
      ...formData.getAll('files'),
      ...formData.getAll('file'),
    ];

    const files = fileEntries.filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if Cloudinary credentials are configured
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary credentials missing in environment (.env / .env.local).' },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // Upload all files in parallel to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'shreesakhi_choli_collection',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) reject(error || new Error(`Upload failed for ${file.name}`));
            else resolve({ url: result.secure_url, publicId: result.public_id });
          }
        );
        stream.end(buffer);
      });
    });

    const settled = await Promise.allSettled(uploadPromises);
    const successful = settled
      .filter((s): s is PromiseFulfilledResult<{ url: string; publicId: string }> => s.status === 'fulfilled')
      .map((s) => s.value);

    if (successful.length === 0) {
      const firstError = settled.find((s) => s.status === 'rejected') as PromiseRejectedResult | undefined;
      throw new Error(firstError?.reason?.message || 'Failed to upload photo(s) to Cloudinary');
    }

    const urls = successful.map((r) => r.url);

    return NextResponse.json({
      success: true,
      urls,
      url: urls[0],
      publicId: successful[0]?.publicId,
      source: 'cloudinary',
      failedCount: settled.length - successful.length,
    });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload photo(s) to Cloudinary' },
      { status: 500 }
    );
  }
}

