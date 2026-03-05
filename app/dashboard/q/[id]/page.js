import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Question from "@/models/Question";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import AnswerForm from "./AnswerForm";

export default async function AnswerQuestionPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const unwrappedParams = await params;
  const id = unwrappedParams.id;

  const question = await Question.findById(id);

  if (!question || question.creatorId.toString() !== session.user.id) {
    notFound();
  }

  if (question.status !== 'paid') {
    // Only paid questions can be answered. 
    // If it's already answered, redirect back to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-8 md:px-10 border-b border-zinc-800 bg-zinc-900/30">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <MessagesSquare className="w-6 h-6 text-white" />
            Answer Question
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">Publish your answer. It will be publicly visible on your profile.</p>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">
              Question (+ {question.currency || "ARS"} {question.amount || question.priceARS})
            </span>
            <p className="text-xl text-white font-medium">"{question.content}"</p>
          </div>

          <AnswerForm questionId={question._id.toString()} />
        </div>
      </div>
    </div>
  );
}
