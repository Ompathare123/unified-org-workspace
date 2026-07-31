import React from "react";
import { User } from "lucide-react";

export interface Reviewer {
  id: string;
  initials: string;
  name: string;
  bg: string;
  approved: boolean;
}

interface ReviewerAvatarsProps {
  reviewers?: Reviewer[];
}

export const ReviewerAvatars: React.FC<ReviewerAvatarsProps> = ({
  reviewers = [
    { id: "1", initials: "JS", name: "John S.", bg: "bg-[#0066FF]", approved: true },
    { id: "2", initials: "MK", name: "Meera K.", bg: "bg-[#10B981]", approved: true },
    { id: "3", initials: "AR", name: "Alex R.", bg: "bg-[#7C3AED]", approved: false },
  ],
}) => {
  return (
    <div className="flex items-center -space-x-1.5">
      {reviewers.map((rev) => (
        <div
          key={rev.id}
          title={`${rev.name} (${rev.approved ? "Approved" : "Pending"})`}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] ring-2 ring-white shadow-2xs ${
            rev.approved ? rev.bg : "bg-slate-200 text-slate-400"
          }`}
        >
          {rev.approved ? (
            rev.initials
          ) : (
            <User className="w-3 h-3 text-slate-500" />
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewerAvatars;
