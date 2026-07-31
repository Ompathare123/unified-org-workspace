import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Flag, ChevronDown, Check } from "lucide-react";

interface TicketHeaderProps {
  ticketId?: string;
  title?: string;
  status?: string;
  featureFlagName?: string;
}

export const TicketHeader: React.FC<TicketHeaderProps> = ({
  ticketId = "TCK-1092",
  title = "Ticket TCK-1092: BOLA Verification for External Partner API Access",
  status = "Open",
  featureFlagName = "High-Priority SLA: True",
}) => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [copied, setCopied] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/tickets" className="hover:text-slate-800 transition-colors">
          Support Hub
        </Link>
        <span>&gt;</span>
        <Link to="/tickets" className="hover:text-slate-800 transition-colors">
          Tickets
        </Link>
        <span>&gt;</span>
        <span className="text-slate-800 font-semibold">{ticketId}</span>
      </nav>

      {/* Main Title Row with Back Button */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => navigate("/tickets")}
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 shadow-2xs transition-colors cursor-pointer mt-0.5"
          aria-label="Back to tickets"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>

        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight leading-tight">
              {title}
            </h1>
            <button
              type="button"
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Copy Ticket ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Badges Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Dropdown Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusMenu((v) => !v)}
                className="px-3 py-1 rounded-lg bg-[#EBF3FF] border border-[#D5E5FF] text-[#0066FF] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#DCEBFF] transition-colors cursor-pointer"
              >
                <span>{currentStatus}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#0066FF]" />
              </button>

              {showStatusMenu && (
                <div className="absolute left-0 mt-1 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50">
                  {["Open", "In Progress", "Resolved", "Closed"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setCurrentStatus(st);
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Feature Flag Badge */}
            <div className="px-3 py-1 rounded-lg bg-[#FFEDED] border border-[#FECDD3] text-[#E11D48] text-xs font-semibold flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 fill-[#E11D48] text-[#E11D48]" />
              <span>Feature Flag: {featureFlagName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketHeader;
