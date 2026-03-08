import { getCustomLayerGeoJson } from '@/server/actions/map/map.actions';
import { NextResponse } from 'next/server';

export async function GET() {
  const json = await getCustomLayerGeoJson();
  console.log(123, json);
  if (json.is_error) {
    throw 1;
  }

  return NextResponse.json(json.value, { status: 200 });
}
