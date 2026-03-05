"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerificationBanner() {
  const [isResending, setIsResending] = useState(false);

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

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-500 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-sm font-medium">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>Please verify your email to unlock all features, like connecting MercadoPago and receiving payments.</span>
      </div>
      <button
        onClick={handleResendVerification}
        disabled={isResending}
        className="shrink-0 flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
      >
        {isResending ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Sending...
          </>
        ) : (
          "Resend Verification Email"
        )}
      </button>
    </div>
  );
}
