import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import SettingsForm from "./SettingsForm";
import MercadoPagoConnect from "./MercadoPagoConnect";
import { UserCircle, CreditCard } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();

  const user = await User.findById(session.user.id);
  const isMPConnected = !!user.mercadopago?.access_token;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-8 md:px-10 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-zinc-400 mt-2 text-sm">Manage your creator profile and payment methods.</p>
          </div>
          <Link
            href={`/${user.username}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0"
          >
            Public Profile
            <span className="text-zinc-600 text-lg leading-none">↗</span>
          </Link>
        </div>

        <div className="p-6 md:p-10 space-y-12">
          <div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-zinc-400" />
              Profile Settings
            </h2>
            <SettingsForm
              initialData={{
                displayName: user.profile?.displayName || "",
                bio: user.profile?.bio || "",
                username: user.username,
                avatarUrl: user.profile?.avatarUrl || "",
                platformFeePercentage: user.profile?.platformFeePercentage,
                currency: user.profile?.currency,
                minAmount: user.profile?.minAmount,
              }}
            />
          </div>

          <div className="border-t border-zinc-800 pt-10">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-zinc-400" />
              Payment Gateway
            </h2>
            <MercadoPagoConnect isConnected={isMPConnected} isVerified={user.emailVerified} />
          </div>
        </div>
      </div>
    </div>
  );
}
