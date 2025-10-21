import { NextRequest, NextResponse } from 'next/server';
import type {
  SubmitBountyItemRequest,
  SubmitBountyItemResponse,
  BountyItemData,
  PeekalinkResponse,
  YouTubeVideoResponse,
} from './types';

const PEEKALINK_API_URL = 'https://api.peekalink.io/';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
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

async function fetchYouTubeData(videoId: string, apiKey: string): Promise<YouTubeVideoResponse> {
  const url = `${YOUTUBE_API_URL}?id=${videoId}&part=snippet,statistics&key=${apiKey}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`YouTube API returned ${response.status}: ${response.statusText}`);
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
      const videoId = extractYouTubeVideoId(body.url);
      
      if (videoId) {
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;
        
        if (youtubeApiKey) {
          try {
            const youtubeData = await fetchYouTubeData(videoId, youtubeApiKey);
            
            if (youtubeData.items && youtubeData.items.length > 0) {
              const video = youtubeData.items[0];
              title = video.snippet.title;
              author = video.snippet.channelTitle;
              viewCount = parseInt(video.statistics.viewCount, 10);
              coverImage = video.snippet.thumbnails.maxres?.url || 
                          video.snippet.thumbnails.high?.url || 
                          video.snippet.thumbnails.medium?.url ||
                          coverImage;
            }
          } catch (error) {
            console.error('Failed to fetch YouTube data:', error);
          }
        }
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
