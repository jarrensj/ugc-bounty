import { UserButton } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { Database } from '@/lib/database.types';
import { bounties } from "./data/bounties";
import Link from "next/link";
import BountyCard from "./components/BountyCard";

type Profile = Database['public']['Tables']['profiles']['Row'];
type SocialAccount = Database['public']['Tables']['social_accounts']['Row'];

export default function Home() {
  const supabase = useSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<string | null>(null);

  const handleClaimBounty = (bountyId: number) => {
    setSelectedBounty(bountyId.toString());
  };

  useEffect(() => {
    if (supabase) {
      // Fetch user profile
      supabase.from('profiles').select('*').single().then(({ data, error }) => {
        if (!error) setProfile(data);
      });

      // Fetch social accounts
      supabase.from('social_accounts').select('*').then(({ data, error }) => {
        if (!error) setSocialAccounts(data || []);
      });
    }
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">UGC Bounty</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Welcome to UGC Bounty!</h2>
            <p className="text-blue-800">
              Companies set bounties for views, and users compete to be first. 
              Clerk authentication and Supabase database are now integrated.
            </p>
          </div>

          {profile && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Your Profile</h3>
              <p className="text-green-800">Username: {profile.username}</p>
              {profile.avatar_url && (
                <p className="text-green-800">Avatar: {profile.avatar_url}</p>
              )}
            </div>
          )}

          {socialAccounts.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Social Accounts</h3>
              <div className="space-y-2">
                {socialAccounts.map((account) => (
                  <div key={account.id} className="text-purple-800">
                    {account.platform}: @{account.handle}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>✅ Clerk authentication integrated</p>
            <p>✅ Supabase database connected</p>
            <p>✅ API routes ready for profiles and social accounts</p>
            <p>✅ Row Level Security policies configured</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bounties.map((bounty) => (
            <div key={bounty.id} className="relative">
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
          </div>
        </div>
      )}
    </div>
  );
}
