"use client";

import { Bounty } from "./data/bounties";
import { useState, useEffect } from "react";
import Link from "next/link";
import BountyCard from "./components/BountyCard";
import ClaimBountyDialog from "./components/ClaimBountyDialog";

export default function Home() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBounty, setSelectedBounty] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [bountyName, setBountyName] = useState("");
  const [bountyDescription, setBountyDescription] = useState("");
  const [totalBounty, setTotalBounty] = useState("");
  const [ratePer1k, setRatePer1k] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch bounties from database on mount
  useEffect(() => {
    fetchBounties();
  }, []);

  const fetchBounties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bounties");
      if (response.ok) {
        const data = await response.json();
        // Map database fields to frontend format
        const mappedBounties = data.map(
          (bounty: {
            id: number;
            name: string;
            description: string;
            total_bounty: number;
            rate_per_1k_views: number;
            claimed_bounty: number;
          }) => ({
            id: bounty.id,
            name: bounty.name,
            description: bounty.description,
            totalBounty: bounty.total_bounty,
            ratePer1kViews: bounty.rate_per_1k_views,
            claimedBounty: bounty.claimed_bounty,
          })
        );
        setBounties(mappedBounties);
      } else {
        console.error("Failed to fetch bounties");
      }
    } catch (error) {
      console.error("Error fetching bounties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBounty = (bountyId: number) => {
    setSelectedBounty(bountyId);
  };

  const handleCreateBounty = async () => {
    if (bountyName && bountyDescription && totalBounty && ratePer1k) {
      try {
        setIsCreating(true);

        const response = await fetch("/api/bounties", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: bountyName,
            description: bountyDescription,
            totalBounty: parseFloat(totalBounty),
            ratePer1kViews: parseFloat(ratePer1k),
          }),
        });

        if (response.ok) {
          const newBounty = await response.json();
          // Map database fields to frontend format
          const mappedBounty: Bounty = {
            id: newBounty.id,
            name: newBounty.name,
            description: newBounty.description,
            totalBounty: newBounty.total_bounty,
            ratePer1kViews: newBounty.rate_per_1k_views,
            claimedBounty: newBounty.claimed_bounty,
          };

          setBounties([mappedBounty, ...bounties]);

          // Reset form
          setBountyName("");
          setBountyDescription("");
          setTotalBounty("");
          setRatePer1k("");
          setShowCreateModal(false);
        } else {
          const error = await response.json();
          alert(`Failed to create bounty: ${error.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error creating bounty:", error);
        alert("Failed to create bounty. Please try again.");
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              No bounties available yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {bounties.map((bounty) => (
              <div
                key={bounty.id}
                className="relative md:[&:not(:nth-child(2n+1))]:ml-[-1px] lg:[&:not(:nth-child(3n+1))]:ml-[-1px] [&:not(:first-child)]:md:[&:nth-child(2n+1)]:mt-[-1px] [&:not(:first-child)]:lg:[&:nth-child(3n+1)]:mt-[-1px] md:[&:nth-child(n+3)]:mt-[-1px] lg:[&:nth-child(n+4)]:mt-[-1px] [&:not(:first-child)]:mt-[-1px] first:mt-[-1px] md:[&:nth-child(2)]:mt-[-1px] lg:[&:nth-child(3)]:mt-[-1px] hover:z-10"
              >
                <Link href={`/bounty/${bounty.id}`} className="block">
                  <BountyCard
                    bounty={bounty}
                    onClaim={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClaimBounty(bounty.id);
                    }}
                  />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedBounty && (
        <ClaimBountyDialog
          bounty={bounties.find((b) => b.id === selectedBounty)!}
          isOpen={!!selectedBounty}
          onClose={() => setSelectedBounty(null)}
        />
      )}

      {/* Create Bounty Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Create New Bounty
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Bounty Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bounty Name
                </label>
                <input
                  type="text"
                  value={bountyName}
                  onChange={(e) => setBountyName(e.target.value)}
                  placeholder="e.g., Sushi Hat Challenge"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={bountyDescription}
                  onChange={(e) => setBountyDescription(e.target.value)}
                  placeholder="Describe what creators should do..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Total Bounty */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Total Bounty ($)
                </label>
                <input
                  type="number"
                  value={totalBounty}
                  onChange={(e) => setTotalBounty(e.target.value)}
                  placeholder="5000"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Rate per 1k Views */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rate per 1k Views ($)
                </label>
                <input
                  type="number"
                  value={ratePer1k}
                  onChange={(e) => setRatePer1k(e.target.value)}
                  placeholder="8"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    !ratePer1k ||
                    isCreating
                  }
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Bounty"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
