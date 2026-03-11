import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/database';
import { media } from '@/entities/media';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { uuid: string } }) {
  try {
    const { uuid } = params;

    const [item] = await db
      .select({
        data: media.data,
        mimeType: media.mimeType,
      })
      .from(media)
      .where(eq(media.id, uuid))
      .limit(1);

    if (!item || !item.data) {
      return new NextResponse('Image Not Found', { status: 404 });
    }
    const body = item.data as Uint8Array<ArrayBuffer>;

    return new NextResponse(body, {
      headers: {
        'Content-Type': item.mimeType ?? 'image/png',
        'Content-Length': item.data.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
