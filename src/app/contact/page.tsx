"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Send, MapPin, Clock, CheckCircle } from "lucide-react";

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">Contact Us</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
            <p className="text-zinc-400 mb-8">
              Have questions, feedback, or need support? We're here to help! Reach out to us through 
              any of the channels below or fill out the contact form.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-cyan-500/10">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email</h3>
                  <p className="text-zinc-400">support@warzoneplays.com</p>
                  <p className="text-zinc-500 text-sm">We respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Live Chat</h3>
                  <p className="text-zinc-400">Available on our platform</p>
                  <p className="text-zinc-500 text-sm">For registered users</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Clock className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Support Hours</h3>
                  <p className="text-zinc-400">24/7 Support Available</p>
                  <p className="text-zinc-500 text-sm">We're always here for you</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <MapPin className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Location</h3>
                  <p className="text-zinc-400">India</p>
                  <p className="text-zinc-500 text-sm">Serving gamers worldwide</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-zinc-400 hover:text-white">
                  Discord
                </a>
                <a href="#" className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-zinc-400 hover:text-white">
                  Telegram
                </a>
                <a href="#" className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-zinc-400 hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-zinc-400">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="mt-6 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-white focus:border-cyan-500 focus:outline-none transition"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-white focus:border-cyan-500 focus:outline-none transition"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Subject</label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-white focus:border-cyan-500 focus:outline-none transition"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="payment">Payment Issue</option>
                      <option value="tournament">Tournament Question</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-white focus:border-cyan-500 focus:outline-none transition resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-zinc-400">
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          <Link href="/about" className="hover:text-white transition">About Us</Link>
          <Link href="/" className="hover:text-white transition">Home</Link>
        </div>
      </div>
    </div>
  );
}
