import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import axios from "axios";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPass,
      });
      const {
        user,
        accessToken,
        memberships,
        supabaseAccessToken,
        supabaseRefreshToken,
      } = res.data.data;
      if (supabaseAccessToken && supabaseRefreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: supabaseAccessToken,
          refresh_token: supabaseRefreshToken,
        });
        if (sessionError) throw sessionError;
      }
      setAuth({ user, accessToken, memberships });
      const targetRoute =
        memberships?.[0]?.role === "salesperson"
          ? "/my-pipeline"
          : memberships?.[0]?.role === "manager"
            ? "/team-pipeline"
            : "/owner-overview";
      navigate(targetRoute);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            (err.response
              ? "Login request failed. Please try again."
              : "Cannot reach the login server. Please check that the API is running."),
        );
      } else {
        console.error("Unable to initialize the authenticated session:", err);
        setError(
          "Login succeeded, but the session could not be initialized. Please refresh and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="w-full max-w-5xl mx-4 my-8 bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] rounded-2xl shadow-modal overflow-hidden grid grid-cols-1 lg:grid-cols-12 text-white relative animate-scale-in">
      {/* ── LEFT 50% (6 cols): Real Cinematic Automotive Visual ── */}
      <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-[640px] flex flex-col justify-between p-6 sm:p-10 overflow-hidden bg-black">
        {/* Real Dealership Showroom Photography */}
        <img
          src="/images/showroom-hero.jpg"
          alt="Luxury Dealership Showroom"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] contrast-110 scale-105"
        />

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0D0D]/90 hidden lg:block pointer-events-none" />

        {/* Top Branding Pill */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[rgba(212,175,55,0.35)] shadow-gold-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-xs font-bold text-[#E6C85C] tracking-wide">
              Independent Dealership Platform
            </span>
          </div>
        </div>

        {/* Bottom Hero Content & Real Vehicle Pill */}
        <div className="relative z-10 space-y-4 pt-8 lg:pt-0">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight leading-tight">
              Turn More Leads Into{" "}
              <span className="gold-gradient-text">Closed Deals.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#B8B8B8] leading-relaxed max-w-md font-normal">
              Every Lead. Every Conversation. Every Follow-Up. One simple,
              ultra-fast automotive CRM.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT 50% (6 cols): Sleek Dark Authentication Workspace ── */}
      <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between bg-[#0E0E0E] relative">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9F7C22] via-[#D4AF37] to-[#F0D879] p-[1px] shadow-gold-sm">
                <div className="w-full h-full bg-[#0D0D0D] rounded-[11px] flex items-center justify-center">
                  <Car className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-display tracking-tight">
                  DealerOS CRM
                </h1>
                <p className="text-[11px] text-[#B8B8B8]">
                  Dealership Staff Portal
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="text-xs font-semibold text-[#D4AF37] hover:underline"
            >
              ← Back to Site
            </Link>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-900/20 border border-red-500/40 text-red-300 rounded-lg flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#B8B8B8] uppercase tracking-wider mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D7D7D]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sales@dealership.com"
                  className="crm-input pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-[#B8B8B8] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#E6C85C] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D7D7D]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="crm-input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-bold shadow-gold-sm mt-2"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In to Dealership</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#B8B8B8]">
          <span>
            Need an account?{" "}
            <Link
              to="/register"
              className="font-bold text-[#E6C85C] hover:underline"
            >
              Start Free Trial
            </Link>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#22C55E]">
            <ShieldCheck className="w-3.5 h-3.5" />
            256-bit SSL Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
