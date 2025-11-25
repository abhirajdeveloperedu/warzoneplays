"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../providers";
import { 
  Gamepad2, 
  Trophy, 
  Zap, 
  Shield, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Target
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Floating particles animation
  const [particles] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }))
  );

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || "Invalid credentials");
        } else {
          router.push("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message || "Failed to create account");
        } else {
          setSuccess("Account created! Check your email to verify.");
          setIsLogin(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <Gamepad2 className="absolute inset-0 m-auto h-6 w-6 text-cyan-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Welcome back!</h2>
          <p className="text-zinc-400 text-sm">{user.email}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:scale-105 transition-transform"
            >
              Enter Arena
            </Link>
            <button
              onClick={signOut}
              className="px-6 py-2.5 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0f172a,#000)] z-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-cyan-500/30 animate-float"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
        
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "4s" }} />
      </div>

      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12">
        <div className="max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-cyan-500 rounded-2xl blur-lg opacity-50 animate-pulse" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                <Gamepad2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">WARZONE</h1>
              <p className="text-cyan-400 text-sm font-medium tracking-widest">ESPORTS ARENA</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white leading-tight">
              Play. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Compete.</span>
              <br />Win Big.
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Join millions of players competing in daily tournaments. Real prizes, real glory.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-white">₹50L+</p>
              <p className="text-xs text-zinc-500">Daily Prizes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-white">100K+</p>
              <p className="text-xs text-zinc-500">Active Players</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-xs text-zinc-500">Live Matches</p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-xs text-zinc-400">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-zinc-400">Instant Withdrawals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 via-purple-500 to-cyan-500 flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">WARZONE</h1>
              <p className="text-cyan-400 text-xs font-medium tracking-widest">ESPORTS ARENA</p>
            </div>
          </div>

          {/* Auth Card */}
          <div className="relative">
            {/* Card glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-red-500/20 rounded-3xl blur-xl" />
            
            <div className="relative bg-zinc-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isLogin ? "Welcome Back, Warrior!" : "Join the Arena"}
                </h2>
                <p className="text-zinc-400 text-sm">
                  {isLogin ? "Sign in to continue your journey" : "Create your account and start winning"}
                </p>
              </div>

              {/* Toggle */}
              <div className="flex bg-black/40 rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isLogin 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    !isLogin 
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="warrior@warzone.gg"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Sign Up only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Error/Success Messages */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                    {success}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="relative w-full group"
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${isLogin ? "from-cyan-500 to-blue-600" : "from-purple-500 to-pink-600"} blur-lg opacity-50 group-hover:opacity-75 transition`} />
                  <div className={`relative flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r ${isLogin ? "from-cyan-500 to-blue-600" : "from-purple-500 to-pink-600"} text-white font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:hover:scale-100`}>
                    {submitting ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? "Enter the Arena" : "Create Account"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Terms */}
              <p className="mt-6 text-center text-xs text-zinc-500">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-cyan-400 hover:underline">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
