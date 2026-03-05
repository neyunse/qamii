import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";
import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";
import ShareButton from "./ShareButton";

export default async function DashboardPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const params = await searchParams;
  const activeTab = params?.tab === 'answered' ? 'answered' : 'unanswered';

  await connectToDatabase();

  const user = await User.findById(session.user.id);
  const currency = user.profile?.currency || "ARS";

  // Find all questions for this user that are paid or answered
  const questions = await Question.find({
    creatorId: session.user.id,
    status: { $in: ['paid', 'answered'] }
  }).sort({ createdAt: -1 });

  const grossEarnings = questions.reduce((sum, q) => sum + (q.amount || q.priceARS || 0), 0);
  const totalFees = questions.reduce((sum, q) => sum + (q.feeAmount || ((q.amount || q.priceARS || 0) * 0.10)), 0);
  const netEarnings = grossEarnings - totalFees;

  const displayQuestions = questions.filter(q =>
    activeTab === 'answered' ? q.status === 'answered' : q.status === 'paid'
  );

  const publicUrl = `${process.env.APP_URL || "https://qamii.com"}/${session.user.username}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-b from-zinc-800 to-black opacity-20 blur-xl"></div>
          <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2 relative">Net Earnings</h3>
          <p className="text-3xl font-black text-white relative">{currency} ${netEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
          <h3 className="text-zinc-600 font-bold uppercase tracking-widest text-xs mb-2">Total Gross</h3>
          <p className="text-xl font-bold text-zinc-300">{currency} ${grossEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
          <h3 className="text-zinc-600 font-bold uppercase tracking-widest text-xs mb-2">Platform Fees</h3>
          <p className="text-xl font-bold text-zinc-300">- {currency} ${totalFees.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="px-6 py-6 md:px-10 border-b border-zinc-800 bg-zinc-900/10 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-white tracking-tight">Your Questions ({questions.length})</h1>

          <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
            <Link
              href="/dashboard?tab=unanswered"
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'unanswered' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Needs Answer
            </Link>
            <Link
              href="/dashboard?tab=answered"
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'answered' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Answered
            </Link>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {displayQuestions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
              <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No questions yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6 text-sm">
                Share your profile link with your audience to start receiving questions!
              </p>
              <Link
                href={`/${session.user.username}`}
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                See your profile
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {displayQuestions.map((q) => (
                <div key={q._id.toString()} className="p-6 md:p-8 hover:bg-zinc-900/20 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${q.status === 'answered' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-white text-black'
                      }`}>
                      {q.status === 'answered' ? 'Answered' : 'Needs Answer'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-zinc-400">+ {q.currency || "ARS"} {q.amount || q.priceARS}</span>
                      <ShareButton url={`${publicUrl}/q/${q._id.toString()}`} />
                    </div>
                  </div>
                  <p className="text-base text-zinc-200 mb-6 leading-relaxed">"{q.content}"</p>

                  {q.status === 'answered' ? (
                    <div className="space-y-4">
                      <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/80">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                          <MessageSquare className="w-3 h-3" />
                          Your Answer
                        </span>
                        <p className="text-zinc-300 text-sm">{q.answer}</p>
                      </div>
                      <Link
                        href={`/${session.user.username}/q/${q._id.toString()}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> View Publicly
                      </Link>
                    </div>
                  ) : (
                    <div className="flex justify-start mt-4 pt-4">
                      <Link
                        href={`/dashboard/q/${q._id}`}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Write Answer
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
