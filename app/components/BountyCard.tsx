"use client";

import { Bounty } from "../data/bounties";
import { useEffect, useState } from "react";

interface BountyCardProps {
  bounty: Bounty;
  onClaim: (e: React.MouseEvent) => void;
}

export default function BountyCard({ bounty, onClaim }: BountyCardProps) {
  const progressPercentage = (bounty.claimedBounty / bounty.totalBounty) * 100;
  const remainingBounty = bounty.totalBounty - bounty.claimedBounty;
  const [participantCount, setParticipantCount] = useState<number>(0);

  useEffect(() => {
    const fetchParticipantCount = async () => {
      try {
        const response = await fetch('/api/bounty-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bountyId: bounty.id }),
        });
        if (response.ok) {
          const data = await response.json();
          setParticipantCount(data.participantCount);
        }
      } catch (error) {
        console.error('Error fetching participant count:', error);
      }
    };

    fetchParticipantCount();
  }, [bounty.id]);

  return (
    <div className="group transition-all duration-300 overflow-hidden border border-gray-300 hover:border-black flex flex-col h-full">
      <div className="p-6 flex flex-col flex-grow">
        {/* Bounty Name */}
        <h2 className="text-2xl font-bold text-black mb-3">
          {bounty.name}
        </h2>

        {/* Total Bounty and Rate */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-black">
              Total Bounty
            </span>
            <span className="text-3xl font-bold text-black">
              ${bounty.totalBounty.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-black">
              Rate
            </span>
            <span className="text-xl font-semibold text-black">
              ${bounty.ratePer1kViews}/1k views
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-black">
              Progress
            </span>
            <span className="text-sm text-gray-700">
              ${remainingBounty.toLocaleString()} remaining
            </span>
          </div>
          <div className="w-full border border-black h-3 overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-700">
              ${bounty.claimedBounty.toLocaleString()} claimed
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-black mb-4 flex-grow">
          {bounty.description}
        </p>

        {/* Participant Count */}
        {participantCount > 0 && (
          <div className="mb-4 text-sm text-gray-700">
            <span className="font-medium">{participantCount}</span> {participantCount === 1 ? 'person has' : 'people have'} joined this bounty
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onClaim}
          className="w-full border border-black bg-transparent text-black font-semibold py-3 px-6 group-hover:bg-black group-hover:text-white transition-colors duration-200 mt-auto"
        >
          Claim Bounty
        </button>
      </div>
    </div>
  );
}

