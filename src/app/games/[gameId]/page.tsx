"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Clock, DollarSign, Users, Filter } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";

type GameInfo = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

type Tournament = {
  id: string;
  title: string;
  game: string;
  mode?: string;
  map?: string;
  status: string;
  prize_pool: number;
  entry_fee: number;
  per_kill_coins?: number;
  prize_distribution?: any;
  start_time: string;
  current_players: number;
  max_players: number;
  thumbnail_url?: string;
  banner_url?: string;
};

// Calculate total prize: position prizes + (per_kill × max_players)
function calculateTotalPrize(t: Tournament): number {
  const positionPrizes = t.prize_pool || 0;
  const perKillTotal = (t.per_kill_coins || 0) * (t.max_players || 0);
  return positionPrizes + perKillTotal;
}

export default function GameTournamentsPage() {
  const params = useParams();
  const router = useRouter();
  const gameSlug = params.gameId as string;

  const [game, setGame] = useState<GameInfo | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "live" | "upcoming">("all");
  const [sortBy, setSortBy] = useState<"time" | "prize" | "entry">("time");

  // Load game info from database
  useEffect(() => {
    async function loadGame() {
      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("slug", gameSlug)
        .single();
      
      if (data) {
        setGame(data);
      } else {
        router.push("/games");
      }
    }
    loadGame();
  }, [gameSlug]);

  // Load tournaments when game is loaded or filters change
  useEffect(() => {
    if (game) {
      loadTournaments();
    }
  }, [game, filter, sortBy]);

  async function loadTournaments() {
    if (!game) return;
    setLoading(true);
    try {
      let query = supabase
        .from("tournaments")
        .select("*")
        .ilike("game", `%${game.name}%`);

      // Apply filters
      if (filter === "live") {
        query = query.eq("status", "live");
      } else if (filter === "upcoming") {
        query = query.eq("status", "upcoming");
      }

      // Apply sorting
      if (sortBy === "prize") {
        query = query.order("prize_pool", { ascending: false });
      } else if (sortBy === "entry") {
        query = query.order("entry_fee", { ascending: true });
      } else {
        query = query.order("start_time", { ascending: true });
      }

      const { data } = await query;
      setTournaments(data || []);
    } finally {
      setLoading(false);
    }
  }

  if (!game) {
    return (
      <MobileLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen">
        {/* Hero Banner */}
        <div className="relative h-56 md:h-72 tournament-hero-glow">
          {game.image_url ? (
            <img
              src={game.image_url}
              alt={game.name}
              className="h-full w-full object-cover hero-zoom-img"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute top-16 left-4 p-2 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Game Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{game.name}</h1>
            <p className="text-sm text-zinc-300">
              {tournaments.length} Tournament{tournaments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="sticky top-14 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {/* Filter Buttons */}
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filter === "all" 
                  ? "bg-white/20 text-white" 
                  : "bg-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("live")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1 ${
                filter === "live" 
                  ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                  : "bg-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              🔴 Live
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filter === "upcoming" 
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                  : "bg-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              Upcoming
            </button>
            
            <div className="border-l border-white/20 mx-2" />
            
            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium border border-white/20 outline-none"
            >
              <option value="time">Sort by Time</option>
              <option value="prize">Sort by Prize</option>
              <option value="entry">Sort by Entry</option>
            </select>
          </div>
        </div>

        {/* Tournament List */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--warzone-cyan)] border-r-transparent" />
              <p className="mt-4 text-sm text-zinc-400">Loading tournaments...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
              <p className="text-zinc-400">No tournaments found for {game.name}</p>
              <p className="text-sm text-zinc-500 mt-2">Check back later</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map(tournament => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
                  className="block relative overflow-hidden neon-card transition-all hover:scale-[1.01]"
                >
                  <div className="flex gap-4 p-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white line-clamp-1">{tournament.title}</h3>
                          <p className="text-xs text-zinc-400 mt-1">
                            {tournament.mode} {tournament.map && `• ${tournament.map}`}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tournament.status === "live" 
                            ? "bg-red-500/20 text-red-400 animate-pulse"
                            : tournament.status === "upcoming"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}>
                          {tournament.status}
                        </span>
                      </div>

                      {/* Prize Distribution Preview */}
                      {tournament.prize_distribution && tournament.prize_distribution.length > 0 && (
                        <div className="flex gap-3 mb-2">
                          {tournament.prize_distribution.slice(0, 3).map((prize: any, idx: number) => (
                            <span key={idx} className="text-[10px] text-zinc-500">
                              #{prize.position}: ₹{prize.amount}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bottom Stats */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-yellow-500" />
                          <span className="font-semibold text-yellow-500">₹{calculateTotalPrize(tournament).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-zinc-400" />
                          <span className="text-zinc-300">
                            {tournament.current_players}/{tournament.max_players}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span className="text-zinc-300">
                            {new Date(tournament.start_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Entry Fee */}
                    <div className="flex flex-col items-center justify-center px-4 border-l border-white/10">
                      <p className="text-[10px] text-zinc-500 mb-1">Entry</p>
                      <p className="text-xl font-bold text-[var(--warzone-lime)]">₹{tournament.entry_fee}</p>
                      {tournament.per_kill_coins && tournament.per_kill_coins > 0 && (
                        <p className="text-[10px] text-orange-400 mt-1">+₹{tournament.per_kill_coins}/kill</p>
                      )}
                    </div>
                  </div>

                  {/* Player Progress Bar */}
                  <div className="h-1 bg-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-[var(--warzone-cyan)] to-[var(--warzone-lime)] transition-all"
                      style={{ 
                        width: `${Math.min((tournament.current_players / tournament.max_players) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
