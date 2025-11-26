"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  ChevronRight, Trophy, Users, Clock, Flame, 
  Timer, ArrowRight, Sparkles, Play, LogIn
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { useAuth } from "./providers";

type Game = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  live_count?: number;
};

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  gradient: string;
  image_url?: string | null;
  cta_text: string;
  cta_link: string;
};

type Tournament = {
  id: string;
  title: string;
  game: string;
  prize_pool: number;
  entry_fee: number;
  per_kill_coins?: number;
  start_time: string;
  current_players: number;
  max_players: number;
  thumbnail_url?: string;
  status: string;
};

// Calculate total prize: position prizes + (per_kill × max_players)
function calculateTotalPrize(t: Tournament): number {
  const positionPrizes = t.prize_pool || 0;
  const perKillTotal = (t.per_kill_coins || 0) * (t.max_players || 0);
  return positionPrizes + perKillTotal;
}

type PlatformStats = {
  live_tournaments: number;
  online_players: number;
  won_today: number;
};

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [nextTournament, setNextTournament] = useState<Tournament | null>(null);
  const [stats, setStats] = useState<PlatformStats>({ live_tournaments: 0, online_players: 0, won_today: 0 });
  const [currentBanner, setCurrentBanner] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [authLoading, user, router]);

  // Load data on mount and when returning to page
  useEffect(() => {
    if (user && pathname === "/") {
      loadAllData();
    }
  }, [user, pathname]);

  // Countdown timer for next tournament
  useEffect(() => {
    if (!nextTournament) return;

    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(nextTournament.start_time).getTime();
      const diff = startTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timerInterval);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [nextTournament]);

  // Banner auto-rotate
  useEffect(() => {
    if (banners.length === 0) return;
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, [banners.length]);

  async function loadAllData() {
    setLoading(true);
    try {
      // Load games from database
      const { data: gamesData } = await supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      // Get live tournament count per game
      if (gamesData) {
        const gamesWithCounts = await Promise.all(gamesData.map(async (game) => {
          const { count } = await supabase
            .from("tournaments")
            .select("*", { count: "exact", head: true })
            .eq("game", game.name)
            .eq("status", "live");
          return { ...game, live_count: count || 0 };
        }));
        setGames(gamesWithCounts);
      }

      // Load banners from database
      const { data: bannersData } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (bannersData) setBanners(bannersData);

      // Load upcoming tournaments
      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("*")
        .eq("status", "upcoming")
        .order("start_time", { ascending: true })
        .limit(6);
      
      if (tournaments && tournaments.length > 0) {
        setUpcomingTournaments(tournaments);
        setNextTournament(tournaments[0]); // First tournament is the next one
      }

      // Load platform stats
      const { count: liveCount } = await supabase
        .from("tournaments")
        .select("*", { count: "exact", head: true })
        .eq("status", "live");

      const { count: playerCount } = await supabase
        .from("tournament_registrations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: wonData } = await supabase
        .from("tournament_results")
        .select("prize_amount")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const wonToday = wonData?.reduce((sum, r) => sum + (r.prize_amount || 0), 0) || 0;

      setStats({
        live_tournaments: liveCount || 0,
        online_players: playerCount || 0,
        won_today: wonToday
      });
    } finally {
      setLoading(false);
    }
  }

  // Show nothing until auth is confirmed - strict check
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback banner if none in database
  const displayBanners = banners.length > 0 ? banners : [
    { id: "1", title: "WELCOME TO WARZONE", subtitle: "Play & Win Real Cash", description: "Join tournaments and compete for prizes", gradient: "from-purple-600 via-pink-500 to-red-500", cta_text: "Get Started", cta_link: "/games" }
  ];

  return (
    <MobileLayout>
      <div className="min-h-screen">
        {/* Hero Banner */}
        <section className="relative h-52 sm:h-64 md:h-72 overflow-hidden">
          {displayBanners.map((banner, index) => (
            <div 
              key={banner.id} 
              className={`absolute inset-0 transition-all duration-700 ${
                index === currentBanner 
                  ? "opacity-100 translate-x-0" 
                  : index < currentBanner 
                    ? "opacity-0 -translate-x-full" 
                    : "opacity-0 translate-x-full"
              }`}
            >
              <div className={`relative h-full w-full bg-gradient-to-r ${banner.gradient} p-6 flex flex-col justify-end`}>
                {banner.image_url && (
                  <img src={banner.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                )}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase">Featured</span>
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">{banner.title}</h2>
                  <p className="text-lg font-bold text-white/90 mb-1">{banner.subtitle}</p>
                  <p className="text-sm text-white/70 mb-4">{banner.description}</p>
                  <Link 
                    href={banner.cta_link} 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-transform shadow-xl"
                  >
                    {banner.cta_text} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {displayBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentBanner ? "w-8 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </section>


        {/* Countdown - Only show if there's an upcoming tournament */}
        {nextTournament && (
          <section className="px-4 mt-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 p-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-400">NEXT: {nextTournament.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {timeLeft.days > 0 && (
                      <>
                        <div className="bg-black/40 rounded-lg px-3 py-2 text-center min-w-[50px]">
                          <span className="text-xl font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                          <p className="text-[8px] text-zinc-500 uppercase">Days</p>
                        </div>
                        <span className="text-xl font-bold text-white/50">:</span>
                      </>
                    )}
                    <div className="bg-black/40 rounded-lg px-3 py-2 text-center min-w-[50px]">
                      <span className="text-xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <p className="text-[8px] text-zinc-500 uppercase">Hours</p>
                    </div>
                    <span className="text-xl font-bold text-white/50">:</span>
                    <div className="bg-black/40 rounded-lg px-3 py-2 text-center min-w-[50px]">
                      <span className="text-xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <p className="text-[8px] text-zinc-500 uppercase">Mins</p>
                    </div>
                    <span className="text-xl font-bold text-white/50">:</span>
                    <div className="bg-black/40 rounded-lg px-3 py-2 text-center min-w-[50px]">
                      <span className="text-xl font-bold text-cyan-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <p className="text-[8px] text-zinc-500 uppercase">Secs</p>
                    </div>
                  </div>
                  <Link 
                    href={`/tournaments/${nextTournament.id}`} 
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:scale-105 transition-transform"
                  >
                    Join
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Games */}
        <section className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Choose Your Battle</h2>
              <p className="text-xs text-zinc-500">Select a game to find tournaments</p>
            </div>
            <Link href="/games" className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-white transition">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-[4/5] rounded-2xl bg-zinc-800/50 animate-pulse" />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <p>No games available yet</p>
              <p className="text-sm">Admin needs to add games</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {games.slice(0, 4).map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/5]"
                >
                  <div className="absolute inset-0">
                    {game.image_url ? (
                      <img src={game.image_url} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  </div>
                  
                  {/* Only show LIVE badge if count > 0 */}
                  {game.live_count && game.live_count > 0 && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/90 backdrop-blur">
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[10px] font-bold text-white">{game.live_count} LIVE</span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-base font-bold text-white mb-1">{game.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">Play Now</span>
                      <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500">
                        <Play className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Tournaments */}
        <section className="px-4 mt-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-white">Hot Tournaments</h2>
            </div>
            <Link href="/games" className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {upcomingTournaments.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming tournaments</p>
              <p className="text-sm">Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTournaments.map((t) => (
                <Link key={t.id} href={`/tournaments/${t.id}`} className="block tournament-card">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-medium text-zinc-500 uppercase">{t.game}</span>
                          <span className="chip-upcoming text-[10px] px-1.5 py-0.5">UPCOMING</span>
                        </div>
                        <h3 className="text-sm font-semibold text-white">{t.title}</h3>
                      </div>
                      <div className="chip-prize px-3 py-1.5">
                        <span className="text-xs font-bold">₹{calculateTotalPrize(t).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-xs text-zinc-400">{t.current_players}/{t.max_players}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="text-xs text-zinc-400">
                            {new Date(t.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-green-400">₹{t.entry_fee} Entry</span>
                    </div>
                    <div className="mt-3 progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${(t.current_players / t.max_players) * 100}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
}
