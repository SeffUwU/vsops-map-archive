import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { stat } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path;

  if (segments.length !== 4 || segments[0] !== 'data' || segments[1] !== 'world') {
    return new NextResponse(null, { status: 400 });
  }

  const z = path.basename(segments[2]);
  const fileName = path.basename(segments[3]).replace('.png', '');

  const rootTilesDir = path.join(process.cwd(), 'old_maps', '2026', 'tiles');
  const filePath = path.join(rootTilesDir, `${z}_${fileName}.png`);

  if (!filePath.startsWith(rootTilesDir)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const nodeStream = fs.createReadStream(filePath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => controller.enqueue(chunk));
        nodeStream.on('end', () => controller.close());
        nodeStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
      },
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return new NextResponse('Not Found', { status: 404 });
    }

    return new NextResponse('Internal Error', { status: 500 });
  }
}
