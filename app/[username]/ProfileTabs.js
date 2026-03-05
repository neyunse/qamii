"use client";

import { useState } from "react";

export default function ProfileTabs({ askForm, answersList }) {
  const [activeTab, setActiveTab] = useState("ask");

  return (
    <div className="w-full">
      <div className="flex bg-[#0f0f0f] border border-zinc-800 p-2 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab("ask")}
          className={`flex-1 py-3 text-center text-sm font-bold transition-colors rounded-xl ${activeTab === "ask"
            ? "bg-white text-black"
            : "text-zinc-500 hover:text-zinc-400"
            }`}
        >
          Ask a Question
        </button>
        <button
          onClick={() => setActiveTab("answers")}
          className={`flex-1 py-3 text-center text-sm font-bold transition-colors rounded-xl ${activeTab === "answers"
            ? "bg-white text-black"
            : "text-zinc-500 hover:text-zinc-400"
            }`}
        >
          Recent Answers
        </button>
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === "ask" ? askForm : answersList}
      </div>
    </div>
  );
}
