"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../providers";
import { getGameVisuals } from "@/lib/gameVisuals";
import { supabase } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Target, 
  MapPin, 
  Shield,
  Award,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Gamepad2,
  ChevronRight,
  Zap,
  Timer,
  Info,
  Plus,
  Wallet,
  X
} from "lucide-react";

type GameAccount = {
  id: string;
  game_name: string;
  in_game_id: string;
  nickname: string;
};

type Tournament = {
  id: string;
  title: string;
  game: string;
  mode?: string;
  map?: string;
  region?: string;
  status?: string;
  entry_fee?: number;
  prize_pool?: number;
  per_kill_coins?: number;
  prize_distribution?: any;
  description?: string;
  rules?: string;
  start_time?: any;
  registration_ends_at?: any;
  room_id?: string;
  room_password?: string;
  banner_url?: string;
  thumbnail_url?: string;
  max_players?: number;
  current_players?: number;
};


type LeaderboardEntry = {
  id: string;
  user_id: string;
  position: number;
  kills: number;
  prize_amount: number;
  player_name?: string;
  player_email?: string;
};

function formatStartTime(value: any): string {
  if (!value) return "TBA";
  try {
    const date = value.toDate ? value.toDate() : new Date(value);
    return date.toLocaleString();
  } catch {
    return "TBA";
  }
}

