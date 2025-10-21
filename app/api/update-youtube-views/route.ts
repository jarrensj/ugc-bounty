import { NextRequest, NextResponse } from 'next/server';
import type { YouTubeViewsResponse } from '../youtube-views/types';

interface BountyItem {
  id: string;
  url: string;
  bountyId: number;
  viewCount?: number;
  platform: string;
  lastUpdated: string;
}

/**
 * POST /api/update-youtube-views
 *
 * Background service to update YouTube view counts for existing bounty items
 * This endpoint can be called by a cron job or scheduled task
 *
 * Request body:
 * {
 *   "bountyItemIds": ["item1", "item2", ...], // Optional: specific items to update
 *   "bountyId": 123, // Optional: update all items for a specific bounty
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "updated": 5,
 *   "failed": 0,
 *   "results": [...]
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const { bountyItemIds, bountyId } = body;

    // In a real implementation, you would fetch bounty items from your database
    // For now, we'll simulate this with a placeholder
    const itemsToUpdate: BountyItem[] = [];

    if (bountyItemIds && Array.isArray(bountyItemIds)) {
      // Fetch specific items by IDs
      // itemsToUpdate = await db.bountyItems.findMany({ where: { id: { in: bountyItemIds } } });
      console.log('Would fetch items by IDs:', bountyItemIds);
    } else if (bountyId) {
      // Fetch all items for a specific bounty
      // itemsToUpdate = await db.bountyItems.findMany({ where: { bountyId, platform: 'youtube' } });
      console.log('Would fetch items for bounty:', bountyId);
    } else {
      // Fetch all YouTube items that haven't been updated recently
      // itemsToUpdate = await db.bountyItems.findMany({ 
      //   where: { 
      //     platform: 'youtube',
      //     lastUpdated: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours ago
      //   } 
      // });
      console.log('Would fetch all stale YouTube items');
    }

    // Filter to only YouTube items
    const youtubeItems = itemsToUpdate.filter(item => item.platform === 'youtube');

    if (youtubeItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No YouTube items to update',
        updated: 0,
        failed: 0,
        results: []
      });
    }

    // Extract URLs
    const urls = youtubeItems.map(item => item.url);

    // Call the YouTube views endpoint
    console.log(`[Update YouTube Views] Calling YouTube API for ${urls.length} URLs:`, urls);
    
    const youtubeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/youtube-views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    });

    console.log(`[Update YouTube Views] YouTube API response status: ${youtubeResponse.status}`);

    if (!youtubeResponse.ok) {
      const errorText = await youtubeResponse.text();
      console.error(`[Update YouTube Views] YouTube API error:`, errorText);
      throw new Error(`YouTube views API returned ${youtubeResponse.status}`);
    }

    const youtubeData: YouTubeViewsResponse = await youtubeResponse.json();
    console.log(`[Update YouTube Views] YouTube API response data:`, JSON.stringify(youtubeData, null, 2));
    
    let updatedCount = 0;
    let failedCount = 0;

    // Update items in database
    for (const result of youtubeData.results) {
      const item = youtubeItems.find(item => item.url === result.url);
      
      if (item && result.success && result.viewCount !== null) {
        try {
          // Update the item in database
          // await db.bountyItems.update({
          //   where: { id: item.id },
          //   data: {
          //     viewCount: result.viewCount,
          //     lastUpdated: new Date().toISOString()
          //   }
          // });
          
          updatedCount++;
          console.log(`Updated item ${item.id}: ${result.viewCount} views`);
        } catch (error) {
          console.error(`Failed to update item ${item.id}:`, error);
          failedCount++;
        }
      } else {
        console.error(`Failed to get view count for ${result.url}:`, result.error);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      failed: failedCount,
      results: youtubeData.results
    });

  } catch (error) {
    console.error('Error updating YouTube views:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/update-youtube-views
 *
 * Trigger a manual update of all stale YouTube view counts
 * This can be called by a cron job or manual trigger
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = await POST(request);
  return response;
}
