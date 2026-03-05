"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "An error occurred");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-black selection:bg-white selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-bold tracking-tight text-white mb-2">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-white hover:text-zinc-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-black py-8 px-4 sm:rounded-2xl sm:px-10 border border-zinc-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium leading-6 text-white mb-2">
                Username
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="block w-full rounded-lg border-0 bg-zinc-900/50 py-3 text-white ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6 px-4 transition-all"
                  placeholder="Only letters, numbers, and underscores"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-white mb-2">
                Email address
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border-0 bg-zinc-900/50 py-3 text-white ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6 px-4 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-white mb-2">
                Password
              </label>
              <div className="mt-2">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-0 bg-zinc-900/50 py-3 text-white ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6 px-4 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 bg-red-500/10 p-3 text-sm rounded-lg border border-red-500/20">{error}</div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center bg-white px-3 py-3 text-sm font-semibold text-black rounded-full hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
