/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from './supabase-server';
import type { Database } from '../types/database.types';

type Bounty = Database['public']['Tables']['bounties']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

/**
 * Get all active bounties with remaining balance
 */
export async function getActiveBounties(): Promise<Bounty[]> {
  const { data, error } = await (supabaseAdmin
    .from('bounties') as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Filter bounties that still have available funds
  return data?.filter((bounty: Bounty) => bounty.claimed_bounty < bounty.total_bounty) || [];
}

/**
 * Get a single bounty by ID
 */
export async function getBountyById(id: number): Promise<Bounty> {
  const { data, error } = await (supabaseAdmin
    .from('bounties') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all submissions for a specific bounty
 */
export async function getSubmissionsByBounty(bountyId: number): Promise<Submission[]> {
  const { data, error } = await (supabaseAdmin
    .from('submissions') as any)
    .select('*')
    .eq('bounty_id', bountyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all submissions for a specific user
 */
export async function getSubmissionsByUser(userId: string): Promise<Submission[]> {
  const { data, error } = await (supabaseAdmin
    .from('submissions') as any)
    .select(`
      *,
      bounties (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new submission
 */
export async function createSubmission(
  userId: string,
  bountyId: number,
  videoUrl: string
): Promise<Submission> {
  const { data, error } = await (supabaseAdmin
    .from('submissions') as any)
    .insert({
      user_id: userId,
      bounty_id: bountyId,
      video_url: videoUrl,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update submission status and validation result
 */
export async function updateSubmissionStatus(
  submissionId: number,
  status: 'pending' | 'approved' | 'rejected',
  validationExplanation: string,
  viewCount?: number
): Promise<Submission> {
  const updateData: {
    status: 'pending' | 'approved' | 'rejected';
    validation_explanation: string;
    view_count?: number;
    earned_amount?: number;
  } = {
    status,
    validation_explanation: validationExplanation
  };

  if (viewCount !== undefined) {
    updateData.view_count = viewCount;
    
    // If approved, calculate earned amount
    if (status === 'approved') {
      const { data: submission } = await (supabaseAdmin
        .from('submissions') as any)
        .select('bounty_id')
        .eq('id', submissionId)
        .single();

      if (submission) {
        const bounty = await getBountyById(submission.bounty_id);
        const earnedAmount = (viewCount / 1000) * bounty.rate_per_1k_views;
        updateData.earned_amount = earnedAmount;
      }
    }
  }

  const { data, error } = await (supabaseAdmin
    .from('submissions') as any)
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update bounty claimed amount
 */
export async function updateBountyClaimed(bountyId: number, amount: number): Promise<Bounty> {
  const { data: bounty } = await (supabaseAdmin
    .from('bounties') as any)
    .select('claimed_bounty')
    .eq('id', bountyId)
    .single();

  if (!bounty) throw new Error('Bounty not found');

  const newClaimedAmount = bounty.claimed_bounty + amount;

  const { data, error } = await (supabaseAdmin
    .from('bounties') as any)
    .update({ claimed_bounty: newClaimedAmount })
    .eq('id', bountyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get or create user profile
 */
export async function getOrCreateUserProfile(
  userId: string,
  email?: string,
  username?: string
): Promise<UserProfile> {
  // Try to get existing profile
  const { data: existingProfile } = await (supabaseAdmin
    .from('user_profiles') as any)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingProfile) return existingProfile;

  // Create new profile if doesn't exist
  const { data, error } = await (supabaseAdmin
    .from('user_profiles') as any)
    .insert({
      user_id: userId,
      email: email || null,
      username: username || null,
      total_earnings: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user total earnings
 */
export async function updateUserEarnings(userId: string, amount: number): Promise<UserProfile> {
  const { data: profile } = await (supabaseAdmin
    .from('user_profiles') as any)
    .select('total_earnings')
    .eq('user_id', userId)
    .single();

  if (!profile) throw new Error('User profile not found');

  const newTotalEarnings = profile.total_earnings + amount;

  const { data, error } = await (supabaseAdmin
    .from('user_profiles') as any)
    .update({ total_earnings: newTotalEarnings })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's total earnings and submission stats
 */
export async function getUserStats(userId: string) {
  const { data: profile } = await (supabaseAdmin
    .from('user_profiles') as any)
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: submissions } = await (supabaseAdmin
    .from('submissions') as any)
    .select('*')
    .eq('user_id', userId);

  const typedSubmissions = submissions as Submission[] | null;

  return {
    profile,
    stats: {
      totalSubmissions: typedSubmissions?.length || 0,
      approvedSubmissions: typedSubmissions?.filter(s => s.status === 'approved').length || 0,
      pendingSubmissions: typedSubmissions?.filter(s => s.status === 'pending').length || 0,
      rejectedSubmissions: typedSubmissions?.filter(s => s.status === 'rejected').length || 0,
      totalEarnings: profile?.total_earnings || 0,
      totalViews: typedSubmissions?.reduce((sum, s) => sum + s.view_count, 0) || 0
    }
  };
}

