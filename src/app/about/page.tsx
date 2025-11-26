"use client";

import Link from "next/link";
import { ArrowLeft, Gamepad2, Users, Trophy, Target, Zap, Shield, Heart, Globe } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">About Us</h1>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 mb-6">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Warzone Esports
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            India's premier mobile gaming tournament platform, connecting passionate gamers 
            with competitive opportunities and exciting rewards.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-4">Our Story</h3>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Founded in 2025, Warzone Esports was born from a simple vision: to create a platform where 
            mobile gamers across India can compete, improve, and win. We understand the passion that 
            drives competitive gaming, and we're here to fuel that fire.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            What started as a small community has grown into a thriving ecosystem of thousands of players, 
            competing in daily tournaments across popular titles like Free Fire, BGMI, and Call of Duty Mobile.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
            <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">10K+</p>
            <p className="text-sm text-zinc-400">Active Players</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">500+</p>
            <p className="text-sm text-zinc-400">Tournaments Hosted</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
            <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">₹10L+</p>
            <p className="text-sm text-zinc-400">Prizes Distributed</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
            <Globe className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">24/7</p>
            <p className="text-sm text-zinc-400">Support Available</p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <Target className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-zinc-300 leading-relaxed">
              To democratize esports by providing accessible, fair, and exciting tournament experiences 
              for mobile gamers of all skill levels. We believe everyone deserves a chance to compete 
              and win.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <Zap className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
            <p className="text-zinc-300 leading-relaxed">
              To become the leading esports platform in India, nurturing the next generation of 
              professional gamers and creating pathways to success in competitive gaming.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Our Values</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-white/10 text-center">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Fair Play</h4>
              <p className="text-sm text-zinc-400">
                We maintain strict anti-cheat measures and ensure every match is fair.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-white/10 text-center">
              <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Community First</h4>
              <p className="text-sm text-zinc-400">
                Our players are at the heart of everything we do.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-white/10 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-2">Innovation</h4>
              <p className="text-sm text-zinc-400">
                We continuously improve our platform with new features.
              </p>
            </div>
          </div>
        </section>

        {/* Games We Support */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Games We Support</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 text-center">
              <span className="text-3xl mb-2 block">🔥</span>
              <p className="font-semibold text-white">Free Fire</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 text-center">
              <span className="text-3xl mb-2 block">🎮</span>
              <p className="font-semibold text-white">BGMI</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 text-center">
              <span className="text-3xl mb-2 block">🪖</span>
              <p className="font-semibold text-white">COD Mobile</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 text-center">
              <span className="text-3xl mb-2 block">🎯</span>
              <p className="font-semibold text-white">Valorant</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mb-12 p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Compete?</h3>
          <p className="text-zinc-400 mb-6">
            Join thousands of gamers and start your esports journey today!
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
          >
            <Gamepad2 className="w-5 h-5" />
            Start Playing
          </Link>
        </section>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-zinc-400">
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
          <Link href="/" className="hover:text-white transition">Home</Link>
        </div>
      </div>
    </div>
  );
}
