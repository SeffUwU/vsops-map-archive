import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { createWriteStream, createReadStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PassThrough, pipeline } from 'stream';
import { Readable } from 'stream';

const CACHE_DIR = path.join(process.cwd(), '.proxy_cache');
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

function cacheKey(url: string) {
  return crypto.createHash('md5').update(url).digest('hex');
}

// Robust tee: upstream -> multiple outputs, ignores errors on individual pipes
function teeStream(input: NodeJS.ReadableStream, outputs: NodeJS.WritableStream[]) {
  const pass = new PassThrough();

  input.on('error', (err) => {
    outputs.forEach((out) => out.destroy(err));
    pass.destroy(err);
  });

  outputs.forEach((out) => {
    out.on('error', (err) => {
      // Just log, don't break the other outputs
      console.error('Pipe error:', err);
    });
  });

  input.pipe(pass);
  outputs.forEach((out) => pass.pipe(out, { end: true }));
  return pass;
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const routePath = (await params)?.path || [];
    const targetPath = routePath.join('/');
    const query = request.nextUrl.search;
    const targetUrl = `https://map.tops.vintagestory.at/${targetPath}${query}`;

    await ensureCacheDir();

    // const key = cacheKey(targetUrl);
    // const cacheFile = path.join(CACHE_DIR, key);

    // // Check cache
    // try {
    //   const stats = await fs.stat(cacheFile);
    //   if (Date.now() - stats.mtimeMs < CACHE_TTL) {
    //     const nodeStream = createReadStream(cacheFile);
    //     const webStream = Readable.toWeb(nodeStream);

    //     return new NextResponse(webStream as any, {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'X-Proxy-Cache': 'HIT',
    //         'Access-Control-Allow-Origin': '*',
    //       },
    //     });
    //   }
    // } catch {}

    const a = {
      'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36`,
    };
    // Fetch upstream
    const upstream = await fetch(targetUrl, { headers: a });

    if (!upstream.ok || !upstream.body) {
      return new NextResponse('Upstream error', { status: upstream.status });
    }

    // const upstreamStream = Readable.fromWeb(upstream.body as any);

    // const fileStream = createWriteStream(cacheFile);
    // const responseStream = teeStream(upstreamStream, [fileStream]);

    return new NextResponse(upstream.body as any, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
        'X-Proxy-Cache': 'MISS',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return new NextResponse('Proxy failed', { status: 500 });
  }
}
