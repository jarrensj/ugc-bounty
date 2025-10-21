"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
interface Submission {
  id: number;
  url: string;
  bountyId: number;
  bountyName?: string;
  bountyDescription?: string;
  title: string;
  coverImage: string;
  author?: string | null;
  viewCount?: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'other';
  createdAt: string;
  status?: string;
  earnedAmount?: number;
}

export default function ProfilePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchSubmissions();
    } else if (isLoaded && !isSignedIn) {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user-submissions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-black mb-4">Sign In Required</h1>
          <p className="text-gray-700 mb-6">
            You need to be signed in to view your profile and submissions.
          </p>
          <Link 
            href="/"
            className="inline-block bg-black text-white font-semibold py-3 px-6 hover:bg-gray-800 transition-colors duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold text-black font-[family-name:var(--font-dancing-script)]">
                Django
              </h1>
              <p className="mt-2 text-gray-700">My Profile</p>
            </div>
            <Link 
              href="/"
              className="bg-transparent text-black font-semibold px-6 py-2 border border-black hover:bg-black hover:text-white transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info */}
        <div className="bg-white border border-gray-300 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">
                {user?.username || user?.firstName || 'User'}
              </h2>
              <p className="text-gray-700">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Member since {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-black">
                {submissions.length}
              </div>
              <div className="text-sm text-gray-600">
                Total Submissions
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Section */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-black mb-4">My Submissions</h3>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="bg-white border border-gray-300 p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              You haven&apos;t made any submissions yet.
            </p>
            <Link 
              href="/"
              className="inline-block bg-black text-white font-semibold py-3 px-6 hover:bg-gray-800 transition-colors duration-200"
            >
              Browse Bounties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <div 
                key={submission.id}
                className="bg-white border border-gray-300 overflow-hidden hover:border-black transition-colors duration-200"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold bg-black text-white px-2 py-1 uppercase">
                      {submission.platform}
                    </span>
                    {submission.status && (
                      <span className={`text-xs font-semibold px-2 py-1 uppercase ${
                        submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                        submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {submission.status}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-black mb-1">
                    {submission.bountyName || submission.title}
                  </h4>
                  
                  {submission.bountyDescription && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {submission.bountyDescription}
                    </p>
                  )}

                  <div className="space-y-2 mb-3">
                    {submission.viewCount !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-semibold text-black">
                          {submission.viewCount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {submission.earnedAmount !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Earned:</span>
                        <span className="font-bold text-green-600">
                          ${submission.earnedAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    Submitted {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                  
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-black hover:underline font-medium"
                  >
                    View Content →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

