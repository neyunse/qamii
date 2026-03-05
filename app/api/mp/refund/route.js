import { NextResponse } from "next/server";
import { MercadoPagoConfig, PaymentRefund } from "mercadopago";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { questionId, paymentId } = await req.json();

    if (!questionId || !paymentId) {
      return NextResponse.json({ message: "Missing questionId or paymentId" }, { status: 400 });
    }

    await connectToDatabase();

    const creator = await User.findById(session.user.id);
    if (!creator || !creator.mercadopago?.access_token) {
      return NextResponse.json({ message: "Creator or MercadoPago credentials not found" }, { status: 404 });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    if (question.creatorId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to refund this question" }, { status: 403 });
    }

    if (question.status === 'refunded') {
      return NextResponse.json({ message: "Question is already refunded" }, { status: 400 });
    }

    // Initialize MP SDK with PLATFORM access token
    const client = new MercadoPagoConfig({ accessToken: creator.mercadopago.access_token });
    const refundClient = new PaymentRefund(client);

    try {
      // Create total refund in MercadoPago
      await refundClient.create({
        payment_id: paymentId,
        body: {}
      });
    } catch (mpError) {
      console.error("MercadoPago refund failed:", mpError);
      return NextResponse.json({ message: "MercadoPago API rejected the refund. It may have already been refunded or is too old." }, { status: 400 });
    }

    // Mark as refunded in DB
    await Question.findByIdAndUpdate(questionId, { status: 'refunded' });

    return NextResponse.json({ message: "Refund successful" }, { status: 200 });

  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ message: "Failed to process refund" }, { status: 500 });
  }
}
