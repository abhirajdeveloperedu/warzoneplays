"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import Link from "next/link";
import { 
  User, Trophy, Target, Award, LogOut, Settings, ChevronRight, 
  Gamepad2, Shield, Zap, Mail, Coins, Edit2, Camera, Check, X,
  TrendingUp, Calendar, Crown, Plus, Trash2
} from "lucide-react";

type Game = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

type GameAccount = {
  id: string;
  game_name: string;
  in_game_id: string;
  nickname: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signOut, refreshProfile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    total_matches: 0,
    total_wins: 0,
    total_earnings: 0,
    win_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Game accounts
  const [games, setGames] = useState<Game[]>([]);
  const [gameAccounts, setGameAccounts] = useState<GameAccount[]>([]);
  const [showAddGame, setShowAddGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");
  const [inGameName, setInGameName] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [savingGame, setSavingGame] = useState(false);

  // Load data on mount and navigation
  useEffect(() => {
    if (user) {
      loadStats();
      loadGames();
      loadGameAccounts();
      setUsername(profile?.username || "");
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, profile, pathname]);
  
  async function loadGames() {
    const { data } = await supabase
      .from("games")
      .select("id, name, slug, image_url")
      .eq("is_active", true)
      .order("sort_order");
    if (data) setGames(data);
  }
  
  async function loadGameAccounts() {
    if (!user) return;
    const { data } = await supabase
      .from("game_accounts")
      .select("*")
      .eq("user_id", user.id);
    if (data) {
      setGameAccounts(data.map(acc => ({
        id: acc.id,
        game_name: acc.game_name || "",
        in_game_id: acc.in_game_id || "",
        nickname: acc.nickname || "",
      })));
    }
  }
  
  async function handleAddGameAccount() {
    if (!user || !inGameName) return;
    setSavingGame(true);
    try {
      const { error } = await supabase
        .from("game_accounts")
        .insert({
          user_id: user.id,
          game_name: "Universal", // No game-specific IDs, works for all games
          in_game_id: inGameName,
          nickname: gameUid || null,
        });
      if (error) {
        console.error("Error saving game account:", error);
        alert("Failed to save. Please try again.");
      } else {
        await loadGameAccounts();
        setShowAddGame(false);
        setInGameName("");
        setGameUid("");
      }
    } finally {
      setSavingGame(false);
    }
  }
  
  async function handleDeleteGameAccount(id: string) {
    const { error } = await supabase
      .from("game_accounts")
      .delete()
      .eq("id", id);
    if (!error) loadGameAccounts();
  }

  async function loadStats() {
    if (!user) return;
    setLoading(true);
    try {
      // Get tournament count
      const { count: matchCount } = await supabase
        .from("tournament_registrations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get wins and earnings from results
      const { data: results } = await supabase
        .from("tournament_results")
        .select("position, prize_amount")
        .eq("user_id", user.id);

      const wins = results?.filter(r => r.position === 1).length || 0;
      const earnings = results?.reduce((sum, r) => sum + (r.prize_amount || 0), 0) || 0;
      const winRate = matchCount && matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0;

      setStats({
        total_matches: matchCount || 0,
        total_wins: wins,
        total_earnings: earnings,
        win_rate: winRate
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ username: username || null })
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      setEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `avatars/${user.id}-${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from("tournament-images")
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("tournament-images").getPublicUrl(fileName);
      
      await supabase
        .from("users")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      await refreshProfile();
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Failed to upload avatar");
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/auth");
  }

  if (!user && !authLoading) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6">
            <User className="w-10 h-10 text-zinc-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sign in to view profile</h2>
          <p className="text-sm text-zinc-400 text-center mb-6">
            Track your stats, earnings, and match history
          </p>
          <Link
            href="/auth"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:scale-105 transition-transform"
          >
            Sign In
          </Link>
        </div>
      </MobileLayout>
    );
  }

  if (loading || authLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-10 w-10 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen p-4">
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 p-6 mb-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
          
          <div className="relative flex items-start gap-4 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-cyan-500 border-2 border-zinc-900 flex items-center justify-center hover:bg-cyan-400 transition"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold"
                    >
                      <Check className="w-3 h-3" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setUsername(profile?.username || ""); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-700 text-white text-xs font-semibold"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white truncate">
                      {profile?.username || profile?.email?.split('@')[0] || 'Player'}
                    </h1>
                    <button onClick={() => setEditing(true)} className="p-1 rounded-lg hover:bg-white/10">
                      <Edit2 className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                  <p className="text-sm text-zinc-400 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" />
                    {profile?.email || user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                      PLAYER
                    </span>
                    {stats.total_wins > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> {stats.total_wins} WINS
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Balance Card */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-500/70 uppercase tracking-wider mb-1">Wallet Balance</p>
                <p className="text-3xl font-bold text-yellow-400">₹{profile?.coins?.toLocaleString() || 0}</p>
              </div>
              <Link 
                href="/wallet"
                className="px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/30 transition"
              >
                Add Money
              </Link>
            </div>
          </div>
        </div>


        {/* Menu Options */}
        <div className="space-y-2 mb-6">
          <Link href="/my-matches" className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-cyan-500/30 transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="font-medium text-white">My Matches</span>
                <p className="text-xs text-zinc-500">View your tournament history</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-500" />
          </Link>
          
          <Link href="/wallet" className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-cyan-500/30 transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <span className="font-medium text-white">Wallet</span>
                <p className="text-xs text-zinc-500">Manage your coins & transactions</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-500" />
          </Link>
        </div>

        {/* Game IDs Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              Game IDs
            </h3>
            <button
              onClick={() => setShowAddGame(true)}
              className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
            >
              <Plus className="w-3 h-3" /> Add Game
            </button>
          </div>
          
          {/* Add Game Form */}
          {showAddGame && (
            <div className="mb-4 p-4 rounded-xl bg-zinc-900/80 border border-cyan-500/30">
              <h4 className="text-sm font-semibold text-white mb-3">Add Game Account</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">In-Game ID / UID *</label>
                  <input
                    type="text"
                    value={inGameName}
                    onChange={(e) => setInGameName(e.target.value)}
                    placeholder="Your game UID or player ID"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Nickname (Optional)</label>
                  <input
                    type="text"
                    value={gameUid}
                    onChange={(e) => setGameUid(e.target.value)}
                    placeholder="Your in-game display name"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddGameAccount}
                    disabled={!inGameName || savingGame}
                    className="flex-1 py-2 rounded-lg bg-cyan-500 text-black font-semibold text-sm disabled:opacity-50"
                  >
                    {savingGame ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => { setShowAddGame(false); setInGameName(""); setGameUid(""); }}
                    className="px-4 py-2 rounded-lg bg-zinc-700 text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Game Accounts List */}
          {gameAccounts.length === 0 && !showAddGame ? (
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <Gamepad2 className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-400">No game IDs added yet</p>
              <p className="text-xs text-zinc-500 mt-1">Add your game IDs to join tournaments</p>
            </div>
          ) : (
            <div className="space-y-2">
              {gameAccounts.map(account => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{account.game_name}</p>
                      <p className="text-xs text-zinc-400">
                        {account.in_game_id}
                        {account.nickname && <span className="text-zinc-500"> • {account.nickname}</span>}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGameAccount(account.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>

        {/* Member Since */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
        </p>
      </div>
    </MobileLayout>
  );
}
