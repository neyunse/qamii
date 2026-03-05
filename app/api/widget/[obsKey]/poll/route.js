import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const unwrappedParams = await params;
    const obsKey = unwrappedParams.obsKey;

    if (!obsKey) return NextResponse.json([], { status: 400 });

    if (!global.__obsEvents) {
      global.__obsEvents = new Map();
    }

    const currentQueue = global.__obsEvents.get(obsKey) || [];
    
    // Clear the queue once we pull it (so the widget only sees it once)
    global.__obsEvents.set(obsKey, []);

    return NextResponse.json(currentQueue, { status: 200 });
  } catch (error) {
    console.error("OBS Widget poll error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
