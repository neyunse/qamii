import { NextResponse } from "next/server";
import { MercadoPagoConfig, OAuth } from "mercadopago";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // User ID we passed in auth-url

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.APP_URL}/dashboard/settings?error=missing_code_or_state`);
    }

    // Initialize MP SDK with our app's access token
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const oauth = new OAuth(client);

    // Exchange code for credentials
    const credentials = await oauth.create({
      body: {
        client_secret: process.env.MP_CLIENT_SECRET,
        client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
        code: code,
        redirect_uri: `${process.env.APP_URL}/api/mp/connect`,
      }
    });

    if (!credentials.access_token) {
      throw new Error("Failed to get access token from MercadoPago");
    }

    await connectToDatabase();

    // Save credentials to the user who initiated the connection (via state param)
    await User.findByIdAndUpdate(state, {
      $set: {
        mercadopago: {
          access_token: credentials.access_token,
          public_key: credentials.public_key,
          refresh_token: credentials.refresh_token,
          user_id: credentials.user_id,
        }
      }
    });

    return NextResponse.redirect(`${process.env.APP_URL}/dashboard/settings?success=mp_connected`);
  } catch (error) {
    console.error("MP connect error:", error);
    return NextResponse.redirect(`${process.env.APP_URL}/dashboard/settings?error=mp_connection_failed`);
  }
}
