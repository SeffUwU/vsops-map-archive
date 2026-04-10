import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/database';
import { media } from '@/entities/media';
import { eq } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { uuid } = await context.params;

    const ifNoneMatch = req.headers.get('if-none-match');

    if (ifNoneMatch === uuid) {
      return new NextResponse(null, { status: 304 });
    }

    const [item] = await db
      .select({
        data: media.data,
        mimeType: media.mimeType,
        filename: media.filename,
      })
      .from(media)
      .where(eq(media.id, uuid))
      .limit(1);

    if (!item || !item.data) {
      return new NextResponse('Image Not Found', { status: 404 });
    }

    const body = item.data as Buffer;
    const ext = item.mimeType?.split('/')[1] || 'png';
    const filename = item.filename || `${uuid}.${ext}`;

    return new NextResponse(body as any, {
      headers: {
        'Content-Type': item.mimeType ?? 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': body.length.toString(),
        ETag: uuid,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Filename': filename,
        'X-Mime-Type': item.mimeType ?? 'image/png',
      },
    });
  } catch (error) {
    console.error('Image fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
