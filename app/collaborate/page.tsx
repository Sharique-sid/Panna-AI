"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, ArrowRight, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function CollaboratePage() {
    const [sessionId, setSessionId] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleJoin = () => {
        if (!sessionId.trim()) {
            toast.error("Please enter a Session ID");
            return;
        }
        router.push(`/collaborate/${sessionId.trim()}`);
    };

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            // 1. Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to create a session");
                router.push("/login?next=/collaborate");
                return;
            }

            // 2. Create a new note
            const { data: note, error } = await supabase
                .from("notes")
                .insert({
                    user_id: user.id,
                    title: "New Collaboration Session",
                    content: "# Welcome to the Team Board\n\nStart collaborating here...",
                    is_public: true,
                    public_share_id: crypto.randomUUID().replace(/-/g, '').substring(0, 12) // Generate a clean ID
                })
                .select()
                .single();

            if (error) throw error;

            // 3. Redirect to the new session
            toast.success("Session created!");
            router.push(`/collaborate/${note.public_share_id}`);
        } catch (error: any) {
            console.error("Error creating session:", error);
            toast.error("Failed to create session: " + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">Panna.ai Collab</span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-medium hover:underline">
                            Dashboard
                        </Link>
                        <Link href="/" className="text-sm font-medium hover:underline">
                            Home
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
                <div className="max-w-2xl space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            Brainstorm <span className="text-primary">Together</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            A real-time shared workspace for your team. Create a session, share the link, and start collaborating instantly.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                                placeholder="Enter Session ID..."
                                className="pl-9 h-12"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                            />
                        </div>
                        <Button size="lg" className="h-12 w-full sm:w-auto" onClick={handleJoin}>
                            Join Session
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or start fresh
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="lg"
                        className="h-12 w-full max-w-md"
                        onClick={handleCreate}
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        Create New Session
                    </Button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full max-w-5xl">
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Real-time Sync</h3>
                        <p className="text-sm text-muted-foreground">
                            See changes as they happen. Multiple users can edit the same note simultaneously.
                        </p>
                    </div>
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                            <Globe className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Share via Link</h3>
                        <p className="text-sm text-muted-foreground">
                            No sign-up required for guests. Just send them the magic link to start working.
                        </p>
                    </div>
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Team Chat</h3>
                        <p className="text-sm text-muted-foreground">
                            Discuss ideas right alongside your notes with built-in session chat.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
