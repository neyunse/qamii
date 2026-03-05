import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Clear the mercadopago object fields
    await User.findByIdAndUpdate(
      session.user.id,
      {
        $unset: {
          "mercadopago.access_token": "",
          "mercadopago.public_key": "",
          "mercadopago.refresh_token": "",
          "mercadopago.user_id": "",
        },
      }
    );

    return NextResponse.json({ message: "Successfully disconnected from MercadoPago" }, { status: 200 });

  } catch (error) {
    console.error("MP Disconnect Error:", error);
    return NextResponse.json({ message: "Failed to disconnect account" }, { status: 500 });
  }
}
