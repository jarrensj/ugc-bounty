import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all submissions from the store
    const storeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user-submissions/store`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!storeResponse.ok) {
      throw new Error('Failed to fetch submissions from store');
    }

    const storeData = await storeResponse.json();
    
    // Filter submissions for the current user
    const userSubmissions = (storeData.submissions || []).filter(
      (submission: any) => submission.submittedBy?.userId === userId
    );

    return NextResponse.json({
      success: true,
      submissions: userSubmissions,
    });
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

