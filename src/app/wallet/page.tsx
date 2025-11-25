"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import MobileLayout from "@/components/MobileLayout";
import { 
  Wallet, Plus, Minus, TrendingUp, TrendingDown, Trophy, 
  ArrowUpRight, ArrowDownRight, Clock, Upload, QrCode,
  CheckCircle, XCircle, X, Camera, AlertCircle
} from "lucide-react";

type Transaction = {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  description: string;
  created_at: string;
};

type PaymentRequest = {
  id: string;
  type: string;
  amount: number;
  status: string;
  screenshot_url?: string;
  upi_id?: string;
  admin_note?: string;
  created_at: string;
};

type PlatformSettings = {
  upi_id: string | null;
  upi_qr_url: string | null;
  min_deposit: number;
  min_withdraw: number;
};

export default function WalletPage() {
  const pathname = usePathname();
  const { user, profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  
  // Modals
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  
  // Add Money State
  const [depositAmount, setDepositAmount] = useState("");
  const [depositStep, setDepositStep] = useState<'amount' | 'pay' | 'upload'>('amount');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount and navigation
  useEffect(() => {
    loadSettings();
    if (user) {
      loadWalletData();
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, [user, pathname]);

  async function loadSettings() {
    const { data } = await supabase
      .from("platform_settings")
      .select("upi_id, upi_qr_url, min_deposit, min_withdraw")
      .eq("id", "main")
      .single();
    if (data) setSettings(data);
  }

  async function loadWalletData() {
    if (!user) return;
    setLoading(true);
    try {
      // Load transactions
      const { data: txns } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (txns) setTransactions(txns);

      // Load payment requests
      const { data: requests } = await supabase
        .from("payment_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (requests) setPaymentRequests(requests);
    } finally {
      setLoading(false);
    }
  }

  async function handleDepositSubmit() {
    if (!user || !screenshot || !depositAmount) return;
    
    setUploading(true);
    try {
      let screenshotUrl = "";
      
      // Try to upload screenshot to tournament-images bucket
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `payments/${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("tournament-images")
        .upload(fileName, screenshot);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Continue without screenshot URL - admin can contact user
      } else {
        const { data: urlData } = supabase.storage
          .from("tournament-images")
          .getPublicUrl(fileName);
        screenshotUrl = urlData.publicUrl;
      }

      // Create payment request
      const { error: requestError } = await supabase
        .from("payment_requests")
        .insert({
          user_id: user.id,
          type: "deposit",
          amount: parseInt(depositAmount),
          status: "pending",
          screenshot_url: screenshotUrl || null
        });

      if (requestError) {
        console.error("Request error:", requestError);
        alert("Failed to submit request: " + requestError.message);
        return;
      }

      alert("Deposit request submitted! Admin will review and add money to your wallet.");
      setShowAddMoney(false);
      setDepositAmount("");
      setDepositStep('amount');
      setScreenshot(null);
      loadWalletData();
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleWithdrawSubmit() {
    if (!user || !withdrawAmount || !withdrawUpi) return;
    
    const amount = parseInt(withdrawAmount);
    const currentBalance = profile?.coins || 0;
    const minWithdraw = settings?.min_withdraw || 50;

    if (amount > currentBalance) {
      alert("Insufficient balance!");
      return;
    }

    if (amount < minWithdraw) {
      alert(`Minimum withdrawal is ₹${minWithdraw}`);
      return;
    }

    setWithdrawing(true);
    try {
      // Deduct amount immediately
      const newBalance = currentBalance - amount;
      
      const { error: balanceError } = await supabase
        .from("users")
        .update({ coins: newBalance })
        .eq("id", user.id);

      if (balanceError) {
        alert("Failed to process withdrawal. Please try again.");
        return;
      }

      // Create transaction record
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        amount: -amount,
        balance_after: newBalance,
        type: "withdrawal",
        description: `Withdrawal request to ${withdrawUpi}`,
      });

      // Create payment request
      const { error: requestError } = await supabase
        .from("payment_requests")
        .insert({
          user_id: user.id,
          type: "withdraw",
          amount: amount,
          status: "pending",
          upi_id: withdrawUpi
        });

      if (requestError) {
        console.error("Request error:", requestError);
      }

      await refreshProfile();
      alert("Withdrawal request submitted! Amount will be sent to your UPI within 24 hours.");
      setShowWithdraw(false);
      setWithdrawAmount("");
      setWithdrawUpi("");
      loadWalletData();
    } finally {
      setWithdrawing(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  if (!user) {
    return (
      <MobileLayout>
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
          <Wallet className="w-16 h-16 text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to view Wallet</h2>
          <p className="text-zinc-400 text-sm text-center mb-4">
            Access your balance, add money, and withdraw funds
          </p>
          <Link
            href="/auth"
            className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold"
          >
            Sign In
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 p-6">
          <p className="text-sm text-zinc-400 mb-1">Available Balance</p>
          <h1 className="text-4xl font-bold text-white mb-4">
            ₹{profile?.coins?.toLocaleString() || 0}
          </h1>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowAddMoney(true)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 text-black font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Money
            </button>
            <button
              onClick={() => setShowWithdraw(true)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white font-semibold border border-white/20"
            >
              <Minus className="w-5 h-5" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Pending Requests */}
        {paymentRequests.filter(r => r.status === 'pending').length > 0 && (
          <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4">
            <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Requests
            </h3>
            <div className="space-y-2">
              {paymentRequests.filter(r => r.status === 'pending').map(req => (
                <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                  <div>
                    <p className="text-sm text-white capitalize">{req.type}</p>
                    <p className="text-xs text-zinc-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-yellow-400">₹{req.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="rounded-xl bg-zinc-900 border border-white/10 p-4">
          <h3 className="text-base font-semibold text-white mb-4">Recent Transactions</h3>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      txn.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {txn.amount > 0 ? (
                        <ArrowDownRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white">{txn.description || txn.type}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(txn.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${txn.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount)}
                    </p>
                    <p className="text-xs text-zinc-500">Bal: ₹{txn.balance_after}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Request History */}
        {paymentRequests.length > 0 && (
          <div className="rounded-xl bg-zinc-900 border border-white/10 p-4">
            <h3 className="text-base font-semibold text-white mb-4">Request History</h3>
            <div className="space-y-2">
              {paymentRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      req.type === 'deposit' ? 'bg-green-500/20' : 'bg-orange-500/20'
                    }`}>
                      {req.type === 'deposit' ? (
                        <Plus className="w-4 h-4 text-green-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-orange-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white capitalize">{req.type}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">₹{req.amount}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90">
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Add Money</h3>
              <button onClick={() => {
                setShowAddMoney(false);
                setDepositStep('amount');
                setDepositAmount("");
                setScreenshot(null);
              }} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            <div className="p-4">
              {depositStep === 'amount' && (
                <>
                  <p className="text-sm text-zinc-400 mb-4">Enter amount to add</p>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={`Enter amount (min ₹${settings?.min_deposit || 50})`}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-lg mb-4"
                  />
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[100, 250, 500, 1000, 2000, 5000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setDepositAmount(amt.toString())}
                        className={`py-2 rounded-lg border ${
                          depositAmount === amt.toString()
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                            : 'bg-white/5 border-white/10 text-white'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const minDeposit = settings?.min_deposit || 50;
                      if (parseInt(depositAmount) >= minDeposit) {
                        setDepositStep('pay');
                      } else {
                        alert(`Minimum amount is ₹${minDeposit}`);
                      }
                    }}
                    disabled={!depositAmount || parseInt(depositAmount) < (settings?.min_deposit || 50)}
                    className="w-full py-3 rounded-xl bg-cyan-500 text-black font-semibold disabled:opacity-50"
                  >
                    Continue
                  </button>
                </>
              )}

              {depositStep === 'pay' && (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-zinc-400 mb-2">Scan QR or pay to UPI ID</p>
                    <div className="bg-white p-4 rounded-xl inline-block mb-3">
                      {settings?.upi_qr_url ? (
                        <img src={settings.upi_qr_url} alt="UPI QR" className="w-32 h-32 object-contain" />
                      ) : (
                        <QrCode className="w-32 h-32 text-black" />
                      )}
                    </div>
                    <p className="text-lg font-bold text-white mb-1">₹{depositAmount}</p>
                    <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                      <p className="text-sm text-cyan-400 font-mono">{settings?.upi_id || "UPI ID not configured"}</p>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      Pay exactly ₹{depositAmount} to the above UPI ID
                    </p>
                  </div>
                  <button
                    onClick={() => setDepositStep('upload')}
                    className="w-full py-3 rounded-xl bg-cyan-500 text-black font-semibold"
                  >
                    I have paid, Upload Screenshot
                  </button>
                </>
              )}

              {depositStep === 'upload' && (
                <>
                  <p className="text-sm text-zinc-400 mb-4">Upload payment screenshot</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 rounded-xl border-2 border-dashed border-white/20 hover:border-cyan-500/50 transition mb-4"
                  >
                    {screenshot ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">{screenshot.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <Camera className="w-8 h-8" />
                        <span>Tap to select screenshot</span>
                      </div>
                    )}
                  </button>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-4">
                    <p className="text-xs text-yellow-400">
                      ⚠️ Make sure screenshot shows transaction ID and amount clearly
                    </p>
                  </div>

                  <button
                    onClick={handleDepositSubmit}
                    disabled={!screenshot || uploading}
                    className="w-full py-3 rounded-xl bg-cyan-500 text-black font-semibold disabled:opacity-50"
                  >
                    {uploading ? "Submitting..." : "Submit Request"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90">
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Withdraw Money</h3>
              <button onClick={() => {
                setShowWithdraw(false);
                setWithdrawAmount("");
                setWithdrawUpi("");
              }} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="p-3 rounded-lg bg-zinc-800 mb-4">
                <p className="text-xs text-zinc-400">Available Balance</p>
                <p className="text-xl font-bold text-white">₹{profile?.coins || 0}</p>
              </div>

              <div className="mb-4">
                <label className="text-sm text-zinc-400 mb-2 block">Amount to withdraw</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Enter amount (min ₹${settings?.min_withdraw || 50})`}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm text-zinc-400 mb-2 block">Your UPI ID</label>
                <input
                  type="text"
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  placeholder="yourname@paytm"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white"
                />
              </div>

              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-4">
                <p className="text-xs text-yellow-400">
                  ⚠️ Amount will be sent to your UPI within 24 hours after verification
                </p>
              </div>

              <button
                onClick={handleWithdrawSubmit}
                disabled={!withdrawAmount || !withdrawUpi || withdrawing || parseInt(withdrawAmount) > (profile?.coins || 0)}
                className="w-full py-3 rounded-xl bg-cyan-500 text-black font-semibold disabled:opacity-50"
              >
                {withdrawing ? "Processing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
