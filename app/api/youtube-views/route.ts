import { NextRequest, NextResponse } from 'next/server';
import type {
  YouTubeViewsRequest,
  YouTubeViewsResponse,
  VideoViewResult,
  YouTubeVideoResponse,
} from './types';

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

/**
 * Fetches YouTube video data from YouTube Data API
 */
async function fetchYouTubeData(videoId: string, apiKey: string): Promise<YouTubeVideoResponse> {
  const url = `${YOUTUBE_API_URL}?id=${videoId}&part=snippet,statistics&key=${apiKey}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`YouTube API returned ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Processes a single YouTube URL and extracts view count
 */
async function processVideo(url: string, apiKey: string): Promise<VideoViewResult> {
  try {
    const videoId = extractYouTubeVideoId(url);
    
    if (!videoId) {
      return {
        url,
        viewCount: null,
        success: false,
        error: 'Invalid YouTube URL - could not extract video ID',
      };
    }

    const data = await fetchYouTubeData(videoId, apiKey);

    // Check if the response contains video data
    if (!data.items || data.items.length === 0) {
      return {
        url,
        viewCount: null,
        success: false,
        error: 'Video not found or not accessible',
      };
    }

    const video = data.items[0];
    const statistics = video.statistics;
    const snippet = video.snippet;

    return {
      url,
      viewCount: parseInt(statistics.viewCount, 10),
      success: true,
      metadata: {
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        likes: parseInt(statistics.likeCount, 10),
        comments: parseInt(statistics.commentCount, 10),
        publishedAt: snippet.publishedAt,
        thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
      },
    };
  } catch (error) {
    return {
      url,
      viewCount: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * POST /api/youtube-views
 *
 * Accepts a list of YouTube video URLs and returns view counts for each
 *
 * Request body:
 * {
 *   "urls": ["https://www.youtube.com/watch?v=123", ...]
 * }
 *
 * Response:
 * {
 *   "results": [{ "url": "...", "viewCount": 123456, "success": true, "metadata": {...} }],
 *   "summary": { "totalVideos": 1, "successful": 1, "failed": 0, "totalViews": 123456 }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<YouTubeViewsResponse | { error: string }>> {
  try {
    // Get API key from environment
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: YouTubeViewsRequest = await request.json();

    // Validate request
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: "urls" must be a non-empty array' },
        { status: 400 }
      );
    }

    // Process all URLs in parallel
    const results = await Promise.allSettled(
      body.urls.map((url) => processVideo(url, apiKey))
    );

    // Extract results from Promise.allSettled
    const videoResults: VideoViewResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          url: body.urls[index],
          viewCount: null,
          success: false,
          error: result.reason?.message || 'Processing failed',
        };
      }
    });

    // Calculate summary statistics
    const successful = videoResults.filter((r) => r.success).length;
    const failed = videoResults.length - successful;
    const totalViews = videoResults.reduce(
      (sum, result) => sum + (result.viewCount || 0),
      0
    );

    const response: YouTubeViewsResponse = {
      results: videoResults,
      summary: {
        totalVideos: videoResults.length,
        successful,
        failed,
        totalViews,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing YouTube views request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
