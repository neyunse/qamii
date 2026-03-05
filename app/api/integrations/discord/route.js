import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { webhook } = await req.json();

    if (webhook && !webhook.startsWith("https://discord.com/api/webhooks/")) {
      return NextResponse.json({ message: "Invalid Discord Webhook URL" }, { status: 400 });
    }

    await connectToDatabase();
    
    // We update the specific nested field using dot notation
    await User.findByIdAndUpdate(session.user.id, {
      $set: { "integrations.discordWebhook": webhook || "" }
    });

    return NextResponse.json({ message: "Saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Discord webhook save error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
