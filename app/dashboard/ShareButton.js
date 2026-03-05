"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ShareButton({ url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts (like local network testing)
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Could not copy link to clipboard.");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
      title="Copy Link"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
    </button>
  );
}
