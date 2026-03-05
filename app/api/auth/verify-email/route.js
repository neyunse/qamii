import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://qamii.com';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(`${BASE_URL}/login?error=missing_verification_token`);
    }

    await connectToDatabase();

    // Find the user with this token that hasn't expired yet
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.redirect(`${BASE_URL}/login?error=invalid_or_expired_token`);
    }

    // Verify user and clear token
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Redirect to dashboard explicitly specifying success
    return NextResponse.redirect(`${BASE_URL}/dashboard/settings?verified=true`);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(`${BASE_URL}/login?error=verification_failed`);
  }
}
