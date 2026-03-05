import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { alignment } = await req.json();

    if (!["left", "center", "right"].includes(alignment)) {
      return NextResponse.json({ message: "Invalid alignment" }, { status: 400 });
    }

    await connectToDatabase();
    await User.findByIdAndUpdate(session.user.id, {
      $set: { "integrations.obsOverlayAlignment": alignment }
    });

    return NextResponse.json({ message: "Settings saved" }, { status: 200 });
  } catch (error) {
    console.error("OBS settings save error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
