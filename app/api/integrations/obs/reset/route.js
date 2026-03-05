import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    const newObsKey = crypto.randomBytes(16).toString("hex");

    await User.findByIdAndUpdate(session.user.id, {
      $set: { "integrations.obsKey": newObsKey }
    });

    return NextResponse.json({ message: "Key regenerated", obsKey: newObsKey }, { status: 200 });
  } catch (error) {
    console.error("OBS key reset error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
