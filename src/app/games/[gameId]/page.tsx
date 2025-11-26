"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Clock, DollarSign, Users, Filter } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";

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

const GAMES_CONFIG: Record<string, any> = {
  bgmi: { name: "BGMI", icon: "🎮", color: "from-orange-500 to-red-500", banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop" },
  freefire: { name: "Free Fire", icon: "🔥", color: "from-yellow-500 to-orange-500", banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop" },
  cod: { name: "Call of Duty", icon: "🪖", color: "from-green-500 to-emerald-500", banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=400&fit=crop" },
  valorant: { name: "Valorant", icon: "🎯", color: "from-purple-500 to-pink-500", banner: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=1200&h=400&fit=crop" },
  gta: { name: "GTA V", icon: "🚗", color: "from-blue-500 to-cyan-500", banner: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200&h=400&fit=crop" },
  chess: { name: "Chess", icon: "♟️", color: "from-gray-500 to-zinc-500", banner: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1200&h=400&fit=crop" },
};

export default function GameTournamentsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const game = GAMES_CONFIG[gameId];

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "live" | "upcoming">("all");
  const [sortBy, setSortBy] = useState<"time" | "prize" | "entry">("time");

  useEffect(() => {
    if (!game) {
      router.push("/games");
      return;
    }
    loadTournaments();
  }, [gameId, filter, sortBy]);

  async function loadTournaments() {
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

  if (!game) return null;

  return (
    <MobileLayout>
      <div className="min-h-screen">
        {/* Hero Banner */}
        <div className="relative h-56 md:h-72 tournament-hero-glow">
          <img
            src={game.banner}
            alt={game.name}
            className="h-full w-full object-cover hero-zoom-img"
          />
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
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{game.icon}</span>
              <h1 className="text-3xl font-bold text-white">{game.name}</h1>
            </div>
            <p className="text-sm text-zinc-300">
              {tournaments.length} Active Tournaments
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
