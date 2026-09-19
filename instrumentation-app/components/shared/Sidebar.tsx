"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Wrench,
  Repeat,
  Cpu,
  CalendarCheck,
  Package,
  FileText,
  Bot,
  BookOpen,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/breakdowns", label: "Breakdowns", icon: Wrench },
  { href: "/handover", label: "Shift Handover", icon: Repeat },
  { href: "/equipment", label: "Equipment", icon: Cpu },
  { href: "/pm-calibration", label: "PM & Calibration", icon: CalendarCheck },
  { href: "/spare-parts", label: "Spare Parts", icon: Package },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/admin/users", label: "Admin: Users", icon: ShieldCheck },
];

export function Sidebar({
  userName,
  role,
  onNavigate,
}: {
  userName: string;
  role: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-br from-brand-700 to-brand-900 p-4">
        <div>
          <p className="text-sm font-semibold text-white">Instrumentation O&amp;M</p>
          <p className="mt-0.5 text-xs text-blue-100">
            {userName} <span className="opacity-60">·</span> <span className="capitalize">{role}</span>
          </p>
        </div>
        <button
          onClick={onNavigate}
          className="rounded-md p-1 text-white/80 hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={clsx("h-4 w-4 shrink-0", active ? "text-brand-600" : "text-gray-400 group-hover:text-gray-600")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          Sign out
        </button>
      </div>
    </div>
  );
}
