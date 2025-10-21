import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface Submission {
  id: number;
  bounty_id: number;
  user_id: string;
  video_url: string;
  view_count: number;
  earned_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  validation_explanation: string | null;
  title: string | null;
  description: string | null;
  cover_image_url: string | null;
  author: string | null;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'other' | null;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  user_id: string;
  username: string | null;
  email: string | null;
}

export async function GET(
  request: NextRequest,
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

    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('bounty_id', bountyId)
      .order('created_at', { ascending: false });

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    // Get user profiles for all submissions
    const submissionsData = submissions as Submission[] | null;
    const userIds = submissionsData ? [...new Set(submissionsData.map(s => s.user_id))] : [];
    const { data: userProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, username, email')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      );
    }

    // Combine submissions with user profiles
    const profilesData = userProfiles as UserProfile[] | null;
    const data = submissionsData ? submissionsData.map(submission => ({
      ...submission,
      user_profiles: profilesData?.find(profile => profile.user_id === submission.user_id) || null
    })) : [];

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/bounties/[id]/submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
