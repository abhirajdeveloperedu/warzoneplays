"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400 mb-6">Last updated: November 27, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-zinc-300 leading-relaxed">
              Welcome to Warzone Esports ("we," "our," or "us"). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you visit our website warzoneplays.vercel.app and use our gaming tournament platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">We collect information that you provide directly to us:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Account information (email address, username, password)</li>
              <li>Profile information (gaming IDs, nicknames)</li>
              <li>Transaction data (deposits, withdrawals, tournament entries)</li>
              <li>Communication data (support requests, feedback)</li>
              <li>Device information (IP address, browser type, operating system)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">We use the collected information for:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Providing and maintaining our gaming tournament services</li>
              <li>Processing transactions and sending related information</li>
              <li>Sending promotional communications (with your consent)</li>
              <li>Responding to your comments, questions, and requests</li>
              <li>Monitoring and analyzing trends, usage, and activities</li>
              <li>Detecting, preventing, and addressing fraud and technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">4. Information Sharing</h2>
            <p className="text-zinc-300 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information 
              only in the following situations:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 mt-4">
              <li>With your consent or at your direction</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-zinc-300 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. 
              Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct 
              your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">6. Third-Party Advertising</h2>
            <p className="text-zinc-300 leading-relaxed">
              We may use third-party advertising companies to serve ads when you visit our website. These companies may use 
              information about your visits to this and other websites to provide advertisements about goods and services of 
              interest to you. This includes Google AdSense and other advertising partners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">7. Data Security</h2>
            <p className="text-zinc-300 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information. 
              However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">8. Your Rights</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">9. Children's Privacy</h2>
            <p className="text-zinc-300 leading-relaxed">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children under 18. If we become aware that we have collected personal information from a 
              child under 18, we will take steps to delete that information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
            <p className="text-zinc-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">11. Contact Us</h2>
            <p className="text-zinc-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-zinc-900 rounded-lg">
              <p className="text-zinc-300">Email: support@warzoneplays.com</p>
              <p className="text-zinc-300">Website: warzoneplays.vercel.app</p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-zinc-400">
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white transition">Contact Us</Link>
          <Link href="/about" className="hover:text-white transition">About Us</Link>
          <Link href="/" className="hover:text-white transition">Home</Link>
        </div>
      </div>
    </div>
  );
}
