"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Sparkles, ArrowRight, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export function HomePage() {
  const { theme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/50 dark:from-purple-950/20 dark:via-blue-950/10 dark:to-indigo-950/20" />

      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl animate-pulse-gradient" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse-gradient"
        style={{ animationDelay: "1s" }}
      />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-purple-blue">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">TakeNote</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button
              className="btn-gradient text-white px-6 py-2 rounded-xl font-medium"
              asChild
            >
              <Link href="/auth/signin">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Open Source & Free Forever
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text">Smart Notes</span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A beautiful, minimal note-taking app with AI-powered features.
              Completely free and open source.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              size="lg"
              className="btn-gradient text-white px-8 py-6 text-lg font-medium rounded-2xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              asChild
            >
              <Link href="/auth/signin">
                Start Taking Notes
                <ArrowRight
                  className={`ml-2 h-5 w-5 transition-transform ${
                    isHovered ? "translate-x-1" : ""
                  }`}
                />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-medium rounded-2xl border-2"
              asChild
            >
              <a
                href="https://github.com/hasnaintypes/take-notes"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </a>
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-20">
            <div className="card-enhanced rounded-3xl p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl gradient-purple-blue flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered</h3>
              <p className="text-muted-foreground">
                Smart features to enhance your note-taking experience
              </p>
            </div>

            <div className="card-enhanced rounded-3xl p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl gradient-purple-blue flex items-center justify-center">
                <Github className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Open Source</h3>
              <p className="text-muted-foreground">
                Transparent, community-driven development
              </p>
            </div>

            <div className="card-enhanced rounded-3xl p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl gradient-purple-blue flex items-center justify-center">
                <span className="text-2xl font-bold text-white">∞</span>
              </div>
              <h3 className="text-xl font-semibold">Free Forever</h3>
              <p className="text-muted-foreground">
                No subscriptions, no limits, no hidden costs
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 mt-20">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-purple-blue">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold gradient-text">TakeNote</span>
          </div>
          <p className="text-muted-foreground">
            Built with ❤️ by the open source community
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a
              href="https://github.com/hasnaintypes/take-notes"
              className="hover:text-foreground transition-colors"
            >
              Contribute
            </a>
            <a
              href="https://github.com/hasnaintypes/take-notes/issues"
              className="hover:text-foreground transition-colors"
            >
              Report Issues
            </a>
            <a
              href="https://github.com/hasnaintypes/take-notes/blob/main/LICENSE"
              className="hover:text-foreground transition-colors"
            >
              License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
