"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NoteEditor } from "@/components/dashboard/note-editor";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Share2, Bold, Italic, List, Minus } from "lucide-react";
import { toast } from "sonner";
import { Note } from "@/types";

// Helper to get cursor coordinates in ContentEditable
const getCaretCoordinates = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // If rect is empty (e.g. new line), try to get a better position
    if (rect.width === 0 && rect.height === 0) {
        // Fallback or more complex logic could go here
        // For now, let's trust the browser or use a span trick if needed
        // But usually getBoundingClientRect works for collapsed ranges too in modern browsers
    }

    return {
        x: rect.left,
        y: rect.top,
        height: rect.height
    };
};

export default function CollaborationSessionPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const { data, error } = await supabase
                    .from("notes")
                    .select("*")
                    .eq("public_share_id", id)
                    .single();

                if (error) throw error;

                // Transform to Note type
                const fetchedNote: Note = {
                    id: data.id,
                    userId: data.user_id,
                    title: data.title,
                    content: data.content,
                    categoryId: data.category_id,
                    tags: data.tags || [],
                    isFavorite: data.is_favorite,
                    deletedAt: data.deleted_at,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                    // @ts-ignore
                    isPublic: data.is_public,
                    publicShareId: data.public_share_id
                };

                setNote(fetchedNote);
            } catch (error) {
                console.error("Error fetching session:", error);
                toast.error("Session not found or expired");
                router.push("/collaborate");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNote();
        }
    }, [id, router, supabase]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Joining session...</span>
            </div>
        );
    }

    if (!note) return null;

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Session Header */}
            <header className="h-14 border-b flex items-center justify-between px-4 bg-card">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/collaborate")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Exit
                    </Button>
                    <div className="h-4 w-px bg-border mx-2" />
                    <span className="font-semibold">Session: {id}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Link copied to clipboard!");
                        }}
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Link
                    </Button>
                </div>
            </header>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden">
                {/* We reuse NoteEditor but we need to handle updates differently since it relies on store */}
                {/* For now, we pass the note. The internal save logic in NoteEditor calls updateNote from store. */}
                {/* We need to mock the store or modify NoteEditor to accept an onSave prop? */}
                {/* Actually, NoteEditor uses useNotesStore directly. This is a problem for guest users. */}
                {/* Quick fix: We will render a simplified editor here instead of the full NoteEditor if we are a guest. */}
                {/* Or we can wrap NoteEditor in a provider? No, Zustand is global. */}

                {/* Let's use a simplified Textarea for now to prove the concept, or modify NoteEditor. */}
                {/* Modifying NoteEditor is risky. Let's create a SimpleCollaborativeEditor. */}
                <SimpleCollaborativeEditor initialNote={note} />
            </div>
        </div>
    );
}

