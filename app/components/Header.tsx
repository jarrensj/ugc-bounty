"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bountyName, setBountyName] = useState("");
  const [bountyDescription, setBountyDescription] = useState("");
  const [totalBounty, setTotalBounty] = useState("");
  const [ratePer1k, setRatePer1k] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    if (!user) {
      alert("Please sign in to create a bounty");
      return;
    }
    setShowCreateModal(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBounty = async () => {
    if (bountyName && bountyDescription && totalBounty && ratePer1k) {
      try {
        setIsCreating(true);

        let logoUrl = null;
        if (logoFile) {
          const formData = new FormData();
          formData.append('file', logoFile);
          
          const uploadResponse = await fetch('/api/upload-logo', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            logoUrl = uploadResult.url;
          }
        }

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
            companyName: companyName || null,
            logoUrl: logoUrl,
          }),
        });

        if (response.ok) {
          setBountyName("");
          setBountyDescription("");
          setTotalBounty("");
          setRatePer1k("");
          setCompanyName("");
          setLogoFile(null);
          setLogoPreview(null);
          setShowCreateModal(false);
          
          router.push("/");
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
    <>
      <header className="border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch">
            <Link href="/" className="py-6">
              <h1 className="text-4xl font-bold text-black font-[family-name:var(--font-dancing-script)]">
                Django (UGC Bounty)
              </h1>
              <p className="mt-2 text-gray-700">
                Browse available bounties and start earning today
              </p>
            </Link>
            <div className="flex gap-0">
              <button
                onClick={handleCreateClick}
                className="bg-transparent text-black font-semibold px-12 transition-colors duration-200 border-l border-r border-gray-300 hover:border-b-4 hover:border-b-black hover:cursor-pointer -mr-px"
              >
                Create Bounty
              </button>
              {isLoaded && user ? (
                <>
                  <Link
                    href="/profile"
                    className="bg-transparent text-black font-semibold px-12 transition-colors duration-200 border-l border-r border-gray-300 hover:border-b-4 hover:border-b-black hover:cursor-pointer -mr-px flex items-center"
                  >
                    My Profile
                  </Link>
                  <div className="flex items-center px-6 border-r border-gray-300">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-2 border border-black bg-white text-black file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:font-semibold hover:file:bg-gray-800"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-20 object-contain border border-gray-300"
                    />
                  </div>
                )}
              </div>

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
                  className="w-full bg-black text-white font-semibold py-3 px-6 hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Bounty"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
