import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 72, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#0044CC" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon with smooth rounded joints */}
        <path
          d="M40 5 L72 23.5 V56.5 L40 75 L8 56.5 V23.5 Z"
          stroke="url(#blueGrad)"
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* Inner Interlocking S Loop */}
        <path
          d="M48 26.5 C48 26.5 44 23 39 23 C33.5 23 29.5 26.5 29.5 31.5 C29.5 36 33 38.5 39 40.5 C45 42.5 48.5 45 48.5 49.5 C48.5 54.5 44.5 57.5 39 57.5 C34 57.5 29.5 54 29.5 54"
          stroke="url(#blueGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default Logo;
