"use client";

import { Rocket, LogOut, LogIn } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export function Header({
  userName,
  isLoggedIn,
}: {
  userName?: string;
  isLoggedIn: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-lg border-b border-[#e8e8e8]">
      <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Rocket size={20} strokeWidth={1.5} className="text-[#1a1a1a]" />
          <span className="font-bold text-[18px] text-[#1a1a1a] tracking-tight">
            LaunchFeed
          </span>
        </Link>
        {isLoggedIn ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-[13px] text-[#999] hover:text-[#1a1a1a] press transition-colors"
          >
            <span className="font-medium">{userName}</span>
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 rounded-full text-[13px] font-semibold press"
          >
            <LogIn size={14} strokeWidth={1.5} />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
