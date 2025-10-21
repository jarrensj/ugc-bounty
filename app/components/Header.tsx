"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bountyName, setBountyName] = useState("");
  const [bountyDescription, setBountyDescription] = useState("");
  const [totalBounty, setTotalBounty] = useState("");
  const [ratePer1k, setRatePer1k] = useState("");

  const handleCreateBounty = () => {
    if (bountyName && bountyDescription && totalBounty && ratePer1k) {
      // TODO: Save to database/state management
      console.log("Creating bounty:", {
        name: bountyName,
        description: bountyDescription,
        totalBounty: parseFloat(totalBounty),
        ratePer1kViews: parseFloat(ratePer1k),
      });

      setBountyName("");
      setBountyDescription("");
      setTotalBounty("");
      setRatePer1k("");
      setShowCreateModal(false);
    }
  };

  return (
    <>
      <header className="border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch">
            <Link href="/" className="py-6">
              <h1 className="text-4xl font-bold text-black font-[family-name:var(--font-dancing-script)]">
                Django
              </h1>
              <p className="mt-2 text-gray-700">
                Browse available bounties and start earning today
              </p>
            </Link>
            <div className="flex gap-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-transparent text-black font-semibold px-12 transition-colors duration-200 border-l border-r border-gray-300 hover:border-b-4 hover:border-b-black hover:cursor-pointer -mr-px"
              >
                Create Bounty
              </button>
              <SignUpButton mode="modal">
                <button className="bg-transparent text-black font-semibold px-12 transition-colors duration-200 border-l border-r border-gray-300 hover:border-b-4 hover:border-b-black hover:cursor-pointer -mr-px">
                  Sign Up
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="bg-transparent text-black font-semibold px-12 transition-colors duration-200 border-l border-r border-gray-300 hover:border-b-4 hover:border-b-black hover:cursor-pointer">
                  Login
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </header>

      {/* Create Bounty Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#F5F1E8] shadow-2xl max-w-lg w-full p-6 border border-black">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-black">
                Create New Bounty
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-black hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Bounty Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bounty Name
                </label>
                <input
                  type="text"
                  value={bountyName}
                  onChange={(e) => setBountyName(e.target.value)}
                  placeholder="e.g., Sushi Hat Challenge"
                  className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={bountyDescription}
                  onChange={(e) => setBountyDescription(e.target.value)}
                  placeholder="Describe what creators should do..."
                  rows={3}
                  className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black resize-none"
                />
              </div>

              {/* Total Bounty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Bounty ($)
                </label>
                <input
                  type="number"
                  value={totalBounty}
                  onChange={(e) => setTotalBounty(e.target.value)}
                  placeholder="5000"
                  min="0"
                  className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              {/* Rate per 1k Views */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate per 1k Views ($)
                </label>
                <input
                  type="number"
                  value={ratePer1k}
                  onChange={(e) => setRatePer1k(e.target.value)}
                  placeholder="8"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleCreateBounty}
                  disabled={
                    !bountyName ||
                    !bountyDescription ||
                    !totalBounty ||
                    !ratePer1k
                  }
                  className="w-full bg-black text-white font-semibold py-3 px-6 hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Bounty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
