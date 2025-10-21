// YouTube Data API v3 Response Types

export interface YouTubeSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
    standard?: YouTubeThumbnail;
    maxres?: YouTubeThumbnail;
  };
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  liveBroadcastContent: string;
  localized: {
    title: string;
    description: string;
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeStatistics {
  viewCount: string; // Note: YouTube returns these as strings
  likeCount?: string;
  favoriteCount?: string;
  commentCount?: string;
}

export interface YouTubeContentDetails {
  duration: string; // ISO 8601 format (e.g., "PT1M30S")
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  contentRating: Record<string, unknown>;
  projection: string;
}

export interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeSnippet;
  contentDetails?: YouTubeContentDetails;
  statistics: YouTubeStatistics;
}

export interface YouTubeAPIResponse {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeVideoItem[];
}

// API Request/Response Types

export interface YouTubeShortsViewsRequest {
  urls: string[];
}

export interface VideoViewResult {
  url: string;
  videoId: string | null;
  viewCount: number | null;
  success: boolean;
  error?: string;
  metadata?: {
    title: string;
    channelTitle: string;
    channelId: string;
    likes: number | null;
    comments: number | null;
    duration: string;
    publishedAt: string;
    thumbnail: string;
  };
}

export interface YouTubeShortsViewsResponse {
  results: VideoViewResult[];
  summary: {
    totalVideos: number;
    successful: number;
    failed: number;
    totalViews: number;
  };
}
