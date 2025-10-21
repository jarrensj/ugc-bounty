import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import type {
  SubmitBountyItemRequest,
  SubmitBountyItemResponse,
  BountyItemData,
} from './types';

interface LinkPreviewResponse {
  title: string;
  description: string;
  image: string;
  url: string;
}

function detectPlatform(url: string): 'youtube' | 'tiktok' | 'instagram' | 'other' {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return 'youtube';
  }
  if (hostname.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (hostname.includes('instagram.com')) {
    return 'instagram';
  }
  
  return 'other';
}

async function fetchLinkPreviewData(url: string): Promise<LinkPreviewResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/link-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch preview data');
  }

  return response.json();
}


export async function POST(
  request: NextRequest
): Promise<NextResponse<SubmitBountyItemResponse>> {
  try {
    // Get the authenticated user
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You must be signed in to submit a bounty item' },
        { status: 401 }
      );
    }

    const body: SubmitBountyItemRequest = await request.json();

    if (!body.url || !body.bountyId) {
      return NextResponse.json(
        { success: false, error: 'URL and bountyId are required' },
        { status: 400 }
      );
    }

    const platform = detectPlatform(body.url);
    
    const linkPreviewData = await fetchLinkPreviewData(body.url);

    let title = linkPreviewData.title;
    let coverImage = linkPreviewData.image;
    let author: string | undefined;
    let viewCount: number | undefined;

    if (platform === 'youtube') {
      try {
        console.log(`[Submit Bounty] Fetching YouTube data for URL: ${body.url}`);
        
        // Use the YouTube views endpoint to get detailed data
        const youtubeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/youtube-views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: [body.url] }),
        });

        console.log(`[Submit Bounty] YouTube API response status: ${youtubeResponse.status}`);

        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          console.log(`[Submit Bounty] YouTube API response data:`, JSON.stringify(youtubeData, null, 2));
          
          const result = youtubeData.results[0];
          
          if (result.success && result.metadata) {
            title = result.metadata.title;
            author = result.metadata.channelTitle;
            viewCount = result.viewCount;
            coverImage = result.metadata.thumbnail || coverImage;
            
            console.log(`[Submit Bounty] YouTube data extracted - Title: ${title}, Author: ${author}, Views: ${viewCount}`);
          } else {
            console.error(`[Submit Bounty] YouTube API failed for ${body.url}:`, result.error);
          }
        } else {
          const errorText = await youtubeResponse.text();
          console.error(`[Submit Bounty] YouTube API error response:`, errorText);
        }
      } catch (error) {
        console.error('[Submit Bounty] Failed to fetch YouTube data:', error);
      }
    }

    // Store submission in Supabase
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .insert({
        bounty_id: body.bountyId,
        user_id: userId,
        video_url: body.url,
        view_count: viewCount || 0,
        title: title,
        description: linkPreviewData.description || '',
        cover_image_url: coverImage,
        author: author || null,
        platform: platform,
        status: 'approved' as const, // Auto-approve for now
        validation_explanation: null,
      } as any)
      .select()
      .single();

    if (submissionError) {
      console.error('Error storing submission in Supabase:', submissionError);
      return NextResponse.json(
        { success: false, error: 'Failed to store submission' },
        { status: 500 }
      );
    }

    // Update or create user profile
    await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        username: user?.username || null,
        email: user?.emailAddresses[0]?.emailAddress || null,
      } as any);

    const itemData: BountyItemData = {
      url: body.url,
      bountyId: body.bountyId,
      title,
      description: linkPreviewData.description || '',
      coverImage,
      author,
      viewCount,
      platform,
      createdAt: (submission as any).created_at,
      submittedBy: {
        userId,
        username: user?.username || undefined,
        email: user?.emailAddresses[0]?.emailAddress || undefined,
      },
    };

    return NextResponse.json({
      success: true,
      data: itemData,
    });
  } catch (error) {
    console.error('Error submitting bounty item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
