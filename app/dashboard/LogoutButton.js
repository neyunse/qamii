"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:text-white hover:bg-red-600 font-black uppercase tracking-widest border-4 border-transparent hover:border-black hover:shadow-[4px_4px_0px_#000] transition-all"
    >
      <LogOut className="w-6 h-6" />
      Sign Out
    </button>
  );
}
