import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET all bounties
export async function GET() {
  try {
    const { data: bounties, error } = await supabase
      .from('bounties')
      .select(`
        *,
        submissions (
          id,
          view_count,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bounties:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bounties' },
        { status: 500 }
      );
    }

    // Calculate progress based purely on submissions' view counts
    const bountiesWithProgress = bounties?.map(bounty => {
      const approvedSubmissions = bounty.submissions?.filter(
        (submission: any) => submission.status === 'approved'
      ) || [];
      
      const totalViews = approvedSubmissions.reduce(
        (sum: number, submission: any) => sum + (submission.view_count || 0), 
        0
      );
      
      // Calculate how much bounty has been "used" based purely on views
      // Formula: (totalViews / 1000) * ratePer1kViews
      const usedBounty = (totalViews / 1000) * bounty.rate_per_1k_views;
      
      // Cap the used bounty at the total bounty amount
      const cappedUsedBounty = Math.min(usedBounty, bounty.total_bounty);
      
      // Calculate progress percentage (will be 100% if views exceed total)
      const progressPercentage = Math.min((usedBounty / bounty.total_bounty) * 100, 100);
      
      return {
        ...bounty,
        // Remove dependency on stored claimed_bounty - use only calculated values
        calculated_claimed_bounty: cappedUsedBounty,
        progress_percentage: progressPercentage,
        total_submission_views: totalViews,
        is_completed: usedBounty >= bounty.total_bounty
      };
    });

    return NextResponse.json(bountiesWithProgress);
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
    // Get the authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to create a bounty.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, totalBounty, ratePer1kViews } = body;

    // Validate required fields
    if (!name || !description || totalBounty === undefined || ratePer1kViews === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert bounty into database with creator_id
    const { data, error } = await supabase
      .from('bounties')
      .insert({
        name,
        description,
        total_bounty: totalBounty,
        rate_per_1k_views: ratePer1kViews,
        claimed_bounty: 0,
        creator_id: userId,
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

// PUT update a bounty (only title and description, only by owner)
export async function PUT(request: Request) {
  try {
    // Get the authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to update a bounty.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, description } = body;

    // Validate required fields
    if (!id || (!name && !description)) {
      return NextResponse.json(
        { error: 'Missing required fields. Need bounty id and at least name or description.' },
        { status: 400 }
      );
    }

    // First, check if the user is the owner of the bounty
    const { data: bounty, error: fetchError } = await supabase
      .from('bounties')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchError || !bounty) {
      return NextResponse.json(
        { error: 'Bounty not found' },
        { status: 404 }
      );
    }

    if (bounty.creator_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only edit your own bounties.' },
        { status: 403 }
      );
    }

    // Update only name and description
    const updateData: { name?: string; description?: string } = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const { data, error } = await supabase
      .from('bounties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bounty:', error);
      return NextResponse.json(
        { error: 'Failed to update bounty' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/bounties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
