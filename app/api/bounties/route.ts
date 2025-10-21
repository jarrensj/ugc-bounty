import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET all bounties
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('bounties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bounties:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bounties' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/bounties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

