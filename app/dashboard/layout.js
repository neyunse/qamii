import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import SidebarNav from "./SidebarNav";
import VerificationBanner from "@/components/dashboard/VerificationBanner";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id).select("emailVerified");
  const isVerified = user?.emailVerified;

  return (
    <div className="flex h-screen bg-black overflow-hidden selection:bg-white selection:text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-zinc-800 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-zinc-800 shrink-0">
          <Link href="/dashboard" className="text-xl font-bold text-white flex items-center gap-2">
            <span>QAmii</span>
          </Link>
          <p className="text-sm text-zinc-400 mt-1 truncate">@{session.user.username}</p>
        </div>

        <SidebarNav username={session.user.username} />

        <div className="p-4 border-t border-zinc-800 shrink-0 mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
        {!isVerified && <VerificationBanner />}
        <div className="flex-1 overflow-y-auto w-full pb-20">
          <div className="max-w-4xl mx-auto w-full p-6 md:p-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
