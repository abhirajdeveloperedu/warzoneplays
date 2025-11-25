"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getGameVisuals } from "@/lib/gameVisuals";

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
  max_players?: number;
  current_players?: number;
  start_time?: any;
  registration_ends_at?: any;
  banner_url?: string;
  thumbnail_url?: string;
};

function formatStartTime(value: any): string {
  if (!value) return "TBA";
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    return date.toLocaleString();
  } catch {
    return "TBA";
  }
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tournaments")
          .select("id, title, game, mode, map, region, status, entry_fee, prize_pool, max_players, current_players, start_time, registration_ends_at, banner_url, thumbnail_url")
          .order("start_time", { ascending: true });
        if (error) {
          console.error("Failed to load tournaments from Supabase", error);
          setTournaments([]);
        } else {
          setTournaments((data ?? []) as Tournament[]);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const games = useMemo(() => {
    const set = new Set<string>();
    tournaments.forEach((t) => {
      if (t.game) set.add(t.game);
    });
    return Array.from(set).sort();
  }, [tournaments]);

  const filtered = useMemo(() => {
    if (selectedGame === "all") return tournaments;
    return tournaments.filter((t) => t.game === selectedGame);
  }, [tournaments, selectedGame]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Tournaments</h1>
          <p className="text-sm text-zinc-400">
            Browse live and upcoming WarZone events by game and mode. Pick your title, check the format, and jump into
            the next war.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setSelectedGame("all")}
          className={`rounded-full px-3 py-1.5 font-semibold uppercase tracking-wide transition ${selectedGame === "all" ? "bg-[var(--warzone-red)] text-black shadow-md shadow-red-500/40" : "border border-white/15 text-zinc-100 hover:border-white hover:bg-white/5"}`}
        >
          All games
        </button>
        {games.map((game) => (
          <button
            key={game}
            type="button"
            onClick={() => setSelectedGame(game)}
            className={`rounded-full px-3 py-1.5 font-semibold uppercase tracking-wide transition ${selectedGame === game ? "bg-[var(--warzone-cyan)] text-black shadow-md shadow-cyan-500/40" : "border border-white/15 text-zinc-100 hover:border-white hover:bg-white/5"}`}
          >
            {game}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-300">
          <span className="mr-2 h-2 w-2 animate-ping rounded-full bg-[var(--warzone-lime)]" />
          Loading tournaments...
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No tournaments are live right now. Check back soon or follow WarZone socials for the next drop.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((item) => {
            const visuals = getGameVisuals(item.game);
            const imageSrc = item.thumbnail_url || item.banner_url || visuals.thumbnail;
            return (
              <Link
                key={item.id}
                href={`/tournaments/${item.id}`}
                className="group flex flex-col justify-between overflow-hidden neon-card text-xs text-zinc-300 transition hover:-translate-y-1"
              >
                <div className="relative h-32 w-full overflow-hidden border-b border-white/5 bg-black/60">
                  {/* Remote or local image directly from admin-provided URL */}
                  <img
                    src={imageSrc}
                    alt={`${item.game} artwork`}
                    className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-zinc-50 group-hover:text-white">{item.title}</h2>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      {item.game}
                      {item.mode ? ` · ${item.mode}` : ""}
                      {item.region ? ` · ${item.region}` : ""}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Entry {item.entry_fee ?? 0} coins · {item.current_players ?? 0}/{item.max_players ?? 100} players
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Starts {formatStartTime(item.start_time)}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${item.status === "live" ? "bg-[var(--warzone-lime)]/10 text-[var(--warzone-lime)]" : item.status === "completed" ? "bg-zinc-800 text-zinc-300" : "bg-[var(--warzone-cyan)]/10 text-[var(--warzone-cyan)]"}`}
                    >
                      {item.status ?? "upcoming"}
                    </span>
                    <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200">View details →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
