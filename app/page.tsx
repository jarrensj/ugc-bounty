"use client";

import { Bounty } from "./data/bounties";
import { useState, useEffect } from "react";
import Link from "next/link";
import BountyCard from "./components/BountyCard";
import ClaimBountyDialog from "./components/ClaimBountyDialog";
import Header from "./components/Header";
import { useUser } from "@clerk/nextjs";

interface BountyWithCreator {
  id: number;
  name: string;
  description: string;
  total_bounty: number;
  rate_per_1k_views: number;
  claimed_bounty: number;
  creator_id: string | null;
  logo_url?: string | null;
  company_name?: string | null;
  calculated_claimed_bounty: number;
  progress_percentage: number;
  total_submission_views: number;
  is_completed: boolean;
}

export default function Home() {
  const { user } = useUser();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBounty, setSelectedBounty] = useState<number | null>(null);
  const [bountiesWithCreatorId, setBountiesWithCreatorId] = useState<BountyWithCreator[]>([]);

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
        // Store raw data with creator_id
        setBountiesWithCreatorId(data);
        
        // Map database fields to frontend format
        const mappedBounties = data.map(
          (bounty: {
            id: number;
            name: string;
            description: string;
            total_bounty: number;
            rate_per_1k_views: number;
            claimed_bounty: number;
            creator_id: string | null;
            logo_url?: string | null;
            company_name?: string | null;
            calculated_claimed_bounty: number;
            progress_percentage: number;
            total_submission_views: number;
            is_completed: boolean;
          }) => ({
            id: bounty.id,
            name: bounty.name,
            description: bounty.description,
            totalBounty: bounty.total_bounty,
            ratePer1kViews: bounty.rate_per_1k_views,
            claimedBounty: bounty.calculated_claimed_bounty, // Use calculated bounty instead of static claimed_bounty
            logoUrl: bounty.logo_url,
            companyName: bounty.company_name,
            progressPercentage: bounty.progress_percentage,
            totalSubmissionViews: bounty.total_submission_views,
            isCompleted: bounty.is_completed,
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

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <Header />

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
            {bounties.map((bounty) => {
              const rawBounty = bountiesWithCreatorId.find(b => b.id === bounty.id);
              const isOwner: boolean = Boolean(user && rawBounty?.creator_id === user.id);
              
              return (
                <div
                  key={bounty.id}
                  className="relative md:[&:not(:nth-child(2n+1))]:ml-[-1px] lg:[&:not(:nth-child(3n+1))]:ml-[-1px] [&:not(:first-child)]:md:[&:nth-child(2n+1)]:mt-[-1px] [&:not(:first-child)]:lg:[&:nth-child(3n+1)]:mt-[-1px] md:[&:nth-child(n+3)]:mt-[-1px] lg:[&:nth-child(n+4)]:mt-[-1px] [&:not(:first-child)]:mt-[-1px] first:mt-[-1px] md:[&:nth-child(2)]:mt-[-1px] lg:[&:nth-child(3)]:mt-[-1px] hover:z-10"
                >
                  <Link href={`/bounty/${bounty.id}`} className="block">
                    <BountyCard
                      bounty={bounty}
                      isOwner={isOwner}
                      onClaim={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClaimBounty(bounty.id);
                      }}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedBounty && (
        <ClaimBountyDialog
          bounty={bounties.find((b) => b.id === selectedBounty)!}
          isOpen={!!selectedBounty}
          onClose={() => setSelectedBounty(null)}
          isCompleted={bounties.find((b) => b.id === selectedBounty)?.isCompleted}
        />
      )}
    </div>
  );
}
