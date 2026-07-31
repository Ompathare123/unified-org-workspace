import React from "react";
import { Globe } from "lucide-react";

interface PartnerBannerProps {
  partnerOrgName?: string;
}

export const PartnerBanner: React.FC<PartnerBannerProps> = ({
  partnerOrgName = "Globex",
}) => {
  return (
    <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-4 sm:p-5 flex items-start gap-4">
      <div className="w-9 h-9 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
        <Globe className="w-5 h-5 text-[#7C3AED]" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#5B21B6]">
          Shared from Partner Org: {partnerOrgName}
        </h3>
        <p className="text-xs text-[#6D28D9] mt-0.5">
          This ticket was created in {partnerOrgName} and is visible to you based on partner access policy.
        </p>
      </div>
    </div>
  );
};

export default PartnerBanner;
