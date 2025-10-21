"use client";

import { bounties } from "./data/bounties";
import { useState } from "react";
import BountyCard from "./components/BountyCard";

export default function Home() {
  const [selectedBounty, setSelectedBounty] = useState<number | null>(null);
  const [platform, setPlatform] = useState("tiktok");
  const [url, setUrl] = useState("");

  const handleClaimBounty = (bountyId: number) => {
    setSelectedBounty(bountyId);
    setUrl("");
    setPlatform("tiktok");
  };

  const handleSubmit = () => {
    const bounty = bounties.find((b) => b.id === selectedBounty);
    if (bounty && url) {
      alert(
        `Submitted!\nBounty: ${bounty.name}\nPlatform: ${platform}\nURL: ${url}`
      );
      setSelectedBounty(null);
      setUrl("");
    }
  };

  const handleCalculate = () => {
    const bounty = bounties.find((b) => b.id === selectedBounty);
    if (bounty && url) {
      // Mock calculation - in real app you'd fetch actual view count
      const mockViews = Math.floor(Math.random() * 100000) + 1000;
      const earnings = (mockViews / 1000) * bounty.ratePer1kViews;
      alert(
        `Estimated Earnings:\nViews: ${mockViews.toLocaleString()}\nEarnings: $${earnings.toFixed(
          2
        )}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-black font-[family-name:var(--font-dancing-script)]">
            Django
          </h1>
          <p className="mt-2 text-gray-700">
            Browse available bounties and start earning today
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bounties.map((bounty, index) => (
            <div
              key={bounty.id}
              className="relative md:[&:not(:nth-child(2n+1))]:ml-[-1px] lg:[&:not(:nth-child(3n+1))]:ml-[-1px] [&:not(:first-child)]:md:[&:nth-child(2n+1)]:mt-[-1px] [&:not(:first-child)]:lg:[&:nth-child(3n+1)]:mt-[-1px] md:[&:nth-child(n+3)]:mt-[-1px] lg:[&:nth-child(n+4)]:mt-[-1px] [&:not(:first-child)]:mt-[-1px] first:mt-[-1px] md:[&:nth-child(2)]:mt-[-1px] lg:[&:nth-child(3)]:mt-[-1px] hover:z-10"
            >
              <BountyCard bounty={bounty} onClaim={handleClaimBounty} />
            </div>
          ))}
        </div>
      </main>

      {/* Claim Bounty Modal */}
      {selectedBounty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#F5F1E8] shadow-2xl max-w-md w-full p-6 border border-black">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-black">Claim Bounty</h2>
              <button
                onClick={() => setSelectedBounty(null)}
                className="text-black hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-lg font-semibold text-black mb-2">
                {bounties.find((b) => b.id === selectedBounty)?.name}
              </p>
              <p className="text-sm text-gray-700">
                {bounties.find((b) => b.id === selectedBounty)?.description}
              </p>
            </div>

            <div className="space-y-4">
              {/* Platform Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-2 border border-black bg-white text-black focus:outline-none focus:border-black"
                >
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCalculate}
                  disabled={!url}
                  className="flex-1 bg-black text-white font-semibold py-3 px-6 hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Calculate
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!url}
                  className="flex-1 bg-black text-white font-semibold py-3 px-6 hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
