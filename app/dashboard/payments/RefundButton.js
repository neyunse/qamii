"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { CURRENCY_MAP } from "@/lib/constants";

export default function RefundButton({ questionId, paymentId, amount, currency }) {
  const [loading, setLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const router = useRouter();

  const handleRefund = () => {
    if (!paymentId) {
      toast.error("Cannot refund: No MercadoPago payment ID associated with this transaction.");
      return;
    }
    setShowRefundModal(true);
  };

  const confirmRefund = async () => {
    setShowRefundModal(false);
    setLoading(true);
    try {
      const res = await fetch("/api/mp/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, paymentId }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Refund processed successfully.");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to process refund.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred while processing the refund.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleRefund}
        disabled={loading}
        className="text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px] ml-auto"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refund"}
      </button>

      <ConfirmModal
        isOpen={showRefundModal}
        title="Confirm Refund"
        description={`Are you sure you want to refund ${currency} $${amount} to the fan? This will be deducted from your MercadoPago account balance. This action cannot be undone.`}
        confirmText="Issue Refund"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={confirmRefund}
        onCancel={() => setShowRefundModal(false)}
      />
    </>
  );
}
