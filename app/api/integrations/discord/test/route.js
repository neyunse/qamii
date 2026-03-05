import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(session.user.id);

    if (!user || !user.integrations?.discordWebhook) {
      return NextResponse.json({ message: "No webhook configured" }, { status: 400 });
    }

    const payload = {
      embeds: [{
        title: "🎉 Test Notification from QAmii",
        description: "Your Discord Integration is working perfectly!",
        color: 0x5865F2, // Discord Blurple
        footer: { text: "QAmii Alerts" },
        timestamp: new Date().toISOString()
      }]
    };

    const res = await fetch(user.integrations.discordWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
       return NextResponse.json({ message: "Discord rejected the webhook. Check the URL." }, { status: 400 });
    }

    return NextResponse.json({ message: "Test sent!" }, { status: 200 });
  } catch (error) {
    console.error("Discord webhook test error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
