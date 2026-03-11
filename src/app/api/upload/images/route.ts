import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/database';
import { media } from '@/entities/media';
import { checkAuth } from '@/server/actions/auth/check-auth';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const result = await checkAuth();

    if (result.is_error) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Valid image file required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // compress
    let sharpInstance = sharp(inputBuffer);
    sharpInstance = sharpInstance.rotate().withMetadata();

    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      sharpInstance = sharpInstance.jpeg({ quality: 80, mozjpeg: true });
    } else if (file.type === 'image/png') {
      sharpInstance = sharpInstance.png({ quality: 80, palette: true });
    } else if (file.type === 'image/webp') {
      sharpInstance = sharpInstance.webp({ quality: 80 });
    }

    const compressedBuffer = await sharpInstance.toBuffer();
    const [inserted] = await db
      .insert(media)
      .values({
        data: compressedBuffer,
        mimeType: file.type,
        userId: result.value.user.id,
      })
      .returning({ id: media.id });

    return NextResponse.json({
      id: inserted.id,
      originalSize: inputBuffer.length,
      compressedSize: compressedBuffer.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
