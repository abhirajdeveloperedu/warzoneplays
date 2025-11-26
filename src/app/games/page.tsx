"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Users, Calendar, TrendingUp, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";

type GameConfig = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  count?: number;
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

export default function GamesPage() {
  const pathname = usePathname();
  const [games, setGames] = useState<GameConfig[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "completed">("upcoming");

  // Load games from database on mount and navigation
  useEffect(() => {
    async function loadGames() {
      const { data } = await supabase
        .from("games")
        .select("id, name, slug, image_url")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setGames(data);
    }
    loadGames();
  }, [pathname]);

  // Load tournaments when filters change
  useEffect(() => {
    if (games.length > 0) {
      loadTournaments();
    }
  }, [selectedGame, activeTab, games, pathname]);

  async function loadTournaments() {
    setLoading(true);
    try {
      let query = supabase
        .from("tournaments")
        .select("*")
        .order("start_time", { ascending: activeTab !== "completed" });

      // Filter by game
      if (selectedGame !== "all") {
        const gameConfig = games.find(g => g.id === selectedGame);
        if (gameConfig) {
          query = query.ilike("game", `%${gameConfig.name}%`);
        }
      }

      // Filter by status
      if (activeTab === "live") {
        query = query.eq("status", "live");
      } else if (activeTab === "upcoming") {
        query = query.eq("status", "upcoming");
      } else {
        query = query.eq("status", "completed");
      }

      const { data } = await query;
      setTournaments(data || []);
    } finally {
      setLoading(false);
    }
  }

  // Calculate tournament count per game
  const gamesWithCount = games.map(game => ({
    ...game,
    count: tournaments.filter(t => 
      t.game?.toLowerCase().includes(game.name.toLowerCase())
    ).length
  }));

  return (
    <MobileLayout>
      <div className="min-h-screen">
        {/* Games Filter - Horizontal Scroll on Mobile */}
        <div className="sticky top-14 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 p-3 min-w-max">
              <button
                onClick={() => setSelectedGame("all")}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  selectedGame === "all"
                    ? "bg-[var(--warzone-cyan)] text-black"
                    : "bg-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                All Games ({tournaments.length})
              </button>
              {gamesWithCount.map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                    selectedGame === game.id
                      ? "bg-[var(--warzone-cyan)] text-black"
                      : "bg-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {game.image_url && (
                    <img src={game.image_url} alt="" className="w-5 h-5 rounded object-cover" />
                  )}
                  <span>{game.name}</span>
                  {(game.count ?? 0) > 0 && (
                    <span className="bg-black/30 px-1.5 py-0.5 rounded text-xs">
                      {game.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === "live"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            🔴 Live Now
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === "upcoming"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            🔵 Upcoming
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all ${
              activeTab === "completed"
                ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            ✅ Completed
          </button>
        </div>

        {/* Tournament Cards */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--warzone-cyan)] border-r-transparent" />
              <p className="mt-4 text-sm text-zinc-400">Loading tournaments...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
              <p className="text-zinc-400">No {activeTab} tournaments found</p>
              <p className="text-sm text-zinc-500 mt-2">Check back later or try a different filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {tournaments.map(tournament => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
                  className="group relative overflow-hidden rounded-xl bg-zinc-900/90 border border-white/10 transition-all hover:border-cyan-500/40"
                >
                  {/* Tournament Image */}
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={tournament.thumbnail_url || tournament.banner_url || '/placeholder.jpg'}
                      alt={tournament.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  
                  <div className="p-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-zinc-400">{tournament.game} • {tournament.mode || 'Solo'}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        tournament.status === "live" 
                          ? "bg-red-500/20 text-red-400"
                          : tournament.status === "upcoming"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {tournament.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-sm line-clamp-1 mb-2">{tournament.title}</h3>

                    {/* Prize Row */}
                    <div className="flex items-center justify-between mb-2 px-2 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-bold text-yellow-500">₹{calculateTotalPrize(tournament).toLocaleString()}</span>
                      </div>
                      {tournament.per_kill_coins && tournament.per_kill_coins > 0 && (
                        <span className="text-[10px] text-orange-400">+₹{tournament.per_kill_coins}/kill</span>
                      )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                      <div>
                        <p className="text-zinc-500">Entry</p>
                        <p className="font-semibold text-white">₹{tournament.entry_fee}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Players</p>
                        <p className="font-semibold text-white">{tournament.current_players}/{tournament.max_players}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Time</p>
                        <p className="font-semibold text-cyan-400">
                          {new Date(tournament.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 transition-all"
                        style={{ width: `${Math.min((tournament.current_players / tournament.max_players) * 100, 100)}%` }}
                      />
                    </div>
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
