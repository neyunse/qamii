import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";

export async function POST(req) {
  try {
    const { username, content, amount, currency } = await req.json();

    if (!username || !content || !amount || amount < 1 || !currency) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
    }

    await connectToDatabase();

    const creator = await User.findOne({ username });

    if (!creator) {
      return NextResponse.json({ message: "Creator not found" }, { status: 404 });
    }

    if (!creator.mercadopago?.access_token) {
      return NextResponse.json({ message: "Creator is not accepting payments yet" }, { status: 400 });
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
      platformFeePercentage: feePercentage,
      feeAmount: platformFee,
      status: 'pending',
    });

    // Initialize MP SDK with PLATFORM access token (to create preference on behalf of creator)
    const client = new MercadoPagoConfig({ accessToken: creator.mercadopago.access_token });

    const preferenceClient = new Preference(client);

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: question._id.toString(),
            title: `Question for @${creator.username}`,
            unit_price: Number(amount),
            currency_id: currency, // Tells MP which currency to charge in
            quantity: 1,
          }
        ],
        metadata: {
          question_id: question._id.toString(),
        },
        marketplace_fee: platformFee, // QAmii platform commission
        statement_descriptor: "QAmii", // How it appears on the credit card / MP statement
        back_urls: {
          success: `${process.env.APP_URL}/${creator.username}?success=true`,
          failure: `${process.env.APP_URL}/${creator.username}?canceled=true`,
          pending: `${process.env.APP_URL}/${creator.username}?pending=true`,
        },
        auto_return: "approved",
        notification_url: `${process.env.APP_URL}/api/mp/webhook`,
      }
    });

    return NextResponse.json({ init_point: preference.init_point }, { status: 200 });

  } catch (error) {
    console.error("Checkout preference error:", error);
    return NextResponse.json({ message: "Failed to create checkout" }, { status: 500 });
  }
}
