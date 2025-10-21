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

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [bounties, setBounties] = useState<Bounty[]>([]);
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
      fetchUserBounties();
    }
  }, [user]);

  const fetchUserBounties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bounties");
      if (response.ok) {
        const data = await response.json();
        // Filter bounties created by the current user
        const userBounties = data.filter(
          (bounty: Bounty) => bounty.creator_id === user?.id
        );
        setBounties(userBounties);
      }
    } catch (error) {
      console.error("Error fetching bounties:", error);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">My Profile</h1>
          <p className="text-gray-700">
            Manage your created bounties
          </p>
        </div>

        {bounties.length === 0 ? (
          <div className="bg-white border border-black p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">
              You haven't created any bounties yet.
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
      </main>
    </div>
  );
}
