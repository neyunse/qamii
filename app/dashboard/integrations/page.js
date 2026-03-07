import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import IntegrationsClient from "./IntegrationsClient";
import { redirect } from "next/navigation";
import { Plug } from "lucide-react";
import crypto from "crypto";

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id);

  if (!user) {
    redirect("/login");
  }

  // Ensure OBS key exists for older users, though our new register hook covers new ones
  if (!user.integrations?.obsKey) {

    if (!user.integrations) user.integrations = {};
    user.integrations.obsKey = crypto.randomBytes(16).toString("hex");
    await user.save();
  }

  const initialData = {
    discordWebhook: user.integrations?.discordWebhook || "",
    obsKey: user.integrations?.obsKey || "",
    obsOverlayAlignment: user.integrations?.obsOverlayAlignment || "center",
  };

  const publicUrl = `${process.env.APP_URL || "https://qamii.com"}/${user.username}`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <Plug className="w-6 h-6 text-zinc-400" />
          Integrations
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">Supercharge your workflow by connecting QAmii with external services.</p>
      </div>

      <IntegrationsClient initialData={initialData} publicUrl={publicUrl} />
    </div>
  );
}
