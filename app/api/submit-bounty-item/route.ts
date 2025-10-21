import { NextRequest, NextResponse } from 'next/server';
import type {
  SubmitBountyItemRequest,
  SubmitBountyItemResponse,
  BountyItemData,
  PeekalinkResponse,
} from './types';

const PEEKALINK_API_URL = 'https://api.peekalink.io/';

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

async function fetchPeekalinkData(url: string, apiKey: string): Promise<PeekalinkResponse> {
  const response = await fetch(PEEKALINK_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ link: url }),
  });

  if (!response.ok) {
    throw new Error(`Peekalink API returned ${response.status}: ${response.statusText}`);
  }

  return response.json();
}


export async function POST(
  request: NextRequest
): Promise<NextResponse<SubmitBountyItemResponse>> {
  try {
    const peekalinkApiKey = process.env.PEEKALINK_API_KEY;
    if (!peekalinkApiKey) {
      return NextResponse.json(
        { success: false, error: 'Peekalink API key not configured' },
        { status: 500 }
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
    
    const peekalinkData = await fetchPeekalinkData(body.url, peekalinkApiKey);

    if (!peekalinkData.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch preview data' },
        { status: 400 }
      );
    }

    let title = peekalinkData.title;
    let coverImage = peekalinkData.image?.large?.url || peekalinkData.image?.medium?.url || peekalinkData.image?.original?.url;
    let author: string | undefined;
    let viewCount: number | undefined;

    if (platform === 'youtube') {
      try {
        // Use the YouTube views endpoint to get detailed data
        const youtubeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/youtube-views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: [body.url] }),
        });

        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          const result = youtubeData.results[0];
          
          if (result.success && result.metadata) {
            title = result.metadata.title;
            author = result.metadata.channelTitle;
            viewCount = result.viewCount;
            coverImage = result.metadata.thumbnail || coverImage;
          }
        }
      } catch (error) {
        console.error('Failed to fetch YouTube data:', error);
      }
    }

    const itemData: BountyItemData = {
      url: body.url,
      bountyId: body.bountyId,
      title,
      coverImage,
      author,
      viewCount,
      platform,
      createdAt: new Date().toISOString(),
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
