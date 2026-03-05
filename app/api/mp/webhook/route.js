import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import connectToDatabase from "@/lib/db";
import Question from "@/models/Question";
import User from "@/models/User";
import { sendNewQuestionEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const dataId = url.searchParams.get("data.id") || req.body?.data?.id;
    let body;

    try {
      body = await req.json();
    } catch {
      // In case body is empty
      body = {};
    }

    const id = body?.data?.id || dataId;

    if (!id) {
      return new Response(null, { status: 200 });
    }

    // Use platform accessToken to get payment info
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);

    const payment = await paymentClient.get({ id });

    if (payment.status === "approved" && payment.metadata?.question_id) {
      await connectToDatabase();

      const question = await Question.findByIdAndUpdate(payment.metadata.question_id, {
        status: 'paid',
        paymentId: payment.id.toString()
      });

      if (question) {
        // Notify creator
        const creator = await User.findById(question.creatorId);
        if (creator) {
          const amountText = `${question.currency || "ARS"} $${question.amount || 0}`;
          sendNewQuestionEmail(creator.email, "Someone", amountText).catch(console.error);

          // TRIGGER DISCORD WEBHOOK
          if (creator.integrations?.discordWebhook) {
            const discordPayload = {
              embeds: [{
                title: "🎉 New PAID Question Received!",
                description: `**Amount:** ${amountText}\n\n**Question:**\n_"${question.content}"_`,
                url: `${process.env.APP_URL || "https://qamii.com"}/dashboard/q/${question._id}`,
                color: 0x5865F2, // Blurple
                footer: { text: "QAmii Live Alerts" },
                timestamp: new Date().toISOString()
              }]
            };
            fetch(creator.integrations.discordWebhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(discordPayload)
            }).catch(err => console.error("Failed to ping Discord", err));
          }

          // TRIGGER OBS IN-MEMORY QUEUE
          if (creator.integrations?.obsKey) {
            if (!global.__obsEvents) global.__obsEvents = new Map();

            const currentQueue = global.__obsEvents.get(creator.integrations.obsKey) || [];
            currentQueue.push({
              id: question._id.toString(),
              type: 'question',
              amountText,
              message: question.content,
              timestamp: Date.now()
            });
            global.__obsEvents.set(creator.integrations.obsKey, currentQueue);
          }
        }
      }
    }

    return new Response(null, { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(null, { status: 500 });
  }
}
