"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import ClaimBountyDialog from "@/app/components/ClaimBountyDialog";
import { useUser } from "@clerk/nextjs";

export default function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const bountyId = parseInt(id);

  const [showModal, setShowModal] = useState(false);
  const [bounty, setBounty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchBounty = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/bounties");
        if (response.ok) {
          const data = await response.json();
          const foundBounty = data.find((b: any) => b.id === bountyId);
          if (foundBounty) {
            // Map to frontend format
            const mappedBounty = {
              id: foundBounty.id,
              name: foundBounty.name,
              description: foundBounty.description,
              totalBounty: foundBounty.total_bounty,
              ratePer1kViews: foundBounty.rate_per_1k_views,
              claimedBounty: foundBounty.claimed_bounty,
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
          <Link
            href="/"
            className="text-black hover:underline"
          >
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
        <Link
          href="/"
          className="text-black hover:underline mb-6 inline-block"
        >
          ← Back to Bounties
        </Link>

        <div className="overflow-hidden border border-gray-300">

          {/* Hero Section */}
          <div className="border-b border-gray-300 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-black">{bounty.name}</h2>
                <p className="text-gray-700 text-lg">{bounty.description}</p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="border border-black px-6 py-3">
                  <span className="text-sm text-gray-700 block">Total Bounty</span>
                  <span className="text-4xl font-bold text-black">${bounty.totalBounty.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Rate Card */}
              <div className="p-6 border border-gray-300">
                <h3 className="text-lg font-semibold text-black mb-2">
                  Earning Rate
                </h3>
                <p className="text-3xl font-bold text-black">
                  ${bounty.ratePer1kViews} per 1,000 views
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Get paid for every thousand views your content receives
                </p>
              </div>

              {/* Potential Earnings Calculator */}
              <div className="p-6 border border-gray-300">
                <h3 className="text-lg font-semibold text-black mb-2">
                  Potential Earnings
                </h3>
                <div className="space-y-2">
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
                    Post on any major social media platform (TikTok, Instagram, YouTube, Twitter, Facebook)
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
              <h3 className="text-2xl font-bold text-black mb-4">
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="border-2 border-black w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-black">1</span>
                  </div>
                  <h4 className="font-semibold text-black mb-2">
                    Create Content
                  </h4>
                  <p className="text-sm text-gray-700">
                    Make engaging content featuring the product
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-2 border-black w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-black">2</span>
                  </div>
                  <h4 className="font-semibold text-black mb-2">
                    Submit & Track
                  </h4>
                  <p className="text-sm text-gray-700">
                    Submit your URL and we&apos;ll track your views
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-2 border-black w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-black">3</span>
                  </div>
                  <h4 className="font-semibold text-black mb-2">
                    Get Paid
                  </h4>
                  <p className="text-sm text-gray-700">
                    Earn money based on your view count
                  </p>
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

