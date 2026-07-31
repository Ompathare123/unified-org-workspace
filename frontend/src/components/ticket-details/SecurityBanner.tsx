import React from "react";
import { ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";

export const SecurityBanner: React.FC = () => {
  return (
    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#15803D]">
            Strict Scoping Query Enforced
          </h3>
          <p className="text-xs text-[#166534] mt-0.5">
            All data access validated for tenant isolation. No cross-tenant data exposure.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center text-white">
          <CheckCircle2 className="w-4 h-4 fill-[#16A34A] text-white" />
        </div>
        <button
          type="button"
          onClick={() => alert("Strict scoping details: Tenant isolation active.")}
          className="text-xs font-semibold text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SecurityBanner;
