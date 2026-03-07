import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Question from "@/models/Question";
import User from "@/models/User";
import { sendAnswerNotificationEmail } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { answer } = await req.json();
    const unwrappedParams = await params;
    const id = unwrappedParams.id;

    if (!answer) {
      return NextResponse.json({ message: "Answer content is required" }, { status: 400 });
    }

    await connectToDatabase();

    const question = await Question.findOne({
      _id: id,
      creatorId: session.user.id,
    });

    if (!question) {
      return NextResponse.json({ message: "Question not found or unauthorized" }, { status: 404 });
    }

    if (question.status !== 'paid') {
      return NextResponse.json({ message: "Only paid questions can be answered" }, { status: 400 });
    }

    question.answer = answer;
    question.status = 'answered';
    await question.save();

    // Notify fan if they provided an email
    if (question.fanEmail) {
      const creator = await User.findById(session.user.id);
      if (creator) {
        sendAnswerNotificationEmail(question.fanEmail, creator.username, question._id.toString()).catch(console.error);
      }
    }

    return NextResponse.json({ message: "Answer published successfully" }, { status: 200 });
  } catch (error) {
    console.error("Answer submit error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
