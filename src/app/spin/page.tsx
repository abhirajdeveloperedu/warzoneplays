"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Clock, Sparkles } from "lucide-react";
import Script from "next/script";

// Spin wheel segments - mostly "Better Luck Next Time"
const SEGMENTS = [
  { label: "₹5", color: "#10b981", textColor: "#fff" },
  { label: "Better Luck", color: "#3b82f6", textColor: "#fff" },
  { label: "₹10", color: "#f59e0b", textColor: "#fff" },
  { label: "Try Again", color: "#8b5cf6", textColor: "#fff" },
  { label: "₹100", color: "#ef4444", textColor: "#fff" },
  { label: "Better Luck", color: "#06b6d4", textColor: "#fff" },
  { label: "₹5", color: "#ec4899", textColor: "#fff" },
  { label: "Try Again", color: "#22c55e", textColor: "#fff" },
];

// Always land on "Better Luck" or "Try Again" (indexes 1, 3, 5, 7)
const LOSING_INDEXES = [1, 3, 5, 7];

const COOLDOWN_HOURS = 24; // Once per day

export default function SpinWheelPage() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [cooldownTime, setCooldownTime] = useState("");
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check cooldown on mount
  useEffect(() => {
    checkCooldown();
    drawWheel();
    
    // Update cooldown timer every second
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  function checkCooldown() {
    const lastSpin = localStorage.getItem("lastSpinTime");
    if (lastSpin) {
      const lastSpinTime = parseInt(lastSpin);
      const now = Date.now();
      const diff = now - lastSpinTime;
      const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
      
      if (diff < cooldownMs) {
        setCanSpin(false);
        const remaining = cooldownMs - diff;
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
        setCooldownTime(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCanSpin(true);
        setCooldownTime("");
      }
    }
  }

  function drawWheel() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const segmentAngle = (2 * Math.PI) / SEGMENTS.length;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    SEGMENTS.forEach((segment, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = segment.textColor;
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(segment.label, radius - 20, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#1f2937";
    ctx.fill();
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", centerX, centerY + 4);
  }

  async function handleSpin() {
    if (spinning || !canSpin) return;

    setSpinning(true);
    setResult(null);
    setShowResult(false);

    // Always pick a losing index
    const winIndex = LOSING_INDEXES[Math.floor(Math.random() * LOSING_INDEXES.length)];
    
    // Calculate rotation (5-8 full spins + land on losing segment)
    const segmentAngle = 360 / SEGMENTS.length;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const targetAngle = fullSpins * 360 + (360 - winIndex * segmentAngle - segmentAngle / 2);
    
    setRotation(prev => prev + targetAngle);

    // Wait for spin to complete
    setTimeout(() => {
      setSpinning(false);
      setResult(SEGMENTS[winIndex].label);
      setShowResult(true);
      
      // Set cooldown
      localStorage.setItem("lastSpinTime", Date.now().toString());
      checkCooldown();
    }, 5000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900">
      {/* Monetag Auto Ads Script */}
      <Script 
        src="https://fpyf8.com/88/tag.min.js" 
        data-zone="188180"
        strategy="afterInteractive"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Spin & Win
            </h1>
            <p className="text-xs text-zinc-400">Try your luck for free cash!</p>
          </div>
        </div>
      </header>

      <main className="p-4 flex flex-col items-center">
        {/* Prize Info */}
        <div className="w-full max-w-sm mb-6">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm font-bold text-yellow-400">Win Amazing Prizes!</p>
                <p className="text-xs text-zinc-400">Spin the wheel for a chance to win ₹5, ₹10, or even ₹100!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spin Wheel */}
        <div className="relative mb-6">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-cyan-400 drop-shadow-lg" />
          </div>
          
          {/* Wheel Container */}
          <div 
            className="relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none"
            }}
          >
            <canvas 
              ref={canvasRef} 
              width={300} 
              height={300}
              className="drop-shadow-2xl"
            />
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl -z-10" />
        </div>

        {/* Cooldown or Spin Button */}
        {!canSpin ? (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-bold">Next Spin In</span>
            </div>
            <div className="text-3xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {cooldownTime}
            </div>
            <p className="text-xs text-zinc-500 mt-2">Come back later for another chance!</p>
          </div>
        ) : (
          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`
              px-12 py-4 rounded-2xl font-bold text-lg
              transition-all duration-300
              ${spinning 
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
              }
            `}
          >
            {spinning ? "Spinning..." : "🎰 SPIN NOW!"}
          </button>
        )}

        {/* Result Modal */}
        {showResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-white/10 text-center">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-xl font-bold text-white mb-2">{result}</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Don't give up! Come back tomorrow for another chance to win!
              </p>
              <button
                onClick={() => setShowResult(false)}
                className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold"
              >
                Try Again Tomorrow
              </button>
            </div>
          </div>
        )}

        {/* Ad Space Placeholder */}
        <div className="w-full max-w-sm mt-8 p-4 rounded-xl bg-zinc-800/50 border border-white/5 text-center">
          <p className="text-xs text-zinc-500">Advertisement</p>
          {/* Monetag ads will auto-fill here */}
        </div>

        {/* Rules */}
        <div className="w-full max-w-sm mt-6 p-4 rounded-xl bg-zinc-900/80 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-2">📋 Rules</h3>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li>• One free spin every 24 hours</li>
            <li>• Prizes are added directly to your wallet</li>
            <li>• Must be logged in to claim prizes</li>
            <li>• Prizes cannot be exchanged for real money</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
