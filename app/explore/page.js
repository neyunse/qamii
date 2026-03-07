import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import { ArrowLeft, Search, Users } from "lucide-react";
import { getImageUrl } from "@/lib/r2";
import { CURRENCY_MAP } from "@/lib/constants";

export const metadata = {
  title: "Explore Creators - QAmii",
  description: "Discover creators on QAmii and ask them anonymous questions.",
};

export default async function ExplorePage({ searchParams }) {
  await connectToDatabase();

  const params = await searchParams;
  const query = params?.q || "";

  // Build search filter
  const filter = {
    "mercadopago.access_token": { $exists: true, $ne: null },
  };

  if (query) {
    filter.$or = [
      { username: { $regex: query, $options: "i" } },
      { "profile.displayName": { $regex: query, $options: "i" } },
    ];
  }

  const creators = await User.find(filter)
    .select("username profile.displayName profile.bio profile.avatarUrl profile.currency profile.minAmount")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Serialize for rendering
  const serializedCreators = creators.map((c) => ({
    _id: c._id.toString(),
    username: c.username,
    displayName: c.profile?.displayName || c.username,
    bio: c.profile?.bio || "",
    avatarUrl: c.profile?.avatarUrl || null,
    currency: c.profile?.currency || "ARS",
    minAmount: c.profile?.minAmount || 500,
  }));

  return (
    <div className="bg-black min-h-screen selection:bg-white selection:text-black">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-sm font-bold text-white tracking-widest uppercase">QAmii</span>
          <div className="w-16" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Explore Creators
          </h1>
          <p className="text-zinc-400 text-lg font-light max-w-lg mx-auto">
            Discover creators accepting questions. Find someone interesting and ask away.
          </p>
        </div>

        {/* Search Bar */}
        <form method="GET" action="/explore" className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by username or display name..."
              className="block w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 py-4 pl-12 pr-5 text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-0 outline-none text-sm font-medium transition-colors"
            />
          </div>
        </form>

        {/* Results */}
        {serializedCreators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {query ? "No creators found" : "No creators yet"}
            </h3>
            <p className="text-zinc-500 text-sm max-w-sm">
              {query
                ? `We couldn't find any creators matching "${query}". Try a different search.`
                : "Be the first to join! Create your profile and start earning."}
            </p>
            {!query && (
              <Link
                href="/register"
                className="mt-6 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors"
              >
                Create Account
              </Link>
            )}
          </div>
        ) : (
          <>
            {query && (
              <p className="text-zinc-500 text-sm mb-6 font-medium">
                {serializedCreators.length} result{serializedCreators.length !== 1 ? "s" : ""} for "<span className="text-white">{query}</span>"
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {serializedCreators.map((creator) => {
                const symbol = CURRENCY_MAP[creator.currency]?.symbol || "$";
                return (
                  <Link
                    key={creator._id}
                    href={`/${creator.username}`}
                    className="group bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      {creator.avatarUrl ? (
                        <img
                          src={getImageUrl(creator.avatarUrl)}
                          alt={creator.displayName}
                          className="w-14 h-14 rounded-full object-cover border border-zinc-800 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-white uppercase shrink-0">
                          {creator.displayName.charAt(0)}
                        </div>
                      )}

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-white truncate group-hover:text-zinc-100 transition-colors">
                          {creator.displayName}
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          @{creator.username}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {creator.bio && (
                      <p className="mt-4 text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                        {creator.bio}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        From {symbol}{creator.minAmount} {creator.currency}
                      </span>
                      <span className="text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
                        Ask →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
