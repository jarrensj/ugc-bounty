import { UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">UGC Bounty</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
        <p className="text-gray-600 mb-4">
          Welcome to UGC Bounty! Companies set bounties for views, and users compete to be first.
        </p>
        <div className="text-sm text-gray-500">
          Clerk authentication is now integrated. Click the user button to sign in/out.
        </div>
      </div>
    </div>
  );
}
