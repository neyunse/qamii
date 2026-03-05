"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarNav({ username }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
      <div>
        <h3 className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Workspace</h3>
        <div className="flex flex-col space-y-1">
          <Link
            href="/dashboard"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${pathname === "/dashboard"
              ? "bg-zinc-900 text-white relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-white before:rounded-r-full"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
          >
            <span>Questions</span>
          </Link>
          <Link
            href="/dashboard/payments"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${pathname === "/dashboard/payments"
              ? "bg-zinc-900 text-white relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-white before:rounded-r-full"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
          >
            <span>Payments & orders</span>
          </Link>
        </div>
      </div>

      <div>
        <h3 className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Account</h3>
        <div className="flex flex-col space-y-1">
          <Link
            href="/dashboard/integrations"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${pathname === "/dashboard/integrations"
              ? "bg-zinc-900 text-white relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-white before:rounded-r-full"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
          >
            <span>Integrations & Widgets</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${pathname === "/dashboard/settings"
              ? "bg-zinc-900 text-white relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-white before:rounded-r-full"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
          >
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
