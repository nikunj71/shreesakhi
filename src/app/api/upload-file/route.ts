import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const maxDuration = 60; // 60 seconds max duration for single image upload

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Accept single file under 'file', 'image', or 'photo'
    const file = formData.get('file') || formData.get('image') || formData.get('photo');

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid image file provided in upload request.' },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Verify Cloudinary credentials in environment
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary credentials missing in environment variables (.env / .env.local).' 
        },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload single file stream to Cloudinary
    const uploadResult = await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'shreesakhi_choli_collection',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error(`Cloudinary upload failed for ${file.name}`));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      fileName: file.name,
      fileSize: file.size,
      source: 'cloudinary',
    });
  } catch (error: any) {
    console.error('Error in /api/upload-file:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to upload file to Cloudinary' 
      },
      { status: 500 }
    );
  }
}
