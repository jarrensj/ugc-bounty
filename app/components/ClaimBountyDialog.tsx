"use client";

import { useState, useEffect, useCallback } from "react";
import { Bounty } from "@/app/data/bounties";

interface ClaimBountyDialogProps {
  bounty: Bounty;
  isOpen: boolean;
  onClose: () => void;
}

interface PreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
}

export default function ClaimBountyDialog({ bounty, isOpen, onClose }: ClaimBountyDialogProps) {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{valid: boolean; explanation: string} | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

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

  const fetchPreviewData = useCallback(async (url: string) => {
    if (!url || !isValidSupportedUrl(url)) {
      console.log('Skipping preview fetch - invalid URL:', url);
      setPreviewData(null);
      setPreviewError(null);
      return;
    }

    console.log('Fetching preview data for URL:', url);
    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      const response = await fetch('/api/link-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      console.log('Preview API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Preview API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch preview');
      }

      const data = await response.json();
      console.log('Preview data received:', data);
      setPreviewData(data);
    } catch (error) {
      console.error('Preview fetch error:', error);
      setPreviewError(error instanceof Error ? error.message : 'Failed to load preview');
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // Debounced URL preview fetching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (url && isValidSupportedUrl(url)) {
        fetchPreviewData(url);
      } else {
        setPreviewData(null);
        setPreviewError(null);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [url, fetchPreviewData]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setUrlError(null);
    
    if (newUrl && !isValidSupportedUrl(newUrl)) {
      setUrlError('URL must be from YouTube, Instagram, or TikTok');
    }
  };

  const handleSubmit = async () => {
    if (url && isValidSupportedUrl(url)) {
      const platform = getPlatformFromUrl(url);
      console.log('Submitting bounty for platform:', platform, 'URL:', url);
      
      if (platform === "youtube") {
        setIsValidating(true);
        setValidationResult(null);
        
        try {
          console.log('Calling validate-bounty API with:', { url, requirements: bounty.description });
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

          console.log('Validate bounty API response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Validate bounty API error:', errorData);
            throw new Error(errorData.error || 'Validation failed');
          }

          const result = await response.json();
          console.log('Validation result:', result);
          setValidationResult(result);
        } catch (error) {
          console.error('Validation error:', error);
          setValidationResult({
            valid: false,
            explanation: 'Failed to validate video. Please try again.'
          });
        } finally {
          setIsValidating(false);
        }
      } else {
        // For Instagram and TikTok, show success message directly
        console.log('Non-YouTube platform, showing success message');
        alert(`Submitted!\nBounty: ${bounty.name}\nPlatform: ${platform}\nURL: ${url}`);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setUrl("");
    setValidationResult(null);
    setIsValidating(false);
    setUrlError(null);
    setPreviewData(null);
    setPreviewError(null);
    setIsLoadingPreview(false);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Claim Bounty
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {bounty.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {bounty.description}
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

          {/* URL Preview */}
          {url && isValidSupportedUrl(url) && (
            <div className="mt-4">
              {isLoadingPreview && (
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      Loading preview...
                    </p>
                  </div>
                </div>
              )}

              {previewError && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    ⚠️ Could not load preview: {previewError}
                  </p>
                </div>
              )}

              {previewData && !isLoadingPreview && (
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex gap-4">
                    {previewData.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={previewData.image}
                          alt={previewData.title || 'Preview'}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-2">
                        {previewData.title || 'No title available'}
                      </h4>
                      {previewData.description && (
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 line-clamp-2">
                          {previewData.description}
                        </p>
                      )}
                      <p className="text-slate-500 dark:text-slate-500 text-xs mt-2 truncate">
                        {previewData.url}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                      onClick={handleClose}
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
                onClick={handleSubmit}
                disabled={!url || isValidating || !isValidSupportedUrl(url)}
                className="w-full bg-emerald-600 dark:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Validating...' : 'Submit'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
