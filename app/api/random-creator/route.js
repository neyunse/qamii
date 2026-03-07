import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Get a random creator who has MercadoPago connected
    const creators = await User.aggregate([
      { $match: { "mercadopago.access_token": { $exists: true, $ne: null } } },
      { $sample: { size: 1 } },
      { $project: { username: 1 } },
    ]);

    if (!creators || creators.length === 0) {
      return NextResponse.redirect(new URL("/explore", process.env.APP_URL || "http://localhost:3000"));
    }

    const randomCreator = creators[0];
    return NextResponse.redirect(new URL(`/${randomCreator.username}`, process.env.APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Random creator error:", error);
    return NextResponse.redirect(new URL("/explore", process.env.APP_URL || "http://localhost:3000"));
  }
}
