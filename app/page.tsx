"use client";

import { bounties } from "./data/bounties";
import { useState } from "react";

export default function Home() {
  const [selectedBounty, setSelectedBounty] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{valid: boolean; explanation: string} | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const isValidSupportedUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      return hostname.includes('youtube.com') || 
             hostname.includes('youtu.be') || 
             hostname.includes('instagram.com') || 
             hostname.includes('tiktok.com');
    } catch {
      return false;
    }
  };

  const getPlatformFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
      if (hostname.includes('instagram.com')) return 'instagram';
      if (hostname.includes('tiktok.com')) return 'tiktok';
      return 'unknown';
    } catch {
      return 'unknown';
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setUrlError(null);
    
    if (newUrl && !isValidSupportedUrl(newUrl)) {
      setUrlError('URL must be from YouTube, Instagram, or TikTok');
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
          const response = await fetch('/api/validate-bounty', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: url,
              requirements: bounty.description
            }),
          });

          const result = await response.json();
          setValidationResult(result);
        } catch (error) {
          setValidationResult({
            valid: false,
            explanation: 'Failed to validate video. Please try again.'
          });
        } finally {
          setIsValidating(false);
        }
      } else {
        // For Instagram and TikTok, show success message directly
        alert(`Submitted!\nBounty: ${bounty.name}\nPlatform: ${platform}\nURL: ${url}`);
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
            <div
              key={bounty.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-800 hover:scale-105"
            >
              <div className="p-6">
                {/* Bounty Name */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {bounty.name}
                </h2>

                {/* Total Bounty and Rate */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Total Bounty
                    </span>
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${bounty.totalBounty.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Rate
                    </span>
                    <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                      ${bounty.ratePer1kViews}/1k views
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {bounty.description}
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => handleClaimBounty(bounty.id)}
                  className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold py-3 px-6 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors duration-200"
                >
                  Claim Bounty
                </button>
              </div>
            </div>
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
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Content URL (YouTube, Instagram, or TikTok)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://instagram.com/... or https://tiktok.com/..."
                  className={`w-full px-4 py-2 rounded-lg border ${
                    urlError 
                      ? 'border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500'
                  } focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400`}
                />
                {urlError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{urlError}</p>
                )}
                {url && !urlError && isValidSupportedUrl(url) && (
                  <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                    ✓ {getPlatformFromUrl(url).charAt(0).toUpperCase() + getPlatformFromUrl(url).slice(1)} URL detected
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
                <div className={`border rounded-lg p-4 ${
                  validationResult.valid 
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      validationResult.valid ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {validationResult.valid ? (
                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        validationResult.valid 
                          ? 'text-emerald-800 dark:text-emerald-200' 
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {validationResult.valid 
                          ? '🎉 Your video is now part of the bounty!' 
                          : '❌ Video does not meet requirements'
                        }
                      </p>
                      <p className={`text-sm mt-1 ${
                        validationResult.valid 
                          ? 'text-emerald-700 dark:text-emerald-300' 
                          : 'text-red-700 dark:text-red-300'
                      }`}>
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
                    {isValidating ? 'Validating...' : 'Submit'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
