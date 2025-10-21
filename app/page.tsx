"use client";

import { bounties as initialBounties, Bounty } from "./data/bounties";
import { useState, useEffect } from "react";
import Link from "next/link";
import BountyCard from "./components/BountyCard";
import ClaimBountyDialog from "./components/ClaimBountyDialog";

export default function Home() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBounty, setSelectedBounty] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    explanation: string;
  } | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create bounty form state
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
        const mappedBounties = data.map((bounty: any) => ({
          id: bounty.id,
          name: bounty.name,
          description: bounty.description,
          totalBounty: bounty.total_bounty,
          ratePer1kViews: bounty.rate_per_1k_views,
          claimedBounty: bounty.claimed_bounty,
        }));
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

  const isValidSupportedUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      return (
        hostname.includes("youtube.com") ||
        hostname.includes("youtu.be") ||
        hostname.includes("instagram.com") ||
        hostname.includes("tiktok.com")
      );
    } catch {
      return false;
    }
  };

  const getPlatformFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be"))
        return "youtube";
      if (hostname.includes("instagram.com")) return "instagram";
      if (hostname.includes("tiktok.com")) return "tiktok";
      return "unknown";
    } catch {
      return "unknown";
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setUrlError(null);

    if (newUrl && !isValidSupportedUrl(newUrl)) {
      setUrlError("URL must be from YouTube, Instagram, or TikTok");
    }
  };

  const handleClaimBounty = (bountyId: number) => {
    setSelectedBounty(bountyId);
    setUrl("");
    setValidationResult(null);
    setIsValidating(false);
    setUrlError(null);
  };

  const handleSubmit = async () => {
    const bounty = bounties.find((b) => b.id === selectedBounty);
    if (bounty && url && isValidSupportedUrl(url)) {
      const platform = getPlatformFromUrl(url);

      if (platform === "youtube") {
        setIsValidating(true);
        setValidationResult(null);

        try {
          const response = await fetch("/api/validate-bounty", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: url,
              requirements: bounty.description,
            }),
          });

          const result = await response.json();
          setValidationResult(result);
        } catch (error) {
          setValidationResult({
            valid: false,
            explanation: "Failed to validate video. Please try again.",
          });
        } finally {
          setIsValidating(false);
        }
      } else {
        // For Instagram and TikTok, show success message directly
        alert(
          `Submitted!\nBounty: ${bounty.name}\nPlatform: ${platform}\nURL: ${url}`
        );
        setSelectedBounty(null);
        setUrl("");
      }
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
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch">
            <div className="py-6">
              <h1 className="text-4xl font-bold text-black font-[family-name:var(--font-dancing-script)]">
                Django
              </h1>
              <p className="mt-2 text-gray-700">
                Browse available bounties and start earning today
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-black text-white font-semibold px-12 hover:bg-gray-800 transition-colors duration-200"
            >
              Create Bounty
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No bounties available yet. Create one to get started!</p>
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
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content URL (YouTube, Instagram, or TikTok)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://instagram.com/... or https://tiktok.com/..."
                  className={`w-full px-4 py-2 rounded-lg border ${
                    urlError
                      ? "border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500"
                      : "border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                  } focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400`}
                />
                {urlError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {urlError}
                  </p>
                )}
                {url && !urlError && isValidSupportedUrl(url) && (
                  <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                    ✓{" "}
                    {getPlatformFromUrl(url).charAt(0).toUpperCase() +
                      getPlatformFromUrl(url).slice(1)}{" "}
                    URL detected
                  </p>
                )}
              </div>

              {/* Validation Result */}
              {isValidating && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                      Validating your video meets the bounty requirements...
                    </p>
                  </div>
                </div>
              )}

              {validationResult && (
                <div
                  className={`border rounded-lg p-4 ${
                    validationResult.valid
                      ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        validationResult.valid
                          ? "bg-emerald-100 dark:bg-emerald-900"
                          : "bg-red-100 dark:bg-red-900"
                      }`}
                    >
                      {validationResult.valid ? (
                        <svg
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-red-600 dark:text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          validationResult.valid
                            ? "text-emerald-800 dark:text-emerald-200"
                            : "text-red-800 dark:text-red-200"
                        }`}
                      >
                        {validationResult.valid
                          ? "🎉 Your video is now part of the bounty!"
                          : "❌ Video does not meet requirements"}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          validationResult.valid
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {validationResult.explanation}
                      </p>
                      {validationResult.valid && (
                        <button
                          onClick={() => {
                            setSelectedBounty(null);
                            setUrl("");
                            setValidationResult(null);
                          }}
                          className="mt-3 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors duration-200"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              {!validationResult && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCalculate}
                    disabled={!url || isValidating}
                    className="flex-1 bg-blue-600 dark:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Calculate
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!url || isValidating || !isValidSupportedUrl(url)}
                    className="flex-1 bg-emerald-600 dark:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? "Validating..." : "Submit"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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
