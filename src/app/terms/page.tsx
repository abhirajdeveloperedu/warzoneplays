"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">Terms of Service</h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400 mb-6">Last updated: November 27, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-300 leading-relaxed">
              By accessing and using Warzone Esports (warzoneplays.vercel.app), you accept and agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-zinc-300 leading-relaxed">
              Warzone Esports is an online gaming tournament platform that allows users to participate in competitive 
              gaming tournaments, win prizes, and engage with the gaming community. Our services include tournament 
              hosting, prize distribution, and related gaming features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">3. Eligibility</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">To use our services, you must:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Be at least 18 years old</li>
              <li>Have the legal capacity to enter into binding agreements</li>
              <li>Not be prohibited from using our services under applicable laws</li>
              <li>Provide accurate and complete registration information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">4. User Accounts</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">When creating an account, you agree to:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Not share your account credentials with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">5. Tournament Rules</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">Participants in tournaments must:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Follow all game-specific rules and guidelines</li>
              <li>Not use cheats, hacks, or exploits</li>
              <li>Respect other players and maintain sportsmanship</li>
              <li>Accept the results as determined by tournament administrators</li>
              <li>Not engage in match-fixing or collusion</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">6. Payments and Prizes</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">Regarding financial transactions:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>All entry fees are non-refundable once a tournament begins</li>
              <li>Prizes will be distributed according to tournament rules</li>
              <li>We reserve the right to withhold prizes for rule violations</li>
              <li>Users are responsible for any applicable taxes on winnings</li>
              <li>Withdrawal requests are processed within 24-48 hours</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">7. Prohibited Conduct</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">Users must not:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate others or provide false information</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to hack or disrupt our services</li>
              <li>Use automated systems or bots</li>
              <li>Engage in fraudulent activities</li>
              <li>Create multiple accounts for unfair advantage</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">8. Intellectual Property</h2>
            <p className="text-zinc-300 leading-relaxed">
              All content on our platform, including logos, graphics, text, and software, is the property of 
              Warzone Esports or its licensors and is protected by intellectual property laws. You may not copy, 
              modify, distribute, or reproduce any content without our written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-zinc-300 leading-relaxed">
              Our services are provided "as is" without warranties of any kind, either express or implied. We do not 
              guarantee that our services will be uninterrupted, secure, or error-free. You use our services at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
            <p className="text-zinc-300 leading-relaxed">
              To the maximum extent permitted by law, Warzone Esports shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages arising from your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">11. Account Termination</h2>
            <p className="text-zinc-300 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these terms or for 
              any other reason at our discretion. Upon termination, your right to use our services will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">12. Changes to Terms</h2>
            <p className="text-zinc-300 leading-relaxed">
              We may modify these Terms of Service at any time. We will notify users of significant changes by posting 
              a notice on our website. Your continued use of our services after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">13. Governing Law</h2>
            <p className="text-zinc-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to 
              its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">14. Contact Information</h2>
            <p className="text-zinc-300 leading-relaxed">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-4 bg-zinc-900 rounded-lg">
              <p className="text-zinc-300">Email: support@warzoneplays.com</p>
              <p className="text-zinc-300">Website: warzoneplays.vercel.app</p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-zinc-400">
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
          <Link href="/about" className="hover:text-white transition">About Us</Link>
          <Link href="/" className="hover:text-white transition">Home</Link>
        </div>
      </div>
    </div>
  );
}
