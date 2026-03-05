"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function QuestionForm({ username, currency = "ARS", minAmount = 500 }) {
  const [content, setContent] = useState("");
  const [fanEmail, setFanEmail] = useState("");
  const [amount, setAmount] = useState(minAmount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const step = ["ARS", "CLP", "COP", "UYU"].includes(currency) ? 100 : 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          content,
          fanEmail,
          amount,
          currency,
        }),
      });

      const data = await res.json();

      if (res.ok && data.init_point) {
        // Redirect to MercadoPago checkout
        window.location.href = data.init_point;
      } else {
        setError(data.message || "Failed to create checkout");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div>
        <label className="block text-sm font-bold leading-6 text-zinc-200 mb-2">
          Your Question
        </label>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you want to ask?"
          className="block w-full rounded-xl border border-zinc-800 bg-black py-4 px-5 text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-0 sm:text-base outline-none resize-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-bold leading-6 text-zinc-200 mb-2">
          Notify me when answered <span className="text-zinc-500 font-normal">(Optional)</span>
        </label>
        <input
          type="email"
          value={fanEmail}
          onChange={(e) => setFanEmail(e.target.value)}
          placeholder="your@email.com (Kept strictly private)"
          className="block w-full rounded-xl border border-zinc-800 bg-black py-3 px-5 text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-0 sm:text-sm outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-bold leading-6 text-zinc-200 mb-2">
          Support Amount (Min ${minAmount} {currency})
        </label>
        <div className="relative rounded-xl border border-zinc-800 bg-black flex items-center px-5 py-2 focus-within:border-zinc-500 transition-colors">
          <span className="text-zinc-500 font-bold text-lg mr-2 whitespace-nowrap">{currency} $</span>
          <input
            type="number"
            required
            min={minAmount}
            step={step}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full bg-transparent border-0 text-white text-xl font-bold p-0 focus:ring-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="flex flex-col ml-2 border border-zinc-800 rounded-md overflow-hidden bg-zinc-900 w-6 shrink-0">
            <button type="button" onClick={() => setAmount(p => Number(p) + step)} className="h-4 flex items-center justify-center hover:bg-zinc-800 border-b border-zinc-800 text-zinc-400">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={() => setAmount(p => Math.max(minAmount, Number(p) - step))} className="h-4 flex items-center justify-center hover:bg-zinc-800 text-zinc-400">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm font-medium mt-2">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || content.length < 5 || amount < minAmount}
        className="mt-8 flex w-full items-center justify-center rounded-xl bg-zinc-500 px-6 py-4 text-base font-bold text-black border-2 border-transparent hover:bg-zinc-400 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Pay $${amount} & Ask`}
      </button>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500 bg-zinc-900/50 py-3 rounded-xl border border-zinc-800">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 opacity-70" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#71717a" /><path d="M15.5 9.5L10.5 14.5L8.5 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>Secured by MercadoPago</span>
      </div>
    </form>
  );
}
