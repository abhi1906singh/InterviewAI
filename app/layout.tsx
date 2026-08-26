import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InterviewAI - AI-Powered Mock Interview Platform",
  description: "Ace your next technical interview with AI-powered resume parsing, tailored questions, and intelligent evaluation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 text-gray-900`}>
        <ClerkProvider>
          <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 hover:opacity-90">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                <span>InterviewAI</span>
              </Link>

              <nav className="flex items-center gap-6">
                <Show when="signed-in">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/upload"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                  >
                    Upload Resume
                  </Link>
                  <Link
                    href="/interview"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                  >
                    Interview Room
                  </Link>
                  <div className="ml-2">
                    <UserButton />
                  </div>
                </Show>

                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition cursor-pointer">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer">
                      Get Started
                    </button>
                  </SignUpButton>
                </Show>
              </nav>
            </div>
          </header>

          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
