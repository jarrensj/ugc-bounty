"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import ClaimBountyDialog from "@/app/components/ClaimBountyDialog";
import Image from "next/image";

interface BountyItem {
  id: number;
  bounty_id: number;
  user_id: string;
  url: string;
  title: string;
  cover_image_url: string | null;
  author: string | null;
  view_count: number;
  like_count: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'other' | null;
  created_at: string;
}

interface Bounty {
  id: number;
  name: string;
  total_bounty: number;
  rate_per_1k_views: number;
  description: string;
  claimed_bounty: number;
  created_at: string;
  updated_at: string;
}

export default function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bountyId = parseInt(id);

  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [isLoadingBounty, setIsLoadingBounty] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bountyItems, setBountyItems] = useState<BountyItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    const fetchBounty = async () => {
      try {
        const response = await fetch(`/api/bounties/${bountyId}`);
        if (response.ok) {
          const data = await response.json();
          setBounty(data);
        }
      } catch (error) {
        console.error('Error fetching bounty:', error);
      } finally {
        setIsLoadingBounty(false);
      }
    };

    const fetchBountyItems = async () => {
      try {
        const response = await fetch(`/api/bounty-items?bountyId=${bountyId}`);
        if (response.ok) {
          const data = await response.json();
          setBountyItems(data);
        }
      } catch (error) {
        console.error('Error fetching bounty items:', error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchBounty();
    fetchBountyItems();
  }, [bountyId]);

  if (isLoadingBounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                  <span className="text-4xl font-bold text-black">${bounty.total_bounty.toLocaleString()}</span>
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
                  ${bounty.rate_per_1k_views} per 1,000 views
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
                      ${(10 * bounty.rate_per_1k_views).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">50k views:</span>
                    <span className="font-semibold text-black">
                      ${(50 * bounty.rate_per_1k_views).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">100k views:</span>
                    <span className="font-semibold text-black font-bold">
                      ${(100 * bounty.rate_per_1k_views).toFixed(2)}
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

            {/* CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-black text-white font-bold py-4 px-8 hover:bg-gray-800 transition-all duration-200 text-lg"
            >
              Submit your content to participate in this bounty
            </button>
          </div>
        </div>

        {/* Bounty Items Section */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Submitted Content
          </h2>
          
          {isLoadingItems ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : bountyItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-12 text-center border border-slate-200 dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No content submitted yet. Be the first to participate!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bountyItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-200"
                >
                  {item.cover_image_url && (
                    <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800">
                      <Image
                        src={item.cover_image_url}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    {item.author && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        by {item.author}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                      {item.view_count > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          {item.view_count.toLocaleString()}
                        </span>
                      )}
                      {item.like_count > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          {item.like_count.toLocaleString()}
                        </span>
                      )}
                      {item.platform && (
                        <span className="capitalize bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                          {item.platform}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
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

