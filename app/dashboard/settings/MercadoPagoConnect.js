"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function MercadoPagoConnect({ isConnected, isVerified }) {
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    if (!isVerified) {
      toast.error("Please verify your email before connecting MercadoPago.");
      return;
    }
    setLoading(true);
    try {
      // First get the authorization URL
      const res = await fetch("/api/mp/auth-url");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not generate MercadoPago link. Check developer credentials.");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Error connecting to MercadoPago");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      if (isResending) return;
      setIsResending(true);
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Verification email sent! Check your inbox.");
      } else {
        toast.error(data.message || "Failed to resend verification email.");
      }
    } catch (err) {
      toast.error("Network error resending verification.");
    } finally {
      setIsResending(false);
    }
  };

  const handleDisconnect = () => {
    setShowDisconnectModal(true);
  };

  const confirmDisconnect = async () => {
    setShowDisconnectModal(false);
    setLoading(true);
    try {
      const res = await fetch("/api/mp/disconnect", {
        method: "POST"
      });

      if (res.ok) {
        toast.success("Disconnected successfully.");
        router.refresh();
      } else {
        toast.error("Failed to disconnect account");
      }
    } catch (err) {
      toast.error("Error disconnecting from MercadoPago");
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 text-emerald-400">
        <div className="flex items-start md:items-center gap-4">
          <CheckCircle2 className="w-8 h-8 shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">MercadoPago Connected</h3>
            <p className="text-emerald-500/80 text-sm">
              Your account is ready to receive payments from fans.
            </p>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="shrink-0 flex items-center justify-center gap-2 border border-red-900/50 hover:bg-red-950/30 text-red-500 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Disconnect
        </button>

        <ConfirmModal
          isOpen={showDisconnectModal}
          title="Disconnect MercadoPago"
          description="Are you sure you want to disconnect? You will no longer be able to receive payments from fans until you reconnect."
          confirmText="Yes, disconnect"
          cancelText="Cancel"
          isDanger={true}
          onConfirm={confirmDisconnect}
          onCancel={() => setShowDisconnectModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h3 className="text-white font-bold text-lg mb-1">Not Connected</h3>
        <p className="text-zinc-400 text-sm max-w-md">
          You must connect a MercadoPago account to accept paid questions. It only takes a minute.
        </p>
      </div>

      {!isVerified && !isConnected && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-xl text-sm mb-4 font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span>Please verify your email to connect payments.</span>
          <button onClick={handleResendVerification} disabled={isResending} className="shrink-0 text-amber-400 bg-amber-500/20 hover:bg-amber-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
            {isResending ? "Sending..." : "Resend Email"}
          </button>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={loading || !isVerified}
        className="shrink-0 flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>
            Connect MP
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </button>
    </div>
  );
}
