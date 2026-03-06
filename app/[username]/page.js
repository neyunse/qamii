import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";
import { notFound } from "next/navigation";
import QuestionForm from "./QuestionForm";
import ProfileTabs from "./ProfileTabs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { getImageUrl } from "@/lib/r2";

export default async function CreatorProfilePage({ params }) {
  await connectToDatabase();
  const unwrappedParams = await params;
  const username = unwrappedParams.username?.toLowerCase();

  const creator = await User.findOne({ username });

  if (!creator) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.username?.toLowerCase() === username;

  // Get answered questions to display publicly
  const answeredQuestions = await Question.find({
    creatorId: creator._id,
    status: 'answered'
  }).sort({ updatedAt: -1 }).limit(10);

  const acceptsPayments = !!creator.mercadopago?.access_token;

  return (
    <div className="min-h-screen bg-black text-zinc-50 relative pb-20 selection:bg-white selection:text-black">
      {isOwner && (
        <div className="absolute top-4 right-4 z-20">
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all border border-zinc-800">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      )}

      <div className="max-w-xl mx-auto pt-24 px-6 relative w-full">
        <div className="flex flex-col items-center text-center mb-10">
          {creator.profile?.avatarUrl ? (
            <img
              src={getImageUrl(creator.profile.avatarUrl)}
              alt={creator.profile?.displayName || creator.username}
              className="w-24 h-24 rounded-full object-cover border border-zinc-800 mb-6"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#0f0f0f] border border-zinc-800 flex items-center justify-center text-3xl font-bold text-white uppercase mb-6">
              {(creator.profile?.displayName || creator.username).charAt(0)}
            </div>
          )}

          <h1 className="text-3xl font-bold text-white tracking-tight">
            {creator.profile?.displayName || creator.username}
          </h1>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f0f0f] border border-zinc-800 text-xs font-semibold text-zinc-400">
            <span>QAmii</span>
            <span className="text-zinc-600">/</span>
            <span className="text-white">{creator.username}</span>
          </div>

          {creator.profile?.bio && (
            <p className="mt-6 text-zinc-400 font-medium text-sm leading-relaxed max-w-sm mx-auto whitespace-pre-wrap">
              {creator.profile.bio}
            </p>
          )}
        </div>

        <ProfileTabs
          askForm={
            <div className="bg-[#0f0f0f] p-8 rounded-3xl border border-zinc-800 relative overflow-hidden">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Ask a anonymous Question</h2>
              </div>

              {acceptsPayments ? (
                <QuestionForm
                  username={creator.username}
                  currency={creator.profile?.currency || "ARS"}
                  minAmount={creator.profile?.minAmount || 500}
                />
              ) : (
                <div className="bg-black border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-zinc-400 text-sm font-semibold">This creator hasn't setup payments yet.</p>
                </div>
              )}
            </div>
          }
          answersList={
            <div className="space-y-6">
              {answeredQuestions.length === 0 ? (
                <div className="text-zinc-500 text-sm text-center p-10 border border-zinc-800 rounded-3xl bg-[#0f0f0f]">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800/50 mx-auto mb-4 flex items-center justify-center shadow-inner">
                    <span className="text-2xl opacity-50">💭</span>
                  </div>
                  No answered questions yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {answeredQuestions.map((q) => (
                    <div id={`q-${q._id.toString()}`} key={q._id.toString()} className="bg-[#0f0f0f] p-6 rounded-3xl border border-zinc-800 transition-colors">
                      <p className="text-base text-zinc-200 font-medium mb-5 leading-relaxed">"{q.content}"</p>
                      <div className="bg-black rounded-xl p-5 border border-zinc-800">
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3 block">
                          Creator's Answer
                        </span>
                        <p className="text-sm text-zinc-300 leading-relaxed font-medium">{q.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
