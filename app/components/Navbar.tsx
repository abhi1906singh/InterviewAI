"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const isSignInPage = pathname?.startsWith("/sign-in");
  const isSignUpPage = pathname?.startsWith("/sign-up");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 hover:opacity-90">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          <span>InterviewAI</span>
        </Link>

        <nav className="flex items-center gap-6">
          {!isLoaded ? (
            <div className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse" />
          ) : isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition ${
                  pathname === "/dashboard"
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className={`text-sm font-medium transition ${
                  pathname === "/upload"
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                Upload Resume
              </Link>
              <Link
                href="/interview"
                className={`text-sm font-medium transition ${
                  pathname?.startsWith("/interview")
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                Interview Room
              </Link>
              <div className="ml-2">
                <UserButton />
              </div>
            </>
          ) : (
            <>
              {isSignInPage ? (
                <span className="text-sm font-medium text-gray-400 cursor-not-allowed select-none">
                  Sign In
                </span>
              ) : (
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              )}

              {isSignUpPage ? (
                <span className="rounded-lg bg-indigo-300 px-4 py-2 text-sm font-medium text-white shadow-sm cursor-not-allowed select-none">
                  Get Started
                </span>
              ) : (
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer">
                    Get Started
                  </button>
                </SignUpButton>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
