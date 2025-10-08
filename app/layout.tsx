import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://panna.ai"),
  title: "Panna.ai – AI-Powered Note Taking App",
  description:
    "Panna.ai is a modern, AI-powered note-taking application featuring real-time sync, markdown support, and intelligent organization. Capture, organize, and access your notes anywhere.",
  keywords: [
    "AI note-taking",
    "real-time sync",
    "markdown notes",
    "productivity",
    "Panna.ai",
    "Supabase",
    "Next.js",
    "typescript",
    "note app",
  ],
  authors: [{ name: "Md Taufique Alam" }],
  creator: "Md Taufique Alam",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/123-removebg-preview.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
    other: [
      // Swap these URLs to dedicated light/dark assets when available
      { rel: "icon", url: "/favicon.svg", media: "(prefers-color-scheme: light)" },
      { rel: "icon", url: "/favicon.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
  openGraph: {
    title: "Panna.ai – AI-Powered Note Taking App",
    description:
      "A modern note-taking app with AI features, real-time sync, and markdown support.",
    url: "https://panna.ai",
    siteName: "Panna.ai",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
      alt: "Panna.ai App Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Panna.ai – AI-Powered Note Taking App",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
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
