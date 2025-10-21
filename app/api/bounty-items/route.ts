import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = supabaseAdmin;
  const searchParams = request.nextUrl.searchParams;
  const bountyId = searchParams.get('bountyId');

  if (!bountyId) {
    return NextResponse.json(
      { error: 'bountyId is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('bounty_items')
    .select('*')
    .eq('bounty_id', bountyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bounty items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bounty items' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = supabaseAdmin;
  const body = await request.json();

  const { bountyId } = body;

  if (!bountyId) {
    return NextResponse.json(
      { error: 'bountyId is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('bounty_items')
    .select('user_id')
    .eq('bounty_id', bountyId);

  if (error) {
    console.error('Error counting participants:', error);
    return NextResponse.json(
      { error: 'Failed to count participants' },
      { status: 500 }
    );
  }

  const uniqueParticipants = new Set(data?.map(item => item.user_id) || []).size;

  return NextResponse.json({ participantCount: uniqueParticipants });
}
