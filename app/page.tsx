"use client";

import { bounties } from "./data/bounties";
import { useState } from "react";
import Link from "next/link";
import BountyCard from "./components/BountyCard";
import ClaimBountyDialog from "./components/ClaimBountyDialog";

export default function Home() {
  const [selectedBounty, setSelectedBounty] = useState<number | null>(null);

  const handleClaimBounty = (bountyId: number) => {
    setSelectedBounty(bountyId);
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
      </main>

      {selectedBounty && (
        <ClaimBountyDialog
          bounty={bounties.find((b) => b.id === selectedBounty)!}
          isOpen={!!selectedBounty}
          onClose={() => setSelectedBounty(null)}
        />
      )}
    </div>
  );
}
