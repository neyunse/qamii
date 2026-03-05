import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID;
    const redirectUri = `${process.env.APP_URL}/api/mp/connect`;

    if (!clientId || !redirectUri) {
      console.error("Missing MercadoPago environment variables");
      return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
    }

    const url = `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${session.user.id}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("MP auth error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
