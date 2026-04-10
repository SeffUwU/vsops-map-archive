import { getSettlements } from '@/server/actions/settlements/settlements.actions';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await getSettlements();

  if (result.is_error) {
    return NextResponse.json({ error: result }, { status: 500 });
  }

  return NextResponse.json(result.value);
}
