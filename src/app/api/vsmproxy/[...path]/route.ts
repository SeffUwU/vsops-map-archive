// app/api/vsmproxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    // Await the params promise
    const { path } = await params;

    // Extract the path from the URL (everything after /api/vsmproxy/)
    const pathSegments = path.join('/');

    // Get query parameters if any
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Construct the target URL
    let targetUrl = `https://map.tops.vintagestory.at/${pathSegments}`;
    if (queryString) {
      targetUrl += `?${queryString}`;
    }

    // Fetch the data from the target server
    const response = await fetch(targetUrl);

    // Check if the response is ok
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from upstream: ${response.status}` },
        { status: response.status },
      );
    }

    // Get the response body as array buffer
    const arrayBuffer = await response.arrayBuffer();

    // Convert ArrayBuffer to string
    const textData = new TextDecoder().decode(arrayBuffer);

    // Parse the string as JSON
    let jsonData;
    try {
      jsonData = JSON.parse(textData);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return NextResponse.json({ error: 'Upstream response is not valid JSON' }, { status: 500 });
    }

    // Create headers object
    const headers = new Headers();

    // Forward relevant headers from upstream
    const headersToForward = ['cache-control', 'etag', 'last-modified', 'expires', 'access-control-allow-origin'];

    for (const header of headersToForward) {
      const value = response.headers.get(header);
      if (value) {
        headers.set(header, value);
      }
    }

    // Set content type to JSON
    headers.set('content-type', 'application/json');

    // Add CORS headers
    headers.set('access-control-allow-origin', '*');

    // Return JSON response with original headers
    return NextResponse.json(jsonData, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
