import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { displayName, bio, platformFeePercentage, currency, minAmount } = await req.json();

    if (currency && !SUPPORTED_CURRENCIES.includes(currency)) {
      return NextResponse.json({ message: "Unsupported currency" }, { status: 400 });
    }

    const finalFee = Math.min(50, Math.max(10, Number(platformFeePercentage) || 10));
    const finalMinAmount = Math.max(1, Number(minAmount) || 500);

    await connectToDatabase();

    const result = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          "profile.displayName": displayName,
          "profile.bio": bio,
          "profile.platformFeePercentage": finalFee,
          "profile.currency": currency || "ARS",
          "profile.minAmount": finalMinAmount,
        },
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
