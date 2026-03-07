import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { getImageUrl } from "@/lib/r2";

export async function POST(req) {
  try {
    const { username, content, amount, currency, fanEmail } = await req.json();

    if (!username || !content || !amount || amount < 1 || !currency || !SUPPORTED_CURRENCIES.includes(currency)) {
      return NextResponse.json({ message: "Invalid request data or unsupported currency" }, { status: 400 });
    }

    await connectToDatabase();

    const creator = await User.findOne({ username });

    if (!creator) {
      return NextResponse.json({ message: "Creator not found" }, { status: 404 });
    }

    if (!creator.mercadopago?.access_token) {
      return NextResponse.json({ message: "Creator is not accepting payments yet" }, { status: 400 });
    }

    // Get absolute avatar URL if exists
    let avatarFullUrl = null;
    if (creator.profile?.avatarUrl) {
      const relativePath = getImageUrl(creator.profile.avatarUrl);
      if (relativePath) {
        avatarFullUrl = relativePath.startsWith('http')
          ? relativePath
          : `${process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL}${relativePath}`;
      }
    }

    // Calculate dynamic platform fee (default 10%)
    const feePercentage = creator.profile?.platformFeePercentage || 10;
    const platformFee = Number((amount * (feePercentage / 100)).toFixed(2));

    // Prepare Question document
    const question = await Question.create({
      creatorId: creator._id,
      content,
      amount,
      currency,
      fanEmail: fanEmail || undefined,
      platformFeePercentage: feePercentage,
      feeAmount: platformFee,
      status: 'pending',
    });

    const client = new MercadoPagoConfig({ accessToken: creator.mercadopago.access_token });
    const preferenceClient = new Preference(client);

    // Argentina (ARS) gets full marketplace features: marketplace_fee, currency_id, etc.
    // Other countries use a minimal preference to avoid cross-country checkout crashes.
    // Fee is always tracked in QAmii's database regardless.
    const isArgentina = currency === "ARS";

    const item = {
      id: question._id.toString(),
      title: `Question for @${creator.username}`,
      unit_price: Number(amount),
      quantity: 1,
    };

    if (isArgentina) {
      item.currency_id = "ARS";
    }

    if (avatarFullUrl) {
      item.picture_url = avatarFullUrl;
    }

    const preferenceBody = {
      items: [item],
      metadata: {
        question_id: question._id.toString(),
      },
      back_urls: {
        success: `${process.env.APP_URL}/${creator.username}?success=true`,
        failure: `${process.env.APP_URL}/${creator.username}?canceled=true`,
        pending: `${process.env.APP_URL}/${creator.username}?pending=true`,
      },
      auto_return: "approved",
      notification_url: `${process.env.APP_URL}/api/mp/webhook`,
    };

    // Only add marketplace features for Argentina where the app is registered
    if (isArgentina) {
      preferenceBody.marketplace_fee = platformFee;
      preferenceBody.statement_descriptor = "QAmii";
    }

    const preference = await preferenceClient.create({ body: preferenceBody });

    return NextResponse.json({ init_point: preference.init_point }, { status: 200 });

  } catch (error) {
    console.error("Checkout preference error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error("MP error cause:", error.cause);
    const debugMsg = error?.message || error?.cause?.message || "Unknown MP error";
    return NextResponse.json({ message: "Failed to create checkout", debug: debugMsg }, { status: 500 });
  }
}
