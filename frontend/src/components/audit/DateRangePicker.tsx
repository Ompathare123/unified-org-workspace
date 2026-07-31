import React from "react";
import { Calendar, X } from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Start Date */}
      <div className="space-y-1.5 w-full sm:w-44">
        <label className="block text-[11.5px] font-semibold text-slate-600">Start Date</label>
        <div className="relative w-full">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            placeholder="May 17, 2025"
            className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF]"
          />
          {startDate && (
            <button
              type="button"
              onClick={() => onStartDateChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* End Date */}
      <div className="space-y-1.5 w-full sm:w-44">
        <label className="block text-[11.5px] font-semibold text-slate-600">End Date</label>
        <div className="relative w-full">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            placeholder="May 24, 2025"
            className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF]"
          />
          {endDate && (
            <button
              type="button"
              onClick={() => onEndDateChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
