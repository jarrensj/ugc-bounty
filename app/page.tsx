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
      alert(`Submitted!\nBounty: ${bounty.name}\nPlatform: ${platform}\nURL: ${url}`);
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
      alert(`Estimated Earnings:\nViews: ${mockViews.toLocaleString()}\nEarnings: $${earnings.toFixed(2)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            UGC Bounty
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Browse available bounties and start earning today
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bounties.map((bounty) => (
            <BountyCard
              key={bounty.id}
              bounty={bounty}
              onClaim={handleClaimBounty}
            />
          ))}
        </div>
      </main>

      {/* Claim Bounty Modal */}
      {selectedBounty && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Claim Bounty
              </h2>
              <button
                onClick={() => setSelectedBounty(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                {bounties.find((b) => b.id === selectedBounty)?.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {bounties.find((b) => b.id === selectedBounty)?.description}
              </p>
            </div>

            <div className="space-y-4">
              {/* Platform Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Content URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCalculate}
                  disabled={!url}
                  className="flex-1 bg-blue-600 dark:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Calculate
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!url}
                  className="flex-1 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
