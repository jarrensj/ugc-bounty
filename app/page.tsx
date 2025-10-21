export default function Home() {
  const bounties = [
    {
      id: 1,
      name: "Sushi Hat Challenge",
      totalBounty: 5000,
      ratePer1kViews: 8,
      description: "Make videos with this sushi hat and get views",
    },
    {
      id: 2,
      name: "Gaming Setup Review",
      totalBounty: 3500,
      ratePer1kViews: 5,
      description: "Review our new gaming chair and show it in action during gameplay",
    },
    {
      id: 3,
      name: "Fitness Tracker Unboxing",
      totalBounty: 2000,
      ratePer1kViews: 10,
      description: "Unbox and demonstrate our latest fitness tracker features",
    },
    {
      id: 4,
      name: "Coffee Maker Morning Routine",
      totalBounty: 4200,
      ratePer1kViews: 6,
      description: "Show off our coffee maker in your morning routine videos",
    },
    {
      id: 5,
      name: "Tech Gadget Comparison",
      totalBounty: 6000,
      ratePer1kViews: 12,
      description: "Compare our wireless earbuds with competitors in various scenarios",
    },
    {
      id: 6,
      name: "Travel Backpack Adventure",
      totalBounty: 3800,
      ratePer1kViews: 7,
      description: "Take our travel backpack on your adventures and showcase its features",
    },
  ];

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
                <button className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold py-3 px-6 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors duration-200">
                  Claim Bounty
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
