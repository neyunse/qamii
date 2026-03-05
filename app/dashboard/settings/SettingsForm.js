"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/r2";

export default function SettingsForm({ initialData }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [platformFeePercentage, setPlatformFeePercentage] = useState(initialData.platformFeePercentage || 10);
  const [currency, setCurrency] = useState(initialData.currency || "ARS");
  const [minAmount, setMinAmount] = useState(initialData.minAmount || 500);
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || "");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.avatarUrl); // We store the plain key in state, getImageUrl will handle the proxy mapping
        setMessage({ type: "success", text: "Avatar updated successfully!" });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || "Failed to upload avatar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred uploading the avatar." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, platformFeePercentage, currency, minAmount }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || "Something went wrong" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      <div>
        <label className="block text-lg font-black leading-6 text-black uppercase tracking-wider mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-x-6">
          {avatarUrl ? (
            <img
              src={getImageUrl(avatarUrl)}
              alt="Avatar Preview"
              className="h-24 w-24 object-cover bg-zinc-900 border border-zinc-800 rounded-md"
            />
          ) : (
            <div className="h-24 w-24 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center">
              <span className="text-zinc-400 font-black uppercase tracking-tighter text-sm">No img</span>
            </div>
          )}

          <label className="cursor-pointer relative overflow-hidden bg-zinc-900 px-6 py-4 text-sm font-black text-white hover:bg-zinc-800 transition-all border border-zinc-800 rounded-md uppercase tracking-widest">
            {uploadingAvatar ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> UPLOADING
              </span>
            ) : (
              <span>CHANGE AVATAR</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-lg font-black leading-6 text-black uppercase tracking-wider mb-2">
          Username (Public URL)
        </label>
        <div className="flex border border-zinc-800 max-w-lg bg-zinc-900 rounded-md">
          <span className="flex select-none items-center pl-4 text-zinc-400 font-black sm:text-lg">
            qamii.com/
          </span>
          <input
            type="text"
            disabled
            value={initialData.username}
            className="block flex-1 border-0 bg-transparent py-4 pl-1 text-white font-bold focus:ring-0 sm:text-lg"
          />
        </div>
        <p className="mt-3 text-sm font-bold text-white uppercase">Your username cannot be changed.</p>
      </div>
      <div>
        <label className="block text-lg font-black leading-6 text-white uppercase tracking-wider mb-2">
          Display Name
        </label>
        <div className="mt-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="block w-full max-w-lg border border-zinc-800 bg-zinc-900 py-4 text-white font-bold placeholder:text-zinc-500 focus:ring-0 focus:outline-none focus:border-white transition-colors rounded-md sm:text-lg px-4"
            placeholder="HOW YOU WANT TO BE CALLED"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-black leading-6 text-white uppercase tracking-wider mb-2">
          Bio
        </label>
        <div className="mt-2">
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="block w-full max-w-lg border border-zinc-800 bg-zinc-900 py-4 text-white font-bold placeholder:text-zinc-500 focus:ring-0 focus:outline-none focus:border-white transition-colors rounded-md sm:text-lg px-4"
            placeholder="TELL YOUR FANS ABOUT YOURSELF."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-lg">
        <div>
          <label className="block text-lg font-black leading-6 text-white uppercase tracking-wider mb-2">
            Currency
          </label>
          <div className="mt-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="block w-full border border-zinc-800 bg-zinc-900 py-4 text-white font-bold focus:ring-0 focus:outline-none focus:border-white transition-colors rounded-md sm:text-lg px-4 cursor-pointer appearance-none"
            >
              <option value="ARS">ARS (Argentine Peso)</option>
              <option value="BRL">BRL (Brazilian Real)</option>
              <option value="CLP">CLP (Chilean Peso)</option>
              <option value="COP">COP (Colombian Peso)</option>
              <option value="MXN">MXN (Mexican Peso)</option>
              <option value="PEN">PEN (Peruvian Sol)</option>
              <option value="UYU">UYU (Uruguayan Peso)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-lg font-black leading-6 text-white uppercase tracking-wider mb-2">
            Min. Amount
          </label>
          <div className="mt-2 relative">
            <input
              type="number"
              min="1"
              step="1"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="block w-full border border-zinc-800 bg-zinc-900 py-4 text-white font-bold placeholder:text-zinc-500 focus:ring-0 focus:outline-none focus:border-white transition-colors rounded-md sm:text-lg px-4 pl-12"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <span className="text-zinc-500 font-bold text-lg">$</span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-[-1rem] text-sm font-bold text-zinc-400 uppercase max-w-lg">
        Set the currency matching your MercadoPago country and the minimum amount fans must pay to ask you a question.
      </p>

      <div>
        <label className="block text-lg font-black leading-6 text-white uppercase tracking-wider mb-2">
          Platform Fee % (Support QAmii)
        </label>
        <div className="mt-2 relative max-w-lg">
          <input
            type="number"
            min="10"
            max="50"
            step="1"
            value={platformFeePercentage}
            onChange={(e) => setPlatformFeePercentage(e.target.value)}
            className="block w-full border border-zinc-800 bg-zinc-900 py-4 text-white font-bold placeholder:text-zinc-500 focus:ring-0 focus:outline-none focus:border-white transition-colors rounded-md sm:text-lg px-4"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <span className="text-zinc-500 font-bold text-lg">%</span>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-zinc-400 uppercase max-w-lg">
          Decide how much you want to support QAmii. Minimum is 10% to cover our server and maintenance costs. Feel free to increase it if you love the platform!
        </p>
      </div>

      {message.text && (
        <div className={`p-4 font-black uppercase tracking-wider border text-lg max-w-lg rounded-md ${message.type === 'success' ? 'bg-emerald-900/50 border-emerald-800 text-emerald-400' : 'bg-red-900/50 border-red-800 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Sticky Bottom Bar for Save Button */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-black border-t border-zinc-800 p-6 px-6 md:px-12 flex justify-end items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button
          type="submit"
          disabled={loading}
          className="bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-zinc-200 transition-colors flex items-center gap-2 rounded-lg disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Profile
        </button>
      </div>
    </form>
  );
}
