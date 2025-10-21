export interface SubmitBountyItemRequest {
  url: string;
  bountyId: number;
}

export interface PeekalinkImage {
  thumbnail: ImageSize;
  medium: ImageSize;
  large: ImageSize;
  original: ImageSize;
}

export interface ImageSize {
  width: number;
  height: number;
  url: string;
}

export interface TikTokVideo {
  id: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
}

export interface PeekalinkResponse {
  id: number;
  ok: boolean;
  url: string;
  domain: string;
  type: string;
  status: number;
  updatedAt: string;
  size: number;
  redirected: boolean;
  title: string;
  description: string;
  image: PeekalinkImage;
  tiktokVideo?: TikTokVideo;
  requestId: string;
}

export interface YouTubeVideoSnippet {
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  publishedAt: string;
}

export interface YouTubeVideoStatistics {
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export interface YouTubeVideoResponse {
  items: Array<{
    id: string;
    snippet: YouTubeVideoSnippet;
    statistics: YouTubeVideoStatistics;
  }>;
}

export interface BountyItemData {
  id?: number;
  url: string;
  bountyId: number;
  title: string;
  coverImage: string;
  author?: string;
  viewCount?: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'other';
  createdAt: string;
}

export interface SubmitBountyItemResponse {
  success: boolean;
  data?: BountyItemData;
  error?: string;
}
