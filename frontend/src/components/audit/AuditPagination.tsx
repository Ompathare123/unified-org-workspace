import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface AuditPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const AuditPagination: React.FC<AuditPaginationProps> = ({
  currentPage = 1,
  totalPages = 422,
  pageSize = 20,
  totalItems = 8432,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white">
      {/* Left: Item Counter Text */}
      <span className="text-xs text-slate-500 font-normal">
        Showing <strong className="font-semibold text-slate-700">{startItem}</strong> to{" "}
        <strong className="font-semibold text-slate-700">{endItem}</strong> of{" "}
        <strong className="font-semibold text-slate-700">{totalItems.toLocaleString()}</strong> audit events
      </span>

      {/* Right: Page Navigation & Page Size Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[1, 2, 3, 4, 5].map((pg) => (
            <button
              key={pg}
              type="button"
              onClick={() => onPageChange(pg)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === pg
                  ? "bg-[#0066FF] text-white shadow-2xs"
                  : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              {pg}
            </button>
          ))}

          {/* Ellipsis */}
          <span className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">...</span>

          {/* Last Page Number */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === totalPages
                ? "bg-[#0066FF] text-white shadow-2xs"
                : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            {totalPages}
          </button>

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Page Size Selector */}
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
          >
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default AuditPagination;
