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

    // Use the PLATFORM's access token to create the preference.
    // Using the seller's OAuth token causes cross-country checkout crashes
    // (e.g., AR app token + MX seller = fatal error on mercadopago.com.mx).
    // collector_id routes the payment to the correct seller's MP account.
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

    const preferenceClient = new Preference(client);

    const item = {
      id: question._id.toString(),
      title: `Question for @${creator.username}`,
      unit_price: Number(amount),
      quantity: 1,
    };

    if (avatarFullUrl) {
      item.picture_url = avatarFullUrl;
    }

    const preferenceBody = {
      items: [item],
      metadata: {
        question_id: question._id.toString(),
      },
      collector_id: Number(creator.mercadopago.user_id), // Route payment to this seller
      marketplace_fee: platformFee, // Platform commission — works with platform token + collector_id
      statement_descriptor: "QAmii",
      back_urls: {
        success: `${process.env.APP_URL}/${creator.username}?success=true`,
        failure: `${process.env.APP_URL}/${creator.username}?canceled=true`,
        pending: `${process.env.APP_URL}/${creator.username}?pending=true`,
      },
      auto_return: "approved",
      notification_url: `${process.env.APP_URL}/api/mp/webhook`,
    };

    const preference = await preferenceClient.create({ body: preferenceBody });

    return NextResponse.json({ init_point: preference.init_point }, { status: 200 });

  } catch (error) {
    console.error("Checkout preference error:", error);
    return NextResponse.json({ message: "Failed to create checkout" }, { status: 500 });
  }
}
