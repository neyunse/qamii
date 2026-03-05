"use client";

import { useState } from "react";
import { Copy, Plus, Loader2, Send, Wand2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function IntegrationsClient({ initialData, publicUrl }) {
  const [discordWebhook, setDiscordWebhook] = useState(initialData.discordWebhook || "");
  const [obsKey, setObsKey] = useState(initialData.obsKey || "");
  const [obsAlignment, setObsAlignment] = useState(initialData.obsOverlayAlignment || "center");

  const [loading, setLoading] = useState(false);
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [testingObs, setTestingObs] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const obsUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/widget/${obsKey}`;

  // Embedded button snippets
  const embedCodeThemeDark = `<a href="${publicUrl}" target="_blank" style="display:inline-block;background-color:#000000;color:#ffffff;padding:12px 24px;border:1px solid #333333;border-radius:8px;font-family:sans-serif;font-weight:bold;text-decoration:none;font-size:14px;box-shadow:0 4px 6px rgba(0,0,0,0.1);transition:all 0.2s;">Ask me on QAmii</a>`;
  const embedCodeThemeLight = `<a href="${publicUrl}" target="_blank" style="display:inline-block;background-color:#ffffff;color:#000000;padding:12px 24px;border:1px solid #e5e5e5;border-radius:8px;font-family:sans-serif;font-weight:bold;text-decoration:none;font-size:14px;box-shadow:0 4px 6px rgba(0,0,0,0.05);transition:all 0.2s;">Ask me on QAmii</a>`;

  const handleSaveDiscord = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook: discordWebhook })
      });
      if (res.ok) {
        toast.success("Discord Webhook saved successfully");
      } else {
        toast.error("Failed to save Discord Webhook");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleTestDiscord = async () => {
    if (!discordWebhook) return toast.error("Please enter a Webhook URL first");
    setTestingDiscord(true);
    try {
      const res = await fetch("/api/integrations/discord/test", { method: "POST" });
      if (res.ok) toast.success("Test sent! Check your Discord channel.");
      else toast.error("Test failed. Check the URL.");
    } catch {
      toast.error("Network error");
    } finally {
      setTestingDiscord(false);
    }
  };

  const handleCopy = (text, type = "Link") => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${type} copied to clipboard!`))
      .catch(() => toast.error("Failed to copy"));
  };

  const handleResetObsKey = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/obs/reset", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setObsKey(data.obsKey);
        toast.success("OBS Key regenerated. Update your OBS source!");
      } else {
        toast.error("Failed to reset key.");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleTestObs = async () => {
    if (!obsKey) return toast.error("No OBS key found.");
    setTestingObs(true);
    try {
      const res = await fetch("/api/integrations/obs/test", { method: "POST" });
      if (res.ok) toast.success("Test alert dispatched! Check your OBS.");
      else toast.error("Failed to send test alert.");
    } catch {
      toast.error("Network error");
    } finally {
      setTestingObs(false);
    }
  };

  const handleSaveObsSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/obs/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alignment: obsAlignment })
      });
      if (res.ok) toast.success("OBS Settings saved!");
      else toast.error("Failed to save settings.");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Discord Webhooks */}
      <section className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/10">
          <div className="w-10 h-10 rounded-lg bg-[#5865F2]/10 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 127.14 96.36" fill="#5865F2" xmlns="http://www.w3.org/2000/svg"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.67,77.67,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Discord Webhooks</h2>
            <p className="text-zinc-400 mt-1 text-sm">Automatically announce new paid questions directly into your Discord server.</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold leading-6 text-zinc-300 mb-2">
              Webhook URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 px-4 text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-0 outline-none transition-colors sm:text-sm font-mono"
              />
              <button
                onClick={handleSaveDiscord}
                disabled={loading}
                className="shrink-0 bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Webhook"}
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-400">Make sure to save before testing. The test ping uses the currently saved URL.</span>
            <button
              onClick={handleTestDiscord}
              disabled={testingDiscord || !discordWebhook}
              className="shrink-0 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 border border-zinc-700"
            >
              {testingDiscord ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Test
            </button>
          </div>
        </div>
      </section>

      {/* 2. OBS Overlay */}
      <section className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/10">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Stream Alerts Overlay (OBS)</h2>
            <p className="text-zinc-400 mt-1 text-sm">Add QAmii to OBS as a Browser Source to show beautiful live popups when fans ask questions.</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              Widget Settings
              <button
                onClick={handleSaveObsSettings}
                disabled={loading}
                className="bg-white text-black hover:bg-zinc-200 px-4 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Save Settings"}
              </button>
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Display Alignment</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 max-w-sm">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    onClick={() => setObsAlignment(align)}
                    className={`flex-1 flex justify-center py-2 text-xs font-bold capitalize transition-all rounded-md ${obsAlignment === align
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                      }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">Determines where the alerts stack on the screen (requires refreshing the OBS source).</p>
            </div>
          </div>

          <div className="border-t border-zinc-800/50 pt-8">
            <label className="block text-sm font-bold leading-6 text-zinc-300 mb-2">
              Your Secret Widget URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3 relative">
              <input
                type="text"
                value={obsUrl}
                readOnly
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 px-4 text-zinc-500 focus:outline-none sm:text-sm font-mono tracking-wider select-all"
              />
              <button
                onClick={() => handleCopy(obsUrl, "Widget URL")}
                className="shrink-0 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors border border-zinc-700"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </button>
            </div>
            <p className="text-xs text-red-400/80 font-medium mt-2">DANGER: Do not show this URL on stream. Anyone with this link can fake alerts on your screen.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleTestObs}
              disabled={testingObs || !obsKey}
              className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg px-4 py-3 text-sm font-bold transition-colors disabled:opacity-50 border border-emerald-500/20"
            >
              {testingObs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Send Test Alert to OBS
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg px-4 py-3 text-sm font-bold transition-colors disabled:opacity-50 border border-zinc-800"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Key
            </button>
          </div>
        </div>
      </section>

      {/* 3. Embed HTML Buttons */}
      <section className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/10">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500 w-5 h-5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Website HTML Buttons</h2>
            <p className="text-zinc-400 mt-1 text-sm">Copy and paste these snippets into your Wordpress, Carrd, or personal site.</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Dark Button */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-300">Dark Theme Button</span>
              <div dangerouslySetInnerHTML={{ __html: embedCodeThemeDark }} />
            </div>
            <div className="relative group">
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs text-zinc-500 font-mono leading-relaxed">
                {embedCodeThemeDark}
              </pre>
              <button
                onClick={() => handleCopy(embedCodeThemeDark, "HTML")}
                className="absolute top-3 right-3 p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Light Button */}
          <div className="space-y-4 pt-6 border-t border-zinc-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-300">Light Theme Button</span>
              <div dangerouslySetInnerHTML={{ __html: embedCodeThemeLight }} className="p-2 bg-white rounded-xl border border-zinc-200" />
            </div>
            <div className="relative group">
              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs text-zinc-500 font-mono leading-relaxed">
                {embedCodeThemeLight}
              </pre>
              <button
                onClick={() => handleCopy(embedCodeThemeLight, "HTML")}
                className="absolute top-3 right-3 p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Regenerate OBS Key?"
        description="If you regenerate your key, your current OBS widget will immediately break. You will need to update OBS with the new URL."
        onConfirm={handleResetObsKey}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Yes, break my old link"
        isDanger={true}
      />
    </div>
  );
}
