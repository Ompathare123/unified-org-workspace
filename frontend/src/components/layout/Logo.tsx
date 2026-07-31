import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Hexagonal Blue Logo */}
      <div className="w-9 h-9 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 80 80" fill="none" className="w-9 h-9">
          <defs>
            <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#0044CC" />
            </linearGradient>
          </defs>
          <path
            d="M40 5 L72 23.5 V56.5 L40 75 L8 56.5 V23.5 Z"
            stroke="url(#navLogoGrad)"
            strokeWidth="4.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M48 26.5 C48 26.5 44 23 39 23 C33.5 23 29.5 26.5 29.5 31.5 C29.5 36 33 38.5 39 40.5 C45 42.5 48.5 45 48.5 49.5 C48.5 54.5 44.5 57.5 39 57.5 C34 57.5 29.5 54 29.5 54"
            stroke="url(#navLogoGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Brand Text & Subtitle */}
      <div className="flex flex-col">
        <span className="text-[17px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
          Froncort.AI
        </span>
        <span className="text-[11px] font-medium text-[#64748B] tracking-normal leading-tight">
          Unified Org Workspace
        </span>
      </div>
    </div>
  );
};

export default Logo;
