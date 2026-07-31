import React from "react";
import ReviewerAvatars from "./ReviewerAvatars";
import type { Reviewer } from "./ReviewerAvatars";


interface ApprovalProgressProps {
  approvedCount: number;
  totalRequired?: number;
  reviewers?: Reviewer[];
}

export const ApprovalProgress: React.FC<ApprovalProgressProps> = ({
  approvedCount = 2,
  totalRequired = 3,
  reviewers,
}) => {
  const percentage = Math.min(100, Math.round((approvedCount / totalRequired) * 100));

  return (
    <div className="w-36 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <ReviewerAvatars reviewers={reviewers} />
        <span className="text-xs font-semibold text-slate-700 font-mono">
          {approvedCount} / {totalRequired}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0066FF] rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ApprovalProgress;
