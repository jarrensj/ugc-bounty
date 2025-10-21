import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET all bounties
export async function GET() {
  try {
    const { data, error } = await supabase
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

// POST create a new bounty
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, totalBounty, ratePer1kViews } = body;

    // Validate required fields
    if (!name || !description || totalBounty === undefined || ratePer1kViews === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert bounty into database
    const { data, error } = await supabase
      .from('bounties')
      .insert({
        name,
        description,
        total_bounty: totalBounty,
        rate_per_1k_views: ratePer1kViews,
        claimed_bounty: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bounty:', error);
      return NextResponse.json(
        { error: 'Failed to create bounty' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/bounties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