export default function TournamentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<any[]>([]);
  
  // Join dialog state
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [gameAccounts, setGameAccounts] = useState<GameAccount[]>([]);
  const [selectedGameAccount, setSelectedGameAccount] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    async function loadAll() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("tournaments").select("*").eq("id", id).single();
        if (error || !data) {
          console.error("Failed to load tournament from Supabase", error);
          setTournament(null);
          return;
        }
        setTournament({
          id: (data as any).id,
          title: (data as any).title ?? "Untitled tournament",
          game: (data as any).game ?? "Unknown",
          mode: (data as any).mode ?? "",
          map: (data as any).map ?? "",
          region: (data as any).region ?? "",
          status: (data as any).status ?? "upcoming",
          entry_fee: (data as any).entry_fee ?? 0,
          prize_pool: (data as any).prize_pool ?? 0,
          per_kill_coins: (data as any).per_kill_coins ?? 0,
          prize_distribution: (data as any).prize_distribution ?? [],
          description: (data as any).description ?? "",
          rules: (data as any).rules ?? "",
          start_time: (data as any).start_time,
          registration_ends_at: (data as any).registration_ends_at,
          room_id: (data as any).room_id ?? "",
          room_password: (data as any).room_password ?? "",
          banner_url: (data as any).banner_url ?? "",
          thumbnail_url: (data as any).thumbnail_url ?? "",
          max_players: (data as any).max_players ?? 100,
          current_players: (data as any).current_players ?? 0,
        });

        if (user) {
          // Check if already joined using Supabase with user.id directly
          const { data: registrations } = await supabase
            .from("tournament_registrations")
            .select("id")
            .eq("tournament_id", id)
            .eq("user_id", user.id);
          
          setIsJoined(!!registrations && registrations.length > 0);
        }

        // Load leaderboard from Supabase tournament_results
        if (tournament && tournament.status === "completed") {
          const { data: results } = await supabase
            .from("tournament_results")
            .select(`
              *,
              users!user_id (
                email
              )
            `)
            .eq("tournament_id", id)
            .order("position", { ascending: true });
          
          if (results) {
            const lbList: LeaderboardEntry[] = results.map(r => ({
              id: r.id,
              user_id: r.user_id,
              position: r.position,
              kills: r.kills || 0,
              prize_amount: r.prize_amount || 0,
              player_email: (r as any).users?.email,
              player_name: (r as any).users?.email?.split('@')[0] || "Player"
            }));
            setLeaderboard(lbList);
          }
        }
        
        // Load registered players
        const { data: registrations } = await supabase
          .from("tournament_registrations")
          .select(`
            *,
            users!user_id (
              email
            )
          `)
          .eq("tournament_id", id);
        
        if (registrations) {
          setRegisteredPlayers(registrations);
        }
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [id, user]);

  // Load game accounts for the user
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

  // Open join dialog
  function openJoinDialog() {
    if (!user) {
      router.push("/auth");
      return;
    }
    loadGameAccounts();
    setJoinError(null);
    setShowJoinDialog(true);
  }

  // Check if user has enough balance
  const hasEnoughBalance = (profile?.coins ?? 0) >= (tournament?.entry_fee ?? 0);
  
  // Show all game accounts (no filtering by game)
  const relevantGameAccounts = gameAccounts;

  async function handleConfirmJoin() {
    if (!user || !id || !tournament || isJoined || !profile) return;

    setJoinError(null);
    setJoining(true);
    try {
      const currentCoins = profile.coins ?? 0;
      const cost = tournament.entry_fee ?? 0;

      // Check again if already joined (prevent double join)
      const { data: existingReg } = await supabase
        .from("tournament_registrations")
        .select("id")
        .eq("tournament_id", id)
        .eq("user_id", user.id);
      
      if (existingReg && existingReg.length > 0) {
        setJoinError("You have already joined this tournament.");
        setIsJoined(true);
        setShowJoinDialog(false);
        return;
      }

      // Deduct coins
      const { error: walletError } = await supabase
        .from("users")
        .update({ coins: currentCoins - cost })
        .eq("id", user.id);
      
      if (walletError) {
        setJoinError("Failed to deduct entry fee. Please try again.");
        return;
      }

      // Register for tournament with selected game account
      const { error: regError } = await supabase
        .from("tournament_registrations")
        .insert({
          tournament_id: id,
          user_id: user.id,
          game_account_id: selectedGameAccount || null,
        });
      
      if (regError) {
        console.error("Registration error:", regError);
        // Refund coins if registration fails
        await supabase
          .from("users")
          .update({ coins: currentCoins })
          .eq("id", user.id);
        setJoinError("Failed to join tournament. Please try again.");
        return;
      }

      // Create transaction record
      await supabase
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          amount: -cost,
          balance_after: currentCoins - cost,
          type: "entry_fee",
          description: `Entry fee for ${tournament.title}`,
          reference_id: id,
        });

      // Update current players count
      await supabase
        .from("tournaments")
        .update({ current_players: (tournament.current_players || 0) + 1 })
        .eq("id", id);

      // Refresh profile to update wallet balance
      await refreshProfile();
      
      // Update local state
      setTournament(prev => prev ? { ...prev, current_players: (prev.current_players || 0) + 1 } : null);
      
      // Add self to registered players list
      setRegisteredPlayers(prev => [...prev, { 
        id: Date.now().toString(), 
        user_id: user.id, 
        users: { email: profile?.email || user?.email } 
      }]);
      
      setIsJoined(true);
      setShowJoinDialog(false);
    } catch (error) {
      console.error("Failed to join tournament", error);
      setJoinError("Failed to join tournament. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-300">
          <span className="mr-2 h-2 w-2 animate-ping rounded-full bg-[var(--warzone-lime)]" />
          Loading tournament...
        </div>
      </MobileLayout>
    );
  }

  if (!tournament) {
    return (
      <MobileLayout>
        <div className="min-h-screen">
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-lg font-semibold text-white">Tournament not found</p>
            <p className="text-sm text-zinc-400 mt-2">This tournament may have been deleted.</p>
            <Link
              href="/games"
              className="mt-4 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              Browse Tournaments
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 tournament-hero-glow">
          {(() => {
            const visuals = getGameVisuals(tournament.game);
            const bannerSrc = tournament.banner_url || tournament.thumbnail_url || visuals.banner;
            return (
              <>
                <img
                  src={bannerSrc}
                  alt={`${tournament.game} banner`}
                  className="h-full w-full object-cover hero-zoom-img"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </>
            );
          })()}

          {/* Tournament Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tournament.status === "live"
                      ? "bg-red-500/20 text-red-400 animate-pulse border border-red-500/30"
                      : tournament.status === "completed"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {tournament.status || "upcoming"}
                </span>
                <span className="text-xs text-zinc-400">
                  {tournament.game}
                  {tournament.mode && ` • ${tournament.mode}`}
                  {tournament.map && ` • ${tournament.map}`}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{tournament.title}</h1>
              <p className="text-sm text-zinc-300 max-w-2xl">
                {tournament.description || "Battle for glory and rewards in this epic tournament!"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-300">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>Starts {formatStartTime(tournament.start_time)}</span>
                </span>
                {tournament.region && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span>{tournament.region}</span>
                  </span>
                )}
                {typeof tournament.entry_fee === "number" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
                    <DollarSign className="w-3 h-3 text-zinc-400" />
                    <span>Entry ₹{tournament.entry_fee}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl p-4 bg-zinc-900 border border-white/10">
              <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">₹{tournament.entry_fee || 0}</p>
              <p className="text-xs text-zinc-400">Entry Fee</p>
            </div>
            <div className="rounded-xl p-4 bg-zinc-900 border border-white/10">
              <Zap className="w-5 h-5 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold text-white">₹{tournament.per_kill_coins || 0}</p>
              <p className="text-xs text-zinc-400">Per Kill</p>
            </div>
          </div>

          {/* Join Section */}
          {user && !isJoined && tournament.status === "upcoming" && (
            <div className="rounded-xl mb-6 p-4 bg-zinc-900 border border-cyan-500/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to compete?</h3>
                  <p className="text-sm text-zinc-400">
                    Entry fee: ₹{tournament.entry_fee} • Your balance: ₹{profile?.coins || 0}
                  </p>
                </div>
                <button
                  onClick={openJoinDialog}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition"
                >
                  Join Tournament
                </button>
              </div>
            </div>
          )}
          
          {/* Not logged in - Join Section */}
          {!user && tournament.status === "upcoming" && (
            <div className="rounded-xl mb-6 p-4 bg-zinc-900 border border-cyan-500/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to compete?</h3>
                  <p className="text-sm text-zinc-400">
                    Entry fee: ₹{tournament.entry_fee}
                  </p>
                </div>
                <button
                  onClick={openJoinDialog}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition"
                >
                  Join Tournament
                </button>
              </div>
            </div>
          )}

          {/* Joined Success Message */}
          {isJoined && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">You're registered!</p>
                  <p className="text-sm text-zinc-400">Check room details below when they're available.</p>
                </div>
              </div>
            </div>
          )}


          {/* Prize Distribution */}
          {tournament.prize_distribution && tournament.prize_distribution.length > 0 && (
            <div className="neon-card p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Prize Distribution
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tournament.prize_distribution.map((prize: any) => (
                  <div key={prize.position} className="text-center p-3 rounded-lg bg-black/40 border border-white/10">
                    <div className="text-2xl mb-2">
                      {prize.position === 1
                        ? "🥇"
                        : prize.position === 2
                        ? "🥈"
                        : prize.position === 3
                        ? "🥉"
                        : "🏆"}
                    </div>
                    <p className="text-xs text-zinc-400">Position #{prize.position}</p>
                    <p className="text-lg font-bold text-yellow-400">₹{prize.amount}</p>
                  </div>
                ))}
              </div>
              {tournament.per_kill_coins && tournament.per_kill_coins > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-sm text-orange-400">
                    <Zap className="inline w-4 h-4 mr-2" />
                    Additional ₹{tournament.per_kill_coins} per kill
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Rules - Always show */}
          <section className="neon-card p-4 text-sm text-zinc-200 space-y-4 mb-6">
            <h2 className="text-sm font-semibold text-zinc-50">Rules & format</h2>
            <p className="text-xs text-zinc-400">
              {tournament.rules ||
                "The organizer hasn't provided detailed rules yet. Please follow standard fair play and anti-cheat guidelines."}
            </p>
          </section>

          {/* Room Details - Only for upcoming/live tournaments */}
          {tournament.status !== "completed" && (
            <section className="neon-card p-4 text-sm text-zinc-200 space-y-4 mb-6">
              <h2 className="text-sm font-semibold text-zinc-50">Room details</h2>
              {isJoined ? (
                tournament.room_id && tournament.room_password ? (
                  <div className="space-y-3 text-xs">
                    <p className="text-zinc-400">
                      🔒 Share these only with your squad.
                    </p>
                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                      <p className="text-[10px] uppercase tracking-wider text-cyan-400 mb-1">Room ID</p>
                      <p className="text-lg font-bold text-white font-mono">{tournament.room_id}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                      <p className="text-[10px] uppercase tracking-wider text-cyan-400 mb-1">Password</p>
                      <p className="text-lg font-bold text-white font-mono">{tournament.room_password}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <p className="text-sm font-semibold text-yellow-400">Coming Soon</p>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Room ID and Password will be shared 5-10 minutes before the match starts. Stay tuned!
                    </p>
                  </div>
                )
              ) : (
                <p className="text-xs text-zinc-400">
                  Join the tournament to see room details. They will be shared before the match.
                </p>
              )}
            </section>
          )}

          {/* Registered Players - Always show for upcoming/live */}
          {(tournament.status === "upcoming" || tournament.status === "live") && (
            <div className="rounded-xl bg-zinc-900 border border-white/10 p-4">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Registered Players ({registeredPlayers.length}/{tournament.max_players})
              </h3>
              {registeredPlayers.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">No players registered yet. Be the first to join!</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {registeredPlayers.map((reg, index) => (
                    <div
                      key={reg.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                        {index + 1}
                      </div>
                      <p className="text-sm text-white truncate flex-1">
                        {(reg as any).users?.email?.split("@")[0] || `Player ${index + 1}`}
                      </p>
                      {reg.user_id === user?.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">You</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{registeredPlayers.length} joined</span>
                  <span>{(tournament.max_players || 100) - registeredPlayers.length} slots left</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{
                      width: `${Math.min((registeredPlayers.length / (tournament.max_players || 100)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard / Results - For completed tournaments */}
          {tournament.status === "completed" && (
            <div className="rounded-xl bg-zinc-900 border border-white/10 p-4">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Final Results & Leaderboard
              </h3>
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.position === 1
                          ? "bg-yellow-500/10 border border-yellow-500/30"
                          : entry.position === 2
                          ? "bg-zinc-400/10 border border-zinc-400/30"
                          : entry.position === 3
                          ? "bg-orange-500/10 border border-orange-500/30"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center text-xl">
                          {entry.position === 1
                            ? "🥇"
                            : entry.position === 2
                            ? "🥈"
                            : entry.position === 3
                            ? "🥉"
                            : <span className="text-sm text-zinc-400">#{entry.position}</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{entry.player_name}</p>
                          <p className="text-xs text-zinc-400">{entry.kills} kills</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {entry.prize_amount > 0 && (
                          <p className="text-sm font-bold text-green-400">+₹{entry.prize_amount}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 text-center py-4">Results not yet published.</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Join Confirmation Dialog */}
      {showJoinDialog && tournament && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90">
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Join Tournament</h3>
              <button 
                onClick={() => setShowJoinDialog(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Tournament Summary */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <h4 className="font-semibold text-white text-sm mb-2">{tournament.title}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Game:</span>
                    <span className="text-white">{tournament.game}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Mode:</span>
                    <span className="text-white">{tournament.mode || 'Solo'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Entry:</span>
                    <span className="text-yellow-400 font-semibold">₹{tournament.entry_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Prize:</span>
                    <span className="text-green-400 font-semibold">₹{tournament.prize_pool}</span>
                  </div>
                </div>
              </div>
              
              {/* Your Balance */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800 mb-4">
                <span className="text-sm text-zinc-400">Your Balance</span>
                <span className={`font-bold ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{profile?.coins || 0}
                </span>
              </div>
              
              {/* Balance Check */}
              {/* Check 1: Insufficient Balance */}
              {!hasEnoughBalance ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-400 text-sm">Insufficient Balance</p>
                      <p className="text-xs text-zinc-400">
                        Need ₹{(tournament.entry_fee || 0) - (profile?.coins || 0)} more
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/wallet"
                    onClick={() => setShowJoinDialog(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold text-sm"
                  >
                    <Wallet className="w-4 h-4" />
                    Add Money
                  </Link>
                </div>
              ) : relevantGameAccounts.length === 0 ? (
                /* Check 2: No Game ID - REQUIRED */
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Gamepad2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-400 text-sm">Game ID Required</p>
                      <p className="text-xs text-zinc-400">
                        Add your {tournament.game} ID before joining
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setShowJoinDialog(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Game ID in Profile
                  </Link>
                </div>
              ) : (
                <>
                  {/* Game ID Selection - Required */}
                  <div className="mb-4">
                    <label className="text-xs text-zinc-400 mb-1.5 block">Select Your Game ID</label>
                    <select
                      value={selectedGameAccount}
                      onChange={(e) => setSelectedGameAccount(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                    >
                      <option value="">Select your {tournament.game} ID...</option>
                      {relevantGameAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.in_game_id} {acc.nickname && `(${acc.nickname})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Error Message */}
                  {joinError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                      <p className="text-sm text-red-400">{joinError}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Footer Buttons - Only show if has balance AND has game ID */}
            {hasEnoughBalance && relevantGameAccounts.length > 0 && (
              <div className="flex gap-3 p-4 border-t border-white/10">
                <button
                  onClick={() => setShowJoinDialog(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmJoin}
                  disabled={joining || !selectedGameAccount}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-semibold text-sm disabled:opacity-50"
                >
                  {joining ? "Joining..." : `Pay ₹${tournament.entry_fee} & Join`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
