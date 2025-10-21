"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import ClaimBountyDialog from "@/app/components/ClaimBountyDialog";
import { useUser } from "@clerk/nextjs";

interface Submission {
  id: number;
  bounty_id: number;
  user_id: string;
  video_url: string;
  view_count: number;
  earned_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  validation_explanation: string | null;
  title: string | null;
  description: string | null;
  cover_image_url: string | null;
  author: string | null;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'other' | null;
  created_at: string;
  updated_at: string;
  user_profiles: {
    username: string | null;
    email: string | null;
  } | null;
}

export default function BountyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useUser();
  const bountyId = parseInt(id);

  const [showModal, setShowModal] = useState(false);
  const [bounty, setBounty] = useState<{
    id: number;
    name: string;
    description: string;
    totalBounty: number;
    ratePer1kViews: number;
    claimedBounty: number;
    logoUrl?: string;
    companyName?: string;
  } | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchBounty = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/bounties");
        if (response.ok) {
          const data = await response.json();
          const foundBounty = data.find((b: { id: number; creator_id?: string | null }) => b.id === bountyId);
          if (foundBounty) {
            // Map to frontend format
            const mappedBounty = {
              id: foundBounty.id,
              name: foundBounty.name,
              description: foundBounty.description,
              totalBounty: foundBounty.total_bounty,
              ratePer1kViews: foundBounty.rate_per_1k_views,
              claimedBounty: foundBounty.claimed_bounty,
              logoUrl: foundBounty.logo_url,
              companyName: foundBounty.company_name,
            };
            setBounty(mappedBounty);
            
            // Check if user is owner
            if (user && foundBounty.creator_id === user.id) {
              setIsOwner(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching bounty:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBounty();
  }, [bountyId, user]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/bounties/${bountyId}/submissions`);
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    if (bountyId) {
      fetchSubmissions();
    }
  }, [bountyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">
            Bounty Not Found
          </h1>
          <Link href="/" className="text-black hover:underline">
            ← Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="text-black hover:underline mb-6 inline-block">
          ← Back to Bounties
        </Link>

        <div className="overflow-hidden border border-gray-300">
          {/* Hero Section */}
          <div className="border-b border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div
                className="flex flex-col justify-center items-center bg-black p-6 md:h-full md:row-span-full md:self-stretch order-1 md:order-1"
                style={{ minHeight: "100%" }}
              >
                <span className="text-sm text-white">Total Bounty</span>
                <span className="text-4xl font-bold text-white">
                  ${bounty.totalBounty.toLocaleString()}
                </span>
              </div>
              <div className="md:col-span-3 p-6 order-2 md:order-2">
                {(bounty.logoUrl || bounty.companyName) && (
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                    {bounty.logoUrl && (
                      <img
                        src={bounty.logoUrl}
                        alt={bounty.companyName || "Company logo"}
                        className="h-12 w-12 object-contain"
                      />
                    )}
                    {bounty.companyName && (
                      <span className="text-lg font-medium text-gray-700">
                        {bounty.companyName}
                      </span>
                    )}
                  </div>
                )}
                <h2 className="text-3xl font-bold mb-2 text-black">
                  {bounty.name}
                </h2>
                <p className="text-gray-700 text-lg">{bounty.description}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Rate Card */}
              <div className="border-r border-gray-300">
                <h3 className="text-lg font-semibold text-black mb-2 p-6 pb-0">
                  Earning Rate
                </h3>
                <p className="text-3xl font-bold text-black px-6">
                  ${bounty.ratePer1kViews} per 1,000 views
                </p>
                <p className="text-sm text-gray-700 mt-2 px-6 pb-6">
                  Get paid for every thousand views your content receives
                </p>
              </div>

              {/* Potential Earnings Calculator */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-2 p-6 pb-0">
                  Potential Earnings
                </h3>
                <div className="space-y-2 px-6 pb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-700">10k views:</span>
                    <span className="font-semibold text-black">
                      ${(10 * bounty.ratePer1kViews).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">50k views:</span>
                    <span className="font-semibold text-black">
                      ${(50 * bounty.ratePer1kViews).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">100k views:</span>
                    <span className="font-semibold text-black font-bold">
                      ${(100 * bounty.ratePer1kViews).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            {/* Requirements Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-black mb-4">
                Requirements
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-black text-xl">✓</span>
                  <span className="text-black">
                    Create original content featuring the product
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-black text-xl">✓</span>
                  <span className="text-black">
                    Post on any major social media platform (TikTok, Instagram,
                    YouTube, Twitter, Facebook)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-black text-xl">✓</span>
                  <span className="text-black">
                    Submit your content URL to track views and earnings
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-black text-xl">✓</span>
                  <span className="text-black">
                    Keep content live for at least 30 days
                  </span>
                </li>
              </ul>
            </div>

            {/* How It Works Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-black mb-12">
                How It Works
              </h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <span className="text-6xl font-bold text-black">1</span>
                  <div>
                    <h4 className="font-semibold text-black mb-2 text-lg">
                      Create Content
                    </h4>
                    <p className="text-gray-700">
                      Make engaging content featuring the product
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-6xl font-bold text-black">2</span>
                  <div>
                    <h4 className="font-semibold text-black mb-2 text-lg">
                      Submit & Track
                    </h4>
                    <p className="text-gray-700">
                      Submit your URL and we&apos;ll track your views
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-6xl font-bold text-black">3</span>
                  <div>
                    <h4 className="font-semibold text-black mb-2 text-lg">
                      Get Paid
                    </h4>
                    <p className="text-gray-700">
                      Earn money based on your view count
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button - Only show if not owner */}
            {!isOwner ? (
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-black text-white font-bold py-4 px-8 hover:bg-gray-800 transition-all duration-200 text-lg"
              >
                Submit your content to participate in this bounty
              </button>
            ) : (
              <div className="w-full border-2 border-gray-300 bg-gray-50 text-gray-600 font-bold py-4 px-8 text-center text-lg">
                This is your bounty. Creators will submit their content here.
              </div>
            )}
          </div>
        </div>

        {/* Submissions Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-black mb-6">
            Submissions ({submissions.length})
          </h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 border border-gray-300">
              <p className="text-gray-600">No submissions yet. Be the first to submit!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-300 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Preview Card */}
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-3">
                        <div className="flex gap-4">
                          {submission.cover_image_url && (
                            <div className="flex-shrink-0 relative w-20 h-20">
                              <img
                                src={submission.cover_image_url}
                                alt={submission.title || 'Preview'}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-2">
                              {submission.title || 'No title available'}
                            </h4>
                            {submission.description && (
                              <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 line-clamp-2">
                                {submission.description}
                              </p>
                            )}
                            <a 
                              href={submission.video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs mt-2 truncate block"
                            >
                              {submission.video_url}
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted by: {submission.user_profiles?.username || submission.user_profiles?.email || 'Anonymous'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-black">
                        {submission.view_count.toLocaleString()} views
                      </div>
                      <div className="text-sm text-gray-600">
                        ${submission.earned_amount.toFixed(2)} earned
                      </div>
                    </div>
                  </div>
                  {submission.validation_explanation && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> {submission.validation_explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Claim Bounty Modal */}
      {showModal && (
        <ClaimBountyDialog
          bounty={bounty}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}