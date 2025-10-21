import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import type {
  YouTubeShortsViewsRequest,
  YouTubeShortsViewsResponse,
  VideoViewResult,
  YouTubeAPIResponse,
} from './types';

const youtube = google.youtube('v3');

/**
 * Extracts video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/shorts/{VIDEO_ID}
 * - https://www.youtube.com/watch?v={VIDEO_ID}
 * - https://youtu.be/{VIDEO_ID}
 * - https://m.youtube.com/watch?v={VIDEO_ID}
 */
function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Handle youtu.be short links
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1).split('?')[0];
    }

    // Handle youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      // Handle /shorts/ URLs
      if (urlObj.pathname.startsWith('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1].split('?')[0];
      }

      // Handle /watch URLs
      if (urlObj.pathname === '/watch') {
        return urlObj.searchParams.get('v');
      }

      // Handle /embed/ URLs
      if (urlObj.pathname.startsWith('/embed/')) {
        return urlObj.pathname.split('/embed/')[1].split('?')[0];
      }

      // Handle /v/ URLs
      if (urlObj.pathname.startsWith('/v/')) {
        return urlObj.pathname.split('/v/')[1].split('?')[0];
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches video data from YouTube Data API v3
 */
async function fetchYouTubeVideoData(
  videoId: string,
  apiKey: string
): Promise<YouTubeAPIResponse> {
  const response = await youtube.videos.list({
    key: apiKey,
    part: ['snippet', 'statistics', 'contentDetails'],
    id: [videoId],
  });

  return response.data as YouTubeAPIResponse;
}

/**
 * Processes a single YouTube URL and extracts view count and metadata
 */
async function processVideo(url: string, apiKey: string): Promise<VideoViewResult> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(url);

    if (!videoId) {
      return {
        url,
        videoId: null,
        viewCount: null,
        success: false,
        error: 'Invalid YouTube URL or could not extract video ID',
      };
    }

    // Fetch data from YouTube API
    const data = await fetchYouTubeVideoData(videoId, apiKey);

    // Check if video was found
    if (!data.items || data.items.length === 0) {
      return {
        url,
        videoId,
        viewCount: null,
        success: false,
        error: 'Video not found or is private/deleted',
      };
    }

    const video = data.items[0];
    const viewCount = parseInt(video.statistics.viewCount, 10);
    const likeCount = video.statistics.likeCount
      ? parseInt(video.statistics.likeCount, 10)
      : null;
    const commentCount = video.statistics.commentCount
      ? parseInt(video.statistics.commentCount, 10)
      : null;

    return {
      url,
      videoId,
      viewCount,
      success: true,
      metadata: {
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        likes: likeCount,
        comments: commentCount,
        duration: video.contentDetails?.duration || '',
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || '',
      },
    };
  } catch (error) {
    return {
      url,
      videoId: extractVideoId(url),
      viewCount: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * POST /api/youtube-shorts-views
 *
 * Accepts a list of YouTube video URLs and returns view counts for each
 *
 * Request body:
 * {
 *   "urls": ["https://www.youtube.com/shorts/xyz", ...]
 * }
 *
 * Response:
 * {
 *   "results": [{ "url": "...", "viewCount": 123456, "success": true, "metadata": {...} }],
 *   "summary": { "totalVideos": 1, "successful": 1, "failed": 0, "totalViews": 123456 }
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<YouTubeShortsViewsResponse | { error: string }>> {
  try {
    // Get API key from environment
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
      return NextResponse.json(
        { error: 'YouTube API key not configured. Please add YOUTUBE_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: YouTubeShortsViewsRequest = await request.json();

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
          videoId: null,
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

    const response: YouTubeShortsViewsResponse = {
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
