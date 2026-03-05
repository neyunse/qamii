"use client";

import { useEffect, useState, useRef } from "react";
import { MessageSquare } from "lucide-react";
import Head from "next/head";

export default function ObsWidget({ obsKey, alignment = "center" }) {
  const [alerts, setAlerts] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    // 1. Make the body chroma-key green for OBS
    document.body.classList.remove("bg-black", "text-white");
    document.body.style.backgroundColor = "#00FF00";

    // 2. Poll the backend every 3 seconds to check for new alerts in the queue
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/widget/${obsKey}/poll`);
        if (res.ok) {
          const incomingAlerts = await res.json();
          if (incomingAlerts.length > 0) {
            incomingAlerts.forEach(alert => triggerAlert(alert));
          }
        }
      } catch (err) {
        // Silent catch for OBS, so we don't spam their renderer console
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [obsKey]);

  const triggerAlert = (newAlert) => {
    // Prevent duplicate processing based on alert ID if possible
    setAlerts(prev => {
      if (prev.some(a => a.id === newAlert.id)) return prev;
      return [...prev, newAlert];
    });

    // Play a subtle sound effect if available
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // reset to allow overlapping
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => { }); // Catch autoplay blocks
    }

    // Dismiss the alert after 8 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, 8000);
  };

  if (!obsKey) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* 
        This page has a completely transparent background because it's meant to be an OBS Browser Source. 
        It only renders when an alert is active.
      */}
      <div className={`fixed inset-0 overflow-hidden pointer-events-none flex flex-col justify-end pb-12 p-8 ${alignment === "left" ? "items-start" : alignment === "right" ? "items-end" : "items-center"
        }`}>
        <audio ref={audioRef} src="/notification.mp3" preload="auto" />

        <div className={`w-full max-w-lg space-y-4 flex flex-col justify-end ${alignment === "left" ? "items-start" : alignment === "right" ? "items-end" : "items-center"
          }`}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] translate-y-0 opacity-100 scale-100 animate-slide-up"
            >
              <div className="bg-black border border-zinc-800 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.05)] p-8 relative overflow-hidden pointer-events-auto">
                {/* Decorative Gradient Shine */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-zinc-200 shrink-0">
                      <MessageSquare className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-1">New Support</p>
                      <p className="text-3xl font-black text-white">
                        {alert.amountText}
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 relative">
                    <div className="absolute -left-[1px] top-6 bottom-6 w-[3px] bg-white rounded-r-full opacity-50"></div>
                    <p className="text-zinc-300 text-xl font-medium leading-relaxed italic pr-2">
                      "{alert.message}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
