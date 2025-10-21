import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET single bounty by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bountyId = parseInt(id);

    if (isNaN(bountyId)) {
      return NextResponse.json(
        { error: 'Invalid bounty ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('bounties')
      .select('*')
      .eq('id', bountyId)
      .single();

    if (error) {
      console.error('Error fetching bounty:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Bounty not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch bounty' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/bounties/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
