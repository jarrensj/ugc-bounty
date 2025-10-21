"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Bounty {
  id: number;
  name: string;
  description: string;
  total_bounty: number;
  rate_per_1k_views: number;
  claimed_bounty: number;
  creator_id: string | null;
  created_at: string;
}

interface Submission {
  id: number;
  bounty_id: number;
  user_id: string;
  video_url: string;
  view_count: number;
  earned_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  validation_explanation: string | null;
  created_at: string;
  bounties?: {
    id: number;
    name: string;
    rate_per_1k_views: number;
  };
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'bounties' | 'submissions'>('bounties');
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBounty, setEditingBounty] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's created bounties
      const bountiesResponse = await fetch("/api/bounties");
      if (bountiesResponse.ok) {
        const bountiesData = await bountiesResponse.json();
        const userBounties = bountiesData.filter(
          (bounty: Bounty) => bounty.creator_id === user?.id
        );
        setBounties(userBounties);
      }

      // Fetch user's submissions
      const submissionsResponse = await fetch("/api/submissions");
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (bounty: Bounty) => {
    setEditingBounty(bounty.id);
    setEditName(bounty.name);
    setEditDescription(bounty.description);
  };

  const handleCancelEdit = () => {
    setEditingBounty(null);
    setEditName("");
    setEditDescription("");
  };

  const handleSaveEdit = async (bountyId: number) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/bounties", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bountyId,
          name: editName,
          description: editDescription,
        }),
      });

      if (response.ok) {
        const updatedBounty = await response.json();
        // Update the bounties list with the updated bounty
        setBounties(
          bounties.map((b) =>
            b.id === bountyId
              ? { ...b, name: updatedBounty.name, description: updatedBounty.description }
              : b
          )
        );
        setEditingBounty(null);
        setEditName("");
        setEditDescription("");
      } else {
        const error = await response.json();
        alert(`Failed to update bounty: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating bounty:", error);
      alert("Failed to update bounty. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }


  if (!user) {
    return null;
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const calculateEarnings = (viewCount: number, ratePer1kViews: number): number => {
    return (viewCount / 1000) * ratePer1kViews;
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">My Profile</h1>
          <p className="text-gray-700">
            Manage your bounties and submissions
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('bounties')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'bounties'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              My Bounties ({bounties.length})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              My Submissions ({submissions.length})
            </button>
          </div>
        </div>

        {/* Bounties Tab */}
        {activeTab === 'bounties' && (
          <>
            {bounties.length === 0 ? (
              <div className="bg-white border border-black p-8 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  You haven&apos;t created any bounties yet.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-black text-white px-6 py-2 font-semibold hover:bg-gray-800 transition-colors"
                >
                  Create Your First Bounty
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bounties.map((bounty) => (
                  <div
                    key={bounty.id}
                    className="bg-white border border-black p-6"
                  >
                    {editingBounty === bounty.id ? (
                      // Edit mode
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bounty Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-2 border border-black bg-white text-black focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-black bg-white text-black focus:outline-none focus:border-black resize-none"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="px-4 py-2 border border-black text-black hover:bg-gray-100 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(bounty.id)}
                            disabled={isSaving || !editName || !editDescription}
                            className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-black mb-2">
                              {bounty.name}
                            </h2>
                            <p className="text-gray-700 mb-4">
                              {bounty.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleEditClick(bounty)}
                            className="ml-4 px-4 py-2 border border-black text-black hover:bg-gray-100 transition-colors whitespace-nowrap"
                          >
                            Edit Details
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-300">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Total Bounty
                            </p>
                            <p className="text-lg font-semibold text-black">
                              ${bounty.total_bounty.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Rate per 1k Views
                            </p>
                            <p className="text-lg font-semibold text-black">
                              ${bounty.rate_per_1k_views.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Claimed Bounty
                            </p>
                            <p className="text-lg font-semibold text-black">
                              ${bounty.claimed_bounty.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Remaining
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              ${(bounty.total_bounty - bounty.claimed_bounty).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <Link
                            href={`/bounty/${bounty.id}`}
                            className="text-black hover:underline font-medium"
                          >
                            View Bounty Details →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <>
            {submissions.length === 0 ? (
              <div className="bg-white border border-black p-8 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  You haven&apos;t submitted to any bounties yet.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-black text-white px-6 py-2 font-semibold hover:bg-gray-800 transition-colors"
                >
                  Browse Bounties
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-white border border-black p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-black mb-2">
                          {submission.bounties?.name || 'Bounty'}
                        </h3>
                        <a
                          href={submission.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all"
                        >
                          {submission.video_url}
                        </a>
                      </div>
                      <span
                        className={`px-3 py-1 border text-sm font-semibold uppercase ${getStatusBadgeClass(
                          submission.status
                        )}`}
                      >
                        {submission.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-300">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Views</p>
                        <p className="text-lg font-semibold text-black">
                          {submission.view_count.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Earned</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${calculateEarnings(submission.view_count, submission.bounties?.rate_per_1k_views || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Submitted
                        </p>
                        <p className="text-sm text-black">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Submitted: {new Date(submission.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {submission.validation_explanation && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="text-sm text-gray-600 mb-1">Note:</p>
                        <p className="text-black">{submission.validation_explanation}</p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <Link
                        href={`/bounty/${submission.bounty_id}`}
                        className="text-black hover:underline font-medium"
                      >
                        View Bounty Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}