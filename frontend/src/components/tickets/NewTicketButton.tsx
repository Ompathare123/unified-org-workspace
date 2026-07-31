import React from "react";
import { PlusCircle } from "lucide-react";

interface NewTicketButtonProps {
  onClick?: () => void;
}

export const NewTicketButton: React.FC<NewTicketButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#0040A8] text-white text-sm font-semibold shadow-[0_2px_8px_rgba(0,102,255,0.25)] transition-all cursor-pointer"
    >
      <PlusCircle className="w-4.5 h-4.5 text-white stroke-[2.2]" />
      <span>New Ticket</span>
    </button>
  );
};

export default NewTicketButton;
