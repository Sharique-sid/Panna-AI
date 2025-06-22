import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://takenotesai.vercel.app"),
  title: "TakeNote – AI-Powered Note Taking App",
  description:
    "TakeNote is a modern, AI-powered note-taking application featuring real-time sync, markdown support, and intelligent organization. Capture, organize, and access your notes anywhere.",
  keywords: [
    "AI note-taking",
    "real-time sync",
    "markdown notes",
    "productivity",
    "TakeNote",
    "Supabase",
    "Next.js",
    "typescript",
    "note app",
  ],
  authors: [{ name: "Hasnain" }],
  creator: "Hasnain",
  openGraph: {
    title: "TakeNote – AI-Powered Note Taking App",
    description:
      "A modern note-taking app with AI features, real-time sync, and markdown support.",
    url: "https://takenotesai.vercel.app",
    siteName: "TakeNotes",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "TakeNote App Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TakeNote – AI-Powered Note Taking App",
    description:
      "A modern note-taking app with AI features, real-time sync, and markdown support.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
