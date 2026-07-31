import React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-[24px] border border-blue-100/80 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.08)]",
        "w-full max-w-[460px] px-8 py-9 sm:px-9 sm:py-9",
        className
      )}
    >
      {children}
    </div>
  );
};

export default AuthCard;
