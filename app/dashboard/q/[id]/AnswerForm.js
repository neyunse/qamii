"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AnswerForm({ questionId }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/questions/${questionId}/answer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to submit answer");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-end">
      <div className="w-full">
        <label className="block text-sm font-medium leading-6 text-white mb-2">
          Your Answer
        </label>
        <textarea
          required
          rows={6}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your response here..."
          className="block w-full rounded-lg border-0 bg-zinc-900/50 py-3 text-white ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6 px-4 resize-none transition-all"
        />
      </div>

      {error && (
        <div className="w-full text-red-400 bg-red-500/10 p-3 text-sm rounded-lg border border-red-500/20">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || answer.length < 2}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Answer"}
      </button>
    </form>
  );
}
