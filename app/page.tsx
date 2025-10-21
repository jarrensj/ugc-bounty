import { bounties } from "./data/bounties";

export default function Home() {

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
