import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  error?: string;
  isFocused?: boolean;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ leftIcon, rightIcon, onRightIconClick, error, className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10 flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-[46px] rounded-xl border border-slate-200 bg-white",
            "text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-normal",
            "outline-none transition-all duration-200",
            "focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/15",
            leftIcon ? "pl-10" : "pl-3.5",
            rightIcon ? "pr-10" : "pr-3.5",
            error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
