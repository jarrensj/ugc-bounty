import { NextRequest, NextResponse } from 'next/server';

interface LinkPreviewRequest {
  url: string;
}

interface LinkPreviewResponse {
  title: string;
  description: string;
  image: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Link preview API called');
    const body: LinkPreviewRequest = await request.json();
    const { url } = body;

    console.log('Request URL:', url);

    if (!url) {
      console.log('Error: No URL provided');
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      console.log('Error: Invalid URL format:', error);
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // For now, return a simple preview based on the platform
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    console.log('Detected hostname:', hostname);
    
    let previewData: LinkPreviewResponse;

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      console.log('Generating YouTube preview');
      previewData = {
        title: 'YouTube Video',
        description: 'A YouTube video submission for the bounty',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmYwMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdVR1YmUgVmlkZW88L3RleHQ+PC9zdmc+',
        url: url
      };
    } else if (hostname.includes('instagram.com')) {
      console.log('Generating Instagram preview');
      previewData = {
        title: 'Instagram Post',
        description: 'An Instagram post submission for the bounty',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTQzMzUzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkluc3RhZ3JhbSBQb3N0PC90ZXh0Pjwvc3ZnPg==',
        url: url
      };
    } else if (hostname.includes('tiktok.com')) {
      console.log('Generating TikTok preview');
      previewData = {
        title: 'TikTok Video',
        description: 'A TikTok video submission for the bounty',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRpa1RvayBWaWRlbzwvdGV4dD48L3N2Zz4=',
        url: url
      };
    } else {
      console.log('Error: Unsupported platform for hostname:', hostname);
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 }
      );
    }

    console.log('Returning preview data:', previewData);
    return NextResponse.json(previewData);

  } catch (error) {
    console.error('Error generating link preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}