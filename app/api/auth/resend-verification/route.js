import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified" }, { status: 400 });
    }

    // Rate limiting logic: Check if a token was generated recently (e.g. less than 1 min ago) to avoid spam
    if (user.verificationTokenExpiry) {
        const timeSinceLastToken = 24 * 60 * 60 * 1000 - (user.verificationTokenExpiry.getTime() - Date.now()); // How long ago was the token generated
        if (timeSinceLastToken < 60 * 1000) { // If less than 60 seconds
             return NextResponse.json({ message: "Please wait before requesting another email." }, { status: 429 });
        }
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send email
    await sendVerificationEmail(user.email, verificationToken, "QAmii");

    return NextResponse.json({ message: "Verification email sent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
