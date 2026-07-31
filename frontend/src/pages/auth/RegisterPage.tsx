import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User as UserIcon, Mail, Lock, Building, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import Logo from "@/components/common/Logo";
import AuthInput from "@/components/common/AuthInput";
import AuthButton from "@/components/common/AuthButton";
import AuthCard from "@/components/common/AuthCard";
import api from "@/lib/api";

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await api.post("/auth/register", {
        fullName,
        email,
        password,
        organizationName: organizationName || undefined,
      });

      // Show success message, then redirect to login after 2.5 seconds
      setSuccess(`Account created successfully! Redirecting you to Sign In…`);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message;
      if (serverMsg === "Email already exists.") {
        setError(`Email ${email} is already registered. Please click 'Sign In' below to log in.`);
      } else {
        setError(serverMsg || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#F0F4FF]">
      <AuthCard>
        <div className="flex flex-col items-center mb-6">
          <Logo size={64} className="mb-3" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Create New Workspace</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Get Started</h1>
          <p className="text-xs text-gray-500">Register user & provision organization workspace</p>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-3.5" onSubmit={handleSubmit}>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <AuthInput
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              leftIcon={<UserIcon className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Work Email</label>
            <AuthInput
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <AuthInput
              type="password"
              placeholder="Create strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Organization Name <span className="text-gray-400 font-normal">(Optional if joining via invite)</span>
            </label>
            <AuthInput
              type="text"
              placeholder="Acme Corp"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
            />
          </div>

          <AuthButton variant="primary" type="submit" disabled={loading || !!success} className="mt-4">
            <span>{loading ? "Creating…" : success ? "Redirecting to Sign In…" : "Create Account & Workspace"}</span>
            {!success && <ArrowRight className="w-4 h-4" />}
          </AuthButton>


          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </AuthCard>
    </div>
  );
};

export default RegisterPage;
