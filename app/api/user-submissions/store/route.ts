import { NextRequest, NextResponse } from 'next/server';
import { BountyItemData } from '../../submit-bounty-item/types';

// In-memory storage (TODO: Replace with actual database)
// This will reset on server restart
const submissionsStore: BountyItemData[] = [];

export async function POST(request: NextRequest) {
  try {
    const submission: BountyItemData = await request.json();
    submissionsStore.push(submission);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error storing submission:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all submissions (for admin purposes or filtering on client side)
  return NextResponse.json({
    success: true,
    submissions: submissionsStore,
  });
}

