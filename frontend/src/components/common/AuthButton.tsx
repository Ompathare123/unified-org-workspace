import React from "react";
import { cn } from "@/lib/utils";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "google";
  loading?: boolean;
  children: React.ReactNode;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  variant = "primary",
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    "w-full h-[46px] flex items-center justify-center gap-2 rounded-xl font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 select-none cursor-pointer";

  const variantClasses = {
    primary:
      "bg-[#0066FF] hover:bg-[#0052CC] active:bg-[#0040A8] text-white shadow-[0_4px_14px_rgba(0,102,255,0.25)] disabled:opacity-60 disabled:cursor-not-allowed",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs",
    google:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-2xs",
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

export default AuthButton;
