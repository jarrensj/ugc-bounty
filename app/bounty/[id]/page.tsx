"use client";

import { bounties } from "@/app/data/bounties";
import { useState, use } from "react";
import Link from "next/link";
import ClaimBountyDialog from "@/app/components/ClaimBountyDialog";

export default function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bountyId = parseInt(id);
  const bounty = bounties.find((b) => b.id === bountyId);

  const [showModal, setShowModal] = useState(false);

  if (!bounty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Bounty Not Found
          </h1>
          <Link 
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
          >
            ← Back to Bounties
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            {bounty.name}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{bounty.name}</h2>
                <p className="text-blue-100 text-lg">{bounty.description}</p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                  <span className="text-sm opacity-90 block">Total Bounty</span>
                  <span className="text-4xl font-bold">${bounty.totalBounty.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Rate Card */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Earning Rate
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${bounty.ratePer1kViews} per 1,000 views
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Get paid for every thousand views your content receives
                </p>
              </div>

              {/* Potential Earnings Calculator */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Potential Earnings
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">10k views:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      ${(10 * bounty.ratePer1kViews).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">50k views:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      ${(50 * bounty.ratePer1kViews).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">100k views:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-bold">
                      ${(100 * bounty.ratePer1kViews).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Requirements
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Create original content featuring the product
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Post on any major social media platform (TikTok, Instagram, YouTube, Twitter, Facebook)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Submit your content URL to track views and earnings
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    Keep content live for at least 30 days
                  </span>
                </li>
              </ul>
            </div>

            {/* How It Works Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Create Content
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Make engaging content featuring the product
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Submit & Track
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Submit your URL and we&apos;ll track your views
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-emerald-100 dark:bg-emerald-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">3</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Get Paid
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Earn money based on your view count
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg shadow-lg hover:shadow-xl"
            >
              Submit your content to participate in this bounty
            </button>
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

