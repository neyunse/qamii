import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { getImageUrl } from "@/lib/r2";

export async function generateMetadata({ params }) {
  await connectToDatabase();
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  const username = unwrappedParams.username.toLowerCase();

  const question = await Question.findById(id);
  const creator = await User.findOne({ username });

  if (!question || !creator || question.status !== 'answered') {
    return { title: "Question Not Found" };
  }

  return {
    title: `${creator.profile?.displayName || creator.username} answered a question`,
    description: `"${question.content}" - Read the answer on QAmii`,
  };
}

export default async function PublicQuestionPage({ params }) {
  await connectToDatabase();
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  const username = unwrappedParams.username.toLowerCase();

  const creator = await User.findOne({ username });
  const question = await Question.findById(id);

  if (!creator || !question || question.creatorId.toString() !== creator._id.toString()) {
    notFound();
  }

  if (question.status !== 'answered') {
    // Hide pending/paid but unanswered questions from the public
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white relative py-12 px-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <Link
          href={`/${creator.username}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to @{creator.username}'s profile
        </Link>

        {/* Question Card */}
        <div className="bg-black p-8 md:p-10 border-2 border-zinc-800 relative">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                Anonymous Asked
              </span>
              <h1 className="text-2xl md:text-3xl text-white font-black leading-tight tracking-tight uppercase">
                "{question.content}"
              </h1>
            </div>
          </div>

          <div className="bg-zinc-950 p-6 md:p-8 border-2 border-zinc-800 relative mt-12">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-zinc-800">
              {creator.profile?.avatarUrl ? (
                <img
                  src={getImageUrl(creator.profile.avatarUrl)}
                  alt={creator.profile?.displayName || creator.username}
                  className="w-12 h-12 object-cover border-2 border-zinc-800 bg-zinc-900"
                />
              ) : (
                <div className="w-12 h-12 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center font-black text-white text-lg uppercase">
                  {(creator.profile?.displayName || creator.username).charAt(0)}
                </div>
              )}
              <div>
                <p className="text-lg font-black text-white uppercase tracking-tight">
                  {creator.profile?.displayName || creator.username}
                </p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Creator Answer</p>
              </div>
            </div>
            <p className="text-lg text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap">
              {question.answer}
            </p>
          </div>
        </div>

        {/* Call to action for the platform */}
        <div className="text-center pt-12 pb-8 border-t-2 border-zinc-900 mt-12">
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm mb-6">Powered by QAmii</p>
          <Link href="/" className="inline-flex items-center justify-center bg-white text-black border-2 border-white px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
            Create your QAmii profile
          </Link>
        </div>
      </div>
    </div>
  );
}
