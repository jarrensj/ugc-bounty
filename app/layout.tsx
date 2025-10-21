import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ugc bounty",
  description: "ugc bounty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased`}
        >
          <header className="border-b">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="text-xl font-bold">UGC Bounty</div>
              <div className="flex gap-4 items-center">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </nav>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
