"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { 
  Home, 
  Trophy, 
  Wallet, 
  User,
  Gamepad2,
  Bell,
  Plus,
  Sparkles,
  Zap,
  Crown
} from "lucide-react";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  // Refresh profile when navigating between pages
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [pathname, user]);

  // Show loading until user is confirmed
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/games", icon: Gamepad2, label: "Games" },
    { href: "/my-matches", icon: Trophy, label: "Matches" },
    { href: "/wallet", icon: Wallet, label: "Wallet" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition" />
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight">WARZONE</h1>
              <p className="text-[10px] text-cyan-400 font-medium tracking-widest -mt-0.5">ESPORTS ARENA</p>
            </div>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coins Display */}
            {user && profile && (
              <Link 
                href="/wallet"
                className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition" />
                  <div className="relative h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <span className="text-sm font-bold text-yellow-400">
                  ₹{profile.coins?.toLocaleString() || 0}
                </span>
                <Plus className="w-4 h-4 text-yellow-500/70" />
              </Link>
            )}

            {/* Notifications */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-black animate-pulse" />
            </button>

            {/* Auth Button */}
            {!user && !loading && (
              <Link
                href="/auth"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-16 pb-32 md:pb-6 md:pl-72 min-h-screen">
        {children}
      </main>

      {/* Floating Spin & Win Button */}
      {pathname !== "/spin" && (
        <Link
          href="/spin"
          className="md:hidden fixed bottom-28 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-sm shadow-lg shadow-orange-500/30 animate-bounce hover:scale-105 transition-transform"
        >
          <span className="text-lg">🎰</span>
          <span>Spin & Win!</span>
        </Link>
      )}

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-white/10 safe-bottom">
        <div className="grid grid-cols-5 py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href === "/games" && pathname.startsWith("/tournaments")) ||
              (item.href === "/games" && pathname.startsWith("/games"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center py-1"
              >
                {isActive && (
                  <div className="absolute top-0 w-10 h-0.5 rounded-full bg-cyan-500" />
                )}
                <div className={`p-2 rounded-xl ${isActive ? "bg-cyan-500" : ""}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-zinc-500"}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-cyan-400" : "text-zinc-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-72 bg-zinc-900/50 backdrop-blur-2xl border-r border-white/5 flex-col z-40">
        {/* User Profile Card */}
        {user && profile ? (
          <div className="p-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-zinc-900 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {profile.username || profile.email?.split('@')[0] || 'Player'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-500/70">Balance</p>
                  <p className="text-sm font-bold text-yellow-400">₹{profile.coins?.toLocaleString() || 0}</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-500/70">Wins</p>
                  <p className="text-sm font-bold text-purple-400">{profile.stats?.wins || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : !loading ? (
          <div className="p-4">
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition group"
            >
              <Crown className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition" />
              <span className="font-semibold text-white">Sign In to Play</span>
            </Link>
          </div>
        ) : null}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href === "/games" && pathname.startsWith("/tournaments")) ||
              (item.href === "/games" && pathname.startsWith("/games"));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-gradient-to-r from-cyan-500/15 to-purple-500/15 text-white" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-cyan-400 to-purple-500" />
                )}
                <div className={`p-2 rounded-lg transition-all ${
                  isActive 
                    ? "bg-gradient-to-br from-cyan-500 to-purple-600" 
                    : "bg-white/5 group-hover:bg-white/10"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-zinc-400">LIVE NOW</span>
            </div>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-xs text-zinc-500">Active tournaments</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
