import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Eye, Edit3, Trash2, Share2, Copy, Check } from "lucide-react";

interface ActionDropdownProps {
  ticketId: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  ticketId,
  onView,
  onEdit,
  onDelete,
  onShare,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onView?.(ticketId);
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit?.(ticketId);
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onShare?.(ticketId);
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share Ticket</span>
          </button>

          <button
            type="button"
            onClick={handleCopyId}
            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{copied ? "Copied!" : "Copy Ticket ID"}</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete?.(ticketId);
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Delete Ticket</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