function SimpleCollaborativeEditor({ initialNote }: { initialNote: Note }) {
    const [content, setContent] = useState(initialNote.content || "");
    const [title, setTitle] = useState(initialNote.title || "");
    // State for cursors and selections
    const [cursors, setCursors] = useState<Record<string, {
        x: number;
        y: number;
        color: string;
        name: string;
        isTyping: boolean;
        selectionRects?: { x: number; y: number; width: number; height: number }[];
    }>>({});

    // User Identity
    const [myName, setMyName] = useState("");
    const [myColor] = useState(() => '#' + Math.floor(Math.random() * 16777215).toString(16));
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(true);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const isLocalUpdate = useRef(false);
    const supabase = useState(() => createClient())[0];
    const channelRef = useState<ReturnType<typeof supabase.channel> | null>(null);

    // Initial Content Setup
    useEffect(() => {
        if (editorRef.current && initialNote.content) {
            // Only set if empty to avoid overwriting if we navigated back/forth (though component remounts)
            if (!editorRef.current.innerHTML) {
                editorRef.current.innerHTML = initialNote.content;
            }
        }
    }, [initialNote.content]);

    // Check for existing user session to auto-fill name
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
                setMyName(name);
                setIsNameDialogOpen(false);
            }
        };
        checkUser();
    }, [supabase]);

    // Realtime subscription (Broadcast + Presence)
    useEffect(() => {
        if (!myName) return;

        if (channelRef[0]) {
            supabase.removeChannel(channelRef[0]);
        }

        const channel = supabase.channel(`note-${initialNote.id}`, {
            config: {
                presence: { key: myName },
                broadcast: { self: false }
            },
        });

        channel
            .on('broadcast', { event: 'text_update' }, (payload) => {
                if (payload.payload.content !== undefined) {
                    // Remote update
                    // Update state for saving
                    setContent(payload.payload.content);

                    // Update DOM if different
                    if (editorRef.current && editorRef.current.innerHTML !== payload.payload.content) {
                        // Save cursor position? (Complex, skipping for now as per "Simple" requirement)
                        editorRef.current.innerHTML = payload.payload.content;
                    }
                }
                if (payload.payload.title !== undefined && payload.payload.title !== title) {
                    setTitle(payload.payload.title);
                }
            })
            .on('broadcast', { event: 'cursor_move' }, (payload) => {
                setCursors((prev) => ({
                    ...prev,
                    [payload.payload.user]: {
                        x: payload.payload.x,
                        y: payload.payload.y,
                        color: payload.payload.color,
                        name: payload.payload.user,
                        isTyping: payload.payload.isTyping,
                        selectionRects: payload.payload.selectionRects
                    }
                }));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ user: myName, online_at: new Date().toISOString() });
                }
            });

        channelRef[1](channel);

        return () => {
            supabase.removeChannel(channel);
            channelRef[1](null);
        };
    }, [initialNote.id, supabase, myName]);

    // Broadcast changes
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget.innerHTML;
        isLocalUpdate.current = true;
        setContent(newContent);

        if (channelRef[0]) {
            channelRef[0].send({
                type: 'broadcast',
                event: 'text_update',
                payload: { content: newContent, title }
            });

            updateCaretPosition(true);
        }
    };

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        if (channelRef[0]) {
            channelRef[0].send({
                type: 'broadcast',
                event: 'text_update',
                payload: { content, title: newTitle }
            });
        }
    };

    // Helper to get selection rects
    const getSelectionRects = () => {
        if (!containerRef.current) return [];
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return [];

        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        const containerRect = containerRef.current.getBoundingClientRect();

        return Array.from(rects).map(rect => ({
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top + containerRef.current!.scrollTop,
            width: rect.width,
            height: rect.height
        }));
    };

    // Helper to calculate and broadcast caret position
    const updateCaretPosition = (isTyping: boolean = false) => {
        if (!containerRef.current || !channelRef[0]) return;

        const coords = getCaretCoordinates();
        if (!coords) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = coords.x - containerRect.left;
        const relativeY = coords.y - containerRect.top + containerRef.current.scrollTop;

        const selectionRects = getSelectionRects();

        channelRef[0].send({
            type: 'broadcast',
            event: 'cursor_move',
            payload: {
                x: relativeX,
                y: relativeY,
                color: myColor,
                user: myName,
                isTyping,
                selectionRects
            }
        });
    };

    // Listen for selection changes
    useEffect(() => {
        const handleSelectionChange = () => {
            // Only broadcast if we have focus in the editor
            if (document.activeElement === editorRef.current) {
                updateCaretPosition(false); // Not necessarily typing, just selecting
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    // Broadcast cursor (Mouse)
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || !channelRef[0]) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + containerRef.current.scrollTop;

        channelRef[0].send({
            type: 'broadcast',
            event: 'cursor_move',
            payload: { x, y, color: myColor, user: myName, isTyping: false }
        });
    };

    // Handle "Write Anywhere"
    const handleContainerClick = (e: React.MouseEvent) => {
        // Allow clicking on container or the editor div itself (if clicking below text)
        if (e.target !== containerRef.current && e.target !== editorRef.current) return;

        const editor = editorRef.current;
        if (!editor) return;

        // Get the bounding rect of the editor content
        // We need to find where the actual text ends.
        // If the editor is empty, top is the start.
        // If it has content, we look at the last child or the rect itself.

        // Simple approach: Check distance from the top of the editor
        const rect = editor.getBoundingClientRect();
        const clickYRelativeToEditor = e.clientY - rect.top;

        // Estimate current content height
        // We can't easily get "content height" of a contentEditable with min-height without checking children
        // But we can check if the click is *below* the last element.

        let lastChildBottom = 0;
        if (editor.lastElementChild) {
            lastChildBottom = editor.lastElementChild.getBoundingClientRect().bottom - rect.top;
        } else {
            // Empty editor
            lastChildBottom = 0;
        }

        // If we clicked below the last child (plus some buffer), add lines
        if (clickYRelativeToEditor > lastChildBottom + 10) {
            const gap = clickYRelativeToEditor - lastChildBottom;
            const lineHeight = 30; // Approx for text-lg leading-relaxed
            const linesToAdd = Math.floor(gap / lineHeight);

            if (linesToAdd > 0) {
                let newHtml = editor.innerHTML;
                // If empty, we might need a starting line? contentEditable handles it.
                for (let i = 0; i < linesToAdd; i++) {
                    newHtml += "<br>";
                }

                setContent(newHtml);
                editor.innerHTML = newHtml;

                if (channelRef[0]) {
                    channelRef[0].send({
                        type: 'broadcast',
                        event: 'text_update',
                        payload: { content: newHtml, title }
                    });
                }

                // Move caret to end
                setTimeout(() => {
                    editor.focus();
                    const range = document.createRange();
                    range.selectNodeContents(editor);
                    range.collapse(false);
                    const sel = window.getSelection();
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }, 0);
            } else {
                editor.focus();
            }
        } else {
            // Clicked on or near existing text, let default behavior handle focus/caret
            if (e.target === containerRef.current) {
                editor.focus();
            }
        }
    };

    // Formatting
    const toggleFormat = (command: string) => {
        document.execCommand(command, false);
        editorRef.current?.focus();
    };

    // Save changes to DB (Debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (content !== initialNote.content || title !== initialNote.title) {
                const { error } = await supabase
                    .from("notes")
                    .update({
                        title,
                        content,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", initialNote.id);
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [content, title, initialNote.id, supabase]);

    if (isNameDialogOpen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-card border p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <h2 className="text-xl font-bold mb-4">Join Session</h2>
                    <p className="text-muted-foreground mb-4">Please enter your name to join the collaboration.</p>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const name = formData.get('name') as string;
                        if (name.trim()) {
                            setMyName(name.trim());
                            setIsNameDialogOpen(false);
                        }
                    }}>
                        <input
                            name="name"
                            className="w-full p-2 border rounded mb-4 bg-background"
                            placeholder="Your Name"
                            autoFocus
                        />
                        <Button type="submit" className="w-full">Join</Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden relative flex flex-col">
            {/* Formatting Toolbar */}
            <div className="h-12 border-b bg-card flex items-center justify-center gap-2 px-4 shrink-0 z-10">
                <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleFormat("bold")} title="Bold">
                    <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleFormat("italic")} title="Italic">
                    <Italic className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-2" />
                <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleFormat("insertUnorderedList")} title="List">
                    <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleFormat("insertHorizontalRule")} title="Divider">
                    <Minus className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto relative cursor-text"
                onClick={handleContainerClick}
                onMouseMove={handleMouseMove}
            >
                {/* Remote Selections Layer */}
                {Object.entries(cursors).map(([key, cursor]) => (
                    key !== myName && cursor.selectionRects && cursor.selectionRects.map((rect, i) => (
                        <div
                            key={`${key}-sel-${i}`}
                            className="absolute pointer-events-none z-10 opacity-30"
                            style={{
                                left: rect.x,
                                top: rect.y,
                                width: rect.width,
                                height: rect.height,
                                backgroundColor: cursor.color
                            }}
                        />
                    ))
                ))}

                {/* Cursors Layer */}
                {Object.entries(cursors).map(([key, cursor]) => (
                    key !== myName && (
                        <div
                            key={key}
                            className="absolute pointer-events-none z-50 transition-all duration-100 ease-linear flex flex-col items-start"
                            style={{
                                left: cursor.x,
                                top: cursor.y,
                            }}
                        >
                            {cursor.isTyping ? (
                                // Typing Mode: Blinking Caret + Arrow
                                <div className="relative">
                                    {/* Caret */}
                                    <div
                                        className="w-0.5 h-6 animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                                        style={{ backgroundColor: cursor.color }}
                                    />
                                    {/* Writing Indicator */}
                                    <div
                                        className="absolute -top-8 left-0 px-2 py-1 text-[10px] font-bold text-white rounded-md shadow-md whitespace-nowrap flex items-center gap-1 z-50"
                                        style={{ backgroundColor: cursor.color }}
                                    >
                                        {cursor.name}
                                        <span className="opacity-75 font-normal">is writing...</span>
                                    </div>
                                    {/* Arrow Icon (Visible while typing too) */}
                                    <div className="absolute top-4 -left-2 opacity-80">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill={cursor.color}
                                            className="drop-shadow-sm"
                                        >
                                            <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                // Mouse Mode: Arrow Cursor
                                <div className="relative">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill={cursor.color}
                                        className="drop-shadow-md"
                                    >
                                        <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                                    </svg>
                                    <span
                                        className="absolute top-4 left-4 px-2 py-0.5 text-[10px] font-bold text-white rounded-full shadow-sm whitespace-nowrap"
                                        style={{ backgroundColor: cursor.color }}
                                    >
                                        {cursor.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                ))}

                <div className="max-w-3xl mx-auto px-8 py-12 min-h-full bg-background shadow-sm border-x border-dashed border-muted/30">
                    <input
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full text-4xl font-bold bg-transparent border-none focus:outline-none mb-6 placeholder:text-muted-foreground/40"
                        placeholder="Untitled Session"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onSelect={() => updateCaretPosition(true)}
                        className="w-full min-h-[calc(100vh-300px)] outline-none text-lg leading-relaxed placeholder:text-muted-foreground/40 font-mono empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
                        data-placeholder="Start typing..."
                        spellCheck={false}
                        suppressContentEditableWarning
                    />
                </div>
            </div>
        </div>
    );
}
