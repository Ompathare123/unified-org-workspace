import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import Logo from "@/components/common/Logo";
import AuthInput from "@/components/common/AuthInput";
import AuthButton from "@/components/common/AuthButton";
import AuthCard from "@/components/common/AuthCard";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

/* ── Google "G" 4-color icon ─────────────────────────────────────── */
const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

/* ── Dotted matrix pattern ───────────────────────────────────────── */
const DottedGrid: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none">
    {Array.from({ length: 7 }).map((_, row) =>
      Array.from({ length: 8 }).map((_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={col * 14 + 7}
          cy={row * 14 + 7}
          r="1.5"
          fill="#A5C7F9"
        />
      ))
    )}
  </svg>
);

/* ── Decorative Background Waves & Gradients ─────────────────────── */
const AuthBackground: React.FC = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#F5F8FE] via-[#EDF4FF] to-[#E6F0FF]">
    {/* Soft ambient gradient glow */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-60"
      style={{
        background: "radial-gradient(circle, #E0ECFF 0%, #F0F6FF 50%, transparent 80%)",
        filter: "blur(80px)",
      }}
    />

    {/* Left-side flowing ribbon waves */}
    <svg
      className="absolute top-0 left-0 h-full w-[45%] pointer-events-none opacity-65"
      viewBox="0 0 500 800"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d="M-100 800 C 140 720, 220 460, 60 300 C -40 160, 120 40, 240 -50 L -100 -50 Z"
        fill="url(#leftGrad1)"
      />
      <path
        d="M-100 800 C 180 660, 270 410, 110 240 C 0 90, 160 20, 300 -50 L -100 -50 Z"
        fill="url(#leftGrad2)"
      />
      <defs>
        <linearGradient id="leftGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="leftGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.0" />
        </linearGradient>
      </defs>
    </svg>

    {/* Right-side curved thin line waves */}
    <svg
      className="absolute top-0 right-0 h-full w-[50%] pointer-events-none opacity-60"
      viewBox="0 0 600 800"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d="M 600 -50 C 350 180, 220 450, 420 680 C 520 780, 600 850, 600 850"
        stroke="#BFDBFE"
        strokeWidth="1.75"
      />
      <path
        d="M 600 20 C 380 230, 260 490, 460 720"
        stroke="#93C5FD"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <path
        d="M 600 -120 C 300 130, 180 400, 380 640 C 480 740, 600 850, 600 850"
        stroke="#DBEAFE"
        strokeWidth="2.5"
      />
    </svg>

    {/* Top-left dotted pattern */}
    <DottedGrid className="absolute top-12 left-12 opacity-35" />

    {/* Bottom-right dotted pattern */}
    <DottedGrid className="absolute bottom-12 right-12 opacity-35" />
  </div>
);

/* ── Login Page Component ────────────────────────────────────────── */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null);


  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user, organizations } = res.data;
      login(token, user, organizations || []);
      
      if (user.hasPendingInvitations) {
        navigate("/invitations");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 selection:bg-blue-100 selection:text-blue-700">
      <AuthBackground />

      <AuthCard className="my-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <Logo size={68} className="mb-4" />

          {/* Unified Identity Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200/80 bg-[#EBF3FF] shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0066FF]" strokeWidth={2.2} />
            <span className="text-[12px] font-semibold text-[#0066FF] tracking-wide">
              Unified Identity Service
            </span>
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6">
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight leading-[1.2]">
            Sign in to your
            <br />
            Unified Workspace
          </h1>
          <p className="text-[13.5px] text-[#64748B] font-normal mt-2">
            Access Support Hub and Review Console.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[13px] font-semibold text-[#334155]">
              Email address
            </label>
            <AuthInput
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              required
              className={focusedInput === "email" ? "border-[#0066FF] shadow-[0_0_0_3.5px_rgba(0,102,255,0.12)]" : ""}
              leftIcon={<Mail className={`w-4 h-4 ${focusedInput === "email" ? "text-[#0066FF]" : "text-[#64748B]"}`} />}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-[13px] font-semibold text-[#334155]">
              Password
            </label>
            <AuthInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              required
              className={focusedInput === "password" ? "border-[#0066FF] shadow-[0_0_0_3.5px_rgba(0,102,255,0.12)]" : ""}
              leftIcon={<Lock className={`w-4 h-4 ${focusedInput === "password" ? "text-[#0066FF]" : "text-[#64748B]"}`} />}
              rightIcon={
                showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <Eye className="w-4 h-4 text-[#64748B]" />
                )
              }
              onRightIconClick={() => setShowPassword((v) => !v)}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              className="text-[12.5px] font-semibold text-[#0066FF] hover:underline transition-all"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Primary Button */}
          <AuthButton variant="primary" type="submit" disabled={loading} className="mt-2">
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </AuthButton>

          {/* Or Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-[12px] text-[#94A3B8] font-medium">or</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* Google Sign In Button */}
          <AuthButton variant="google" type="button">
            <GoogleIcon />
            <span className="font-semibold text-[#334155] text-xs sm:text-sm">Sign in with Google</span>
          </AuthButton>

          {/* Register Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#64748B]">
              Don't have an organization account?{" "}
              <Link to="/register" className="font-semibold text-[#0066FF] hover:underline">
                Create Organization
              </Link>
            </p>
          </div>
        </form>
      </AuthCard>

      {/* Footer */}
      <footer className="mt-7 flex flex-col items-center gap-1 text-center">
        <p className="text-[13px] text-[#64748B] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#64748B]" strokeWidth={2} />
          <span>
            Powered by{" "}
            <span className="text-[#0066FF] font-bold">Froncort.AI</span>{" "}
            Identity Layer.
          </span>
        </p>
        <p className="text-[11.5px] text-[#94A3B8] font-medium tracking-wide">
          Secure &nbsp;•&nbsp; Reliable &nbsp;•&nbsp; Unified
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
