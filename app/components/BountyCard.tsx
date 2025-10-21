import { Bounty } from "../data/bounties";

interface BountyCardProps {
  bounty: Bounty;
  onClaim: (e: React.MouseEvent) => void;
  isOwner?: boolean;
}

export default function BountyCard({
  bounty,
  onClaim,
  isOwner = false,
}: BountyCardProps) {
  // Use calculated progress percentage if available, otherwise calculate from claimedBounty
  const progressPercentage =
    bounty.progressPercentage !== undefined
      ? bounty.progressPercentage
      : (bounty.claimedBounty / bounty.totalBounty) * 100;

  const remainingBounty = bounty.totalBounty - bounty.claimedBounty;

  return (
    <div className="group transition-all duration-300 overflow-hidden border border-gray-300 hover:border-black flex flex-col h-[400px]">
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-2xl font-bold text-black mb-3">{bounty.name}</h2>

        {/* Total Bounty and Rate */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-black">Total Bounty</span>
            <span className="text-3xl font-bold text-black">
              ${bounty.totalBounty.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-black">Rate</span>
            <span className="text-xl font-semibold text-black">
              ${bounty.ratePer1kViews}/1k views
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-black">Progress</span>
            <span className="text-sm text-gray-700">
              {bounty.isCompleted
                ? "$0 remaining"
                : `$${remainingBounty.toLocaleString()} remaining`}
            </span>
          </div>
          <div className="w-full border border-black h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                bounty.isCompleted ? "bg-green-500" : "bg-black"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-700">
              ${bounty.claimedBounty.toLocaleString()} claimed
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          {bounty.totalSubmissionViews !== undefined &&
            bounty.totalSubmissionViews > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                {bounty.totalSubmissionViews.toLocaleString()} total views from
                submissions
              </div>
            )}
        </div>

        {/* Description */}
        <p className="text-black flex-grow line-clamp-2">
          {bounty.description}
        </p>

        {/* Submitter Info */}
        {bounty.submittedBy && (
          <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Submitted by:</span>
              <span className="font-medium text-black">
                {bounty.submittedBy.username ||
                  bounty.submittedBy.email ||
                  `User ${bounty.submittedBy.userId}`}
              </span>
            </div>
            {bounty.createdAt && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-600">
                  {new Date(bounty.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTA Button - Only show if not owner */}
        {!isOwner ? (
          bounty.isCompleted ? (
            <div className="w-full border border-green-500 bg-green-50 text-green-700 font-semibold py-3 px-6 text-center mt-auto">
              Bounty Completed
            </div>
          ) : (
            <button
              onClick={onClaim}
              className="w-full border border-black bg-transparent text-black font-semibold py-3 px-6 group-hover:bg-black group-hover:text-white transition-colors duration-200 mt-auto"
            >
              Submit for this Bounty
            </button>
          )
        ) : (
          <div className="w-full border border-gray-300 bg-gray-50 text-gray-500 font-semibold py-3 px-6 flex items-center justify-center gap-2 mt-auto">
            {bounty.logoUrl && (
              <img
                src={bounty.logoUrl}
                alt={bounty.companyName || "Company logo"}
                className="h-5 w-5 object-contain"
              />
            )}
            <span>
              {bounty.companyName
                ? `${bounty.companyName}'s Bounty`
                : "Your Bounty"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
