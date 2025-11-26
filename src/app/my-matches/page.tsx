"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Clock, CheckCircle, XCircle, DollarSign, Users, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/providers";
import MobileLayout from "@/components/MobileLayout";

type JoinedTournament = {
  id: string;
  tournament_id: string;
  tournament: Tournament;
  joined_at: string;
  position?: number;
  kills?: number;
  earnings?: number;
};

type Tournament = {
  id: string;
  title: string;
  game: string;
  mode?: string;
  status: string;
  prize_pool: number;
  entry_fee: number;
  per_kill_coins?: number;
  start_time: string;
  room_id?: string;
  room_password?: string;
  thumbnail_url?: string;
  current_players: number;
  max_players: number;
};

// Calculate total prize: position prizes + (per_kill × max_players)
function calculateTotalPrize(t: Tournament): number {
  const positionPrizes = t.prize_pool || 0;
  const perKillTotal = (t.per_kill_coins || 0) * (t.max_players || 0);
  return positionPrizes + perKillTotal;
}

export default function MyMatchesPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [matches, setMatches] = useState<JoinedTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "live" | "completed">("upcoming");

  // Load data on mount, tab change, or navigation
  useEffect(() => {
    if (user) {
      loadMyMatches();
    } else {
      setLoading(false);
    }
  }, [user, activeTab, pathname]);

  async function loadMyMatches() {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user's tournament registrations with tournament details using Supabase Auth user.id
      const { data: registrations } = await supabase
        .from("tournament_registrations")
        .select(`
          id,
          tournament_id,
          created_at,
          tournaments!tournament_id (
            id,
            title,
            game,
            mode,
            status,
            prize_pool,
            entry_fee,
            per_kill_coins,
            start_time,
            room_id,
            room_password,
            thumbnail_url,
            current_players,
            max_players
          )
        `)
        .eq("user_id", user.id);

      if (registrations) {
        // Filter by status
        const filtered = registrations.filter(reg => {
          const tournament = (reg as any).tournaments;
          if (!tournament) return false;
          
          if (activeTab === "live") return tournament.status === "live";
          if (activeTab === "upcoming") return tournament.status === "upcoming";
          if (activeTab === "completed") return tournament.status === "completed";
          return true;
        });

        // Map to proper structure
        const mappedMatches = filtered.map(reg => ({
          id: reg.id,
          tournament_id: reg.tournament_id,
          tournament: (reg as any).tournaments,
          joined_at: reg.created_at,
        }));

        // Sort by tournament start time
        mappedMatches.sort((a, b) => {
          const timeA = new Date(a.tournament.start_time).getTime();
          const timeB = new Date(b.tournament.start_time).getTime();
          return activeTab === "completed" ? timeB - timeA : timeA - timeB;
        });

        setMatches(mappedMatches);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <Trophy className="w-16 h-16 text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in to View Your Matches</h2>
          <p className="text-sm text-zinc-400 text-center mb-6">
            Track your tournament history and see upcoming matches
          </p>
          <Link
            href="/auth"
            className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition"
          >
            Sign In
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-zinc-900/80 p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white mb-2">My Matches</h1>
          <p className="text-sm text-zinc-400">Track your tournament journey</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 bg-black/50 backdrop-blur sticky top-14 z-20 border-b border-white/10">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "upcoming"
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "live"
                ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/30"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Completed
          </button>
        </div>

        {/* Matches List */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--warzone-cyan)] border-r-transparent" />
              <p className="mt-4 text-sm text-zinc-400">Loading your matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
              <p className="text-zinc-400">No {activeTab} matches</p>
              <p className="text-sm text-zinc-500 mt-2">
                {activeTab === "upcoming" && "Join tournaments to see them here"}
                {activeTab === "live" && "Your live matches will appear here"}
                {activeTab === "completed" && "Your match history will appear here"}
              </p>
              {activeTab === "upcoming" && (
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-[var(--warzone-red)] to-[var(--warzone-cyan)] text-white font-semibold text-sm hover:scale-105 transition"
                >
                  Browse Tournaments
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map(match => {
                const tournament = match.tournament;
                const isLive = tournament.status === "live";
                const isCompleted = tournament.status === "completed";
                
                return (
                  <Link
                    key={match.id}
                    href={`/tournaments/${tournament.id}`}
                    className="block relative overflow-hidden neon-card transition-all hover:scale-[1.01]"
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-zinc-400">{tournament.game}</span>
                            {tournament.mode && (
                              <>
                                <span className="text-zinc-600">•</span>
                                <span className="text-xs text-zinc-400">{tournament.mode}</span>
                              </>
                            )}
                          </div>
                          <h3 className="font-semibold text-white line-clamp-1">{tournament.title}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          isLive 
                            ? "bg-red-500/20 text-red-400 animate-pulse"
                            : isCompleted
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {tournament.status}
                        </span>
                      </div>

                      {/* Room Details for Live/Upcoming */}
                      {(isLive || tournament.status === "upcoming") && tournament.room_id && (
                        <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                          <p className="text-[10px] text-zinc-500 mb-1">ROOM DETAILS</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-zinc-400">Room ID</p>
                              <p className="text-xs font-semibold text-white">{tournament.room_id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-400">Password</p>
                              <p className="text-xs font-semibold text-white">{tournament.room_password || "No Pass"}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Results for Completed */}
                      {isCompleted && match.position && (
                        <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                          <p className="text-[10px] text-zinc-500 mb-1">YOUR RESULTS</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-[10px] text-zinc-400">Position</p>
                              <p className="text-sm font-bold text-yellow-500">#{match.position}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-400">Kills</p>
                              <p className="text-sm font-bold text-orange-500">{match.kills || 0}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-400">Earned</p>
                              <p className="text-sm font-bold text-green-500">₹{match.earnings || 0}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Info */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-yellow-500" />
                            <span className="text-zinc-300">₹{calculateTotalPrize(tournament).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-zinc-400" />
                            <span className="text-zinc-300">
                              {tournament.current_players}/{tournament.max_players}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span className="text-zinc-300">
                            {new Date(tournament.start_time).toLocaleDateString([], { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            {" "}
                            {new Date(tournament.start_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
