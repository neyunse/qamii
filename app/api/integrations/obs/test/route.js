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
    
    if (!user || !user.integrations?.obsKey) {
        return NextResponse.json({ message: "No OBS Key" }, { status: 404 });
    }

    // Ping the shared global queue/pusher endpoint internally, or save a generic "test" flag
    // For this MVP, we will use a generic `global.__obsEvents` variable on the Node process
    // This isn't perfect for serverless (Vercel) but works for single instances/Bun until moved to Redis/Pusher.
    
    if (!global.__obsEvents) {
        global.__obsEvents = new Map();
    }
    
    // Push the event to the queue for this specific user's OBS key
    const currentQueue = global.__obsEvents.get(user.integrations.obsKey) || [];
    currentQueue.push({
        id: Date.now().toString(),
        type: 'test',
        amountText: 'ARS $500',
        message: 'This is a test question to verify your OBS setup.',
        timestamp: Date.now()
    });
    
    global.__obsEvents.set(user.integrations.obsKey, currentQueue);

    return NextResponse.json({ message: "Test alert dispatched" }, { status: 200 });
  } catch (error) {
    console.error("OBS Test dispatch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
