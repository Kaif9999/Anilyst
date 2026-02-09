"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CreditCard, Loader2, Check, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export default function IntegrationsPage() {
  const { data: session, status } = useSession();
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeKey, setStripeKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const userId = (session?.user as { id?: string })?.id ?? session?.user?.email ?? "";

  useEffect(() => {
    if (!userId || userId === "anonymous") {
      setChecking(false);
      return;
    }
    fetch(`${FASTAPI_URL}/api/integrations/stripe?user_id=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => {
        setStripeConnected(!!data?.connected);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [userId]);

  const handleConnectStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !stripeKey.trim()) {
      setMessage({ type: "error", text: "Please enter your Stripe secret key." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${FASTAPI_URL}/api/integrations/stripe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, stripe_secret_key: stripeKey.trim() }),
      });
      const data = await res.json();
      if (data?.connected) {
        setStripeConnected(true);
        setStripeKey("");
        setMessage({ type: "success", text: data?.message || "Stripe connected." });
      } else {
        setMessage({ type: "error", text: data?.message || "Failed to connect." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Request failed. Is the backend running?" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!userId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${FASTAPI_URL}/api/integrations/stripe`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!data?.connected) {
        setStripeConnected(false);
        setStripeKey("");
        setMessage({ type: "success", text: "Stripe disconnected." });
      } else {
        setMessage({ type: "error", text: data?.message || "Failed to disconnect." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Request failed." });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!userId || userId === "anonymous") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-2">Integrations</h1>
        <p className="text-gray-400">Sign in to connect your Stripe account and other integrations.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-2">Integrations</h1>
      <p className="text-gray-400 mb-6">
        Connect your accounts so the AI agent can analyze your data. Your keys are stored only for you and used only when you chat.
      </p>

      {/* Stripe */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#635bff]/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#635bff]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Stripe</h2>
            <p className="text-sm text-gray-400">Revenue, balance, customers, invoices</p>
          </div>
        </div>
        {stripeConnected ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm">Connected</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnectStripe}
              disabled={loading}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4 mr-1" />}
              Disconnect
            </Button>
          </div>
        ) : (
          <form onSubmit={handleConnectStripe} className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Stripe secret key</label>
            <input
              type="password"
              placeholder="sk_live_... or sk_test_..."
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500">
              Find it in Stripe Dashboard → Developers → API keys. Your key is stored only for your account and is never shared.
            </p>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect Stripe"}
            </Button>
          </form>
        )}
      </div>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
