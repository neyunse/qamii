"use client";

import { X } from "lucide-react";

export default function ConfirmModal({ isOpen, title, description, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
            <button onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-zinc-400 text-left text-sm mb-8 leading-relaxed whitespace-normal break-words">
            {description}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isDanger
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "bg-white text-black hover:bg-zinc-200"
                }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
