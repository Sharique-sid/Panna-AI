"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NoteEditor } from "@/components/dashboard/note-editor";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Share2, Bold, Italic, List, Minus, Save, Download, Image as ImageIcon, StickyNote, X, Type } from "lucide-react";
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
    // @ts-ignore
    const [noteColor, setNoteColor] = useState(initialNote.color || "#ffffff");
    const [textColor, setTextColor] = useState("#000000");
    const [cards, setCards] = useState<Array<{ id: string, x: number, y: number, content: string, color: string }>>([]);
    const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const [cursors, setCursors] = useState<Record<string, {
        x: number;
        y: number;
        color: string;
        name: string;
        isTyping: boolean;
        selectionRects?: { x: number; y: number; width: number; height: number }[];
    }>>({});

    // User Identity
    // User Identity
    const [myName, setMyName] = useState("");
    const [myColor] = useState(() => '#' + Math.floor(Math.random() * 16777215).toString(16));
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(true);
    const [whiteboards, setWhiteboards] = useState<Array<{ id: string, x: number, y: number, width: number, height: number, data: string }>>([]);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const isLocalUpdate = useRef(false);
    const supabase = useState(() => createClient())[0];
    const channelRef = useState<ReturnType<typeof supabase.channel> | null>(null);

    // Initial Content Setup
    useEffect(() => {
        if (editorRef.current && initialNote.content) {
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
                    setContent(payload.payload.content);
                    if (editorRef.current && editorRef.current.innerHTML !== payload.payload.content) {
                        editorRef.current.innerHTML = payload.payload.content;
                    }
                }
                if (payload.payload.title !== undefined && payload.payload.title !== title) {
                    setTitle(payload.payload.title);
                }
                if (payload.payload.color !== undefined && payload.payload.color !== noteColor) {
                    setNoteColor(payload.payload.color);
                }
                if (payload.payload.textColor !== undefined && payload.payload.textColor !== textColor) {
                    setTextColor(payload.payload.textColor);
                }
            })
            .on('broadcast', { event: 'card_update' }, (payload) => {
                if (payload.payload.cards) {
                    setCards(payload.payload.cards);
                }
            })
            .on('broadcast', { event: 'whiteboard_update' }, (payload) => {
                if (payload.payload.whiteboards) {
                    setWhiteboards(payload.payload.whiteboards);
                }
            })
            .on('broadcast', { event: 'draw_event' }, (payload) => {
                // Dispatch event to specific canvas
                const event = new CustomEvent(`draw-${payload.payload.whiteboardId}`, { detail: payload.payload });
                window.dispatchEvent(event);
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
                payload: { content: newContent, title, color: noteColor, textColor }
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
                payload: { content, title: newTitle, color: noteColor, textColor }
            });
        }
    };

    const handleColorChange = (newColor: string) => {
        setNoteColor(newColor);
        if (channelRef[0]) {
            channelRef[0].send({
                type: 'broadcast',
                event: 'text_update',
                payload: { content, title, color: newColor, textColor }
            });
        }
    };

    const handleTextColorChange = (newColor: string) => {
        setTextColor(newColor);
        if (channelRef[0]) {
            channelRef[0].send({
                type: 'broadcast',
                event: 'text_update',
                payload: { content, title, color: noteColor, textColor: newColor }
            });
        }
    };

    const insertCard = () => {
        const newCard = {
            id: Math.random().toString(36).substr(2, 9),
            x: 100,
            y: 100,
            content: "New Card",
            color: "#fef3c7" // Yellow-100
        };
        const newCards = [...cards, newCard];
        setCards(newCards);

        if (channelRef[0]) {
            channelRef[0].send({
                type: 'broadcast',
                event: 'card_update',
                payload: { cards: newCards }
            });
        }
    };

    const handleCardMouseDown = (e: React.MouseEvent, cardId: string) => {
        e.stopPropagation(); // Prevent editor focus/caret changes
        const card = cards.find(c => c.id === cardId);
        if (!card) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setDraggedCardId(cardId);
    };

    const handleCardContentChange = (id: string, newContent: string) => {
        const newCards = cards.map(c => c.id === id ? { ...c, content: newContent } : c);
        setCards(newCards);
        // Debounce broadcast for content? For now, instant.
        if (channelRef[0]) {
            channelRef[0].send({
                type: 'broadcast',
                event: 'card_update',
                payload: { cards: newCards }
            });
        }
    };

    const insertWhiteboard = () => {
        const newBoard = {
            id: Math.random().toString(36).substr(2, 9),
            x: 150,
            y: 150,
            width: 600,
            height: 400,
            data: "" // Initial empty state
        };
        const newBoards = [...whiteboards, newBoard];
        setWhiteboards(newBoards);

        if (channelRef[0]) {
            channelRef[0].send({
                type: 'broadcast',
                event: 'whiteboard_update',
                payload: { whiteboards: newBoards }
            });
        }
    };

    const updateWhiteboardPosition = (id: string, x: number, y: number) => {
        const newBoards = whiteboards.map(w => w.id === id ? { ...w, x, y } : w);
        setWhiteboards(newBoards);
        if (channelRef[0]) {
            channelRef[0].send({
                type: 'broadcast',
                event: 'whiteboard_update',
                payload: { whiteboards: newBoards }
            });
        }
    };

    const handleSave = async () => {
        const { error } = await supabase
            .from("notes")
            .update({
                title,
                content,
                // @ts-ignore
                color: noteColor,
                updated_at: new Date().toISOString()
            })
            .eq("id", initialNote.id);

        if (error) {
            toast.error("Failed to save: " + error.message);
        } else {
            toast.success("Saved successfully!");
        }
    };

    const handleDownloadPDF = () => {
        window.print();
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
        if (!containerRef.current) return;

        // Handle Dragging
        if (draggedCardId) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - containerRect.left - dragOffset.x;
            const y = e.clientY - containerRect.top + containerRef.current.scrollTop - dragOffset.y;

            setCards(prev => prev.map(c => c.id === draggedCardId ? { ...c, x, y } : c));
            return;
        }

        if (!channelRef[0]) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + containerRef.current.scrollTop;

        channelRef[0].send({
            type: 'broadcast',
            event: 'cursor_move',
            payload: { x, y, color: myColor, user: myName, isTyping: false }
        });
    };

    const handleMouseUp = () => {
        if (draggedCardId) {
            setDraggedCardId(null);
            // Broadcast final position
            if (channelRef[0]) {
                channelRef[0].send({
                    type: 'broadcast',
                    event: 'card_update',
                    payload: { cards }
                });
            }
        }
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
                        payload: { content: newHtml, title, color: noteColor }
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
            if (content !== initialNote.content || title !== initialNote.title || noteColor !== initialNote.color) {
                const { error } = await supabase
                    .from("notes")
                    .update({
                        title,
                        content,
                        // @ts-ignore
                        color: noteColor,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", initialNote.id);
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [content, title, noteColor, initialNote.id, supabase]);

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

    const colors = [
        "#ffffff", // White
        "#f28b82", // Red
        "#fbbc04", // Orange
        "#fff475", // Yellow
        "#ccff90", // Green
        "#a7ffeb", // Teal
        "#cbf0f8", // Blue
        "#aecbfa", // Dark Blue
        "#d7aefb", // Purple
        "#fdcfe8", // Pink
        "#e6c9a8", // Brown
        "#e8eaed", // Grey
    ];

    return (
        <div className="h-full w-full overflow-hidden relative flex flex-col" style={{ backgroundColor: noteColor, color: textColor }}>
            <style jsx global>{`
@media print {
    @page { margin: 2cm; }
    body * { visibility: hidden; }
        .print - content, .print - content * { visibility: visible; }
            .print - content { position: absolute; left: 0; top: 0; width: 100 %; }
}
`}</style>

            {/* Formatting Toolbar */}
            <div className="h-12 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-10 print:hidden">
                <div className="flex items-center gap-2">
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
                    <div className="w-px h-4 bg-border mx-2" />
                    <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={insertCard} title="Insert Card">
                        <StickyNote className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={insertCard} title="Insert Card">
                        <StickyNote className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={insertWhiteboard} title="Insert Whiteboard">
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Color Picker */}
                    <div className="flex items-center gap-1 mr-2">
                        {colors.map(c => (
                            <button
                                key={c}
                                className={`w-4 h-4 rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform ${noteColor === c ? 'ring-2 ring-primary' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => handleColorChange(c)}
                                title={c}
                            />
                        ))}
                    </div>

                    <div className="w-px h-4 bg-border mx-2" />

                    {/* Text Color Picker */}
                    <div className="flex items-center gap-1 mr-2">
                        <Type className="h-4 w-4 text-muted-foreground mr-1" />
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => handleTextColorChange(e.target.value)}
                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                            title="Text Color"
                        />
                    </div>

                    <Button variant="ghost" size="sm" onClick={handleSave} title="Save">
                        <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDownloadPDF} title="Download PDF">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Editor Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto relative cursor-text print-content"
                onClick={handleContainerClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Whiteboards Layer */}
                {whiteboards.map(wb => (
                    <CollaborativeWhiteboard
                        key={wb.id}
                        id={wb.id}
                        initialX={wb.x}
                        initialY={wb.y}
                        initialWidth={wb.width}
                        initialHeight={wb.height}
                        onMove={(x: number, y: number) => updateWhiteboardPosition(wb.id, x, y)}
                        channel={channelRef[0]}
                        onClose={() => {
                            const newBoards = whiteboards.filter(w => w.id !== wb.id);
                            setWhiteboards(newBoards);
                            if (channelRef[0]) {
                                channelRef[0].send({
                                    type: 'broadcast',
                                    event: 'whiteboard_update',
                                    payload: { whiteboards: newBoards }
                                });
                            }
                        }}
                    />
                ))}

                {/* Cards Layer */}
                {cards.map(card => (
                    <div
                        key={card.id}
                        className="absolute w-48 h-48 shadow-lg rounded-md p-4 flex flex-col z-20 cursor-move transition-shadow hover:shadow-xl"
                        style={{
                            left: card.x,
                            top: card.y,
                            backgroundColor: card.color
                        }}
                        onMouseDown={(e) => handleCardMouseDown(e, card.id)}
                    >
                        <div className="flex justify-between items-center mb-2 opacity-50 hover:opacity-100">
                            <span className="text-xs font-bold uppercase tracking-wider text-black/50">Note</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newCards = cards.filter(c => c.id !== card.id);
                                    setCards(newCards);
                                    if (channelRef[0]) {
                                        channelRef[0].send({
                                            type: 'broadcast',
                                            event: 'card_update',
                                            payload: { cards: newCards }
                                        });
                                    }
                                }}
                                className="hover:bg-black/10 rounded p-0.5"
                            >
                                <X className="h-3 w-3 text-black/50" />
                            </button>
                        </div>
                        <textarea
                            value={card.content}
                            onChange={(e) => handleCardContentChange(card.id, e.target.value)}
                            className="flex-1 bg-transparent resize-none border-none focus:outline-none text-sm leading-relaxed text-black font-medium"
                            placeholder="Type here..."
                            onMouseDown={(e) => e.stopPropagation()} // Allow text selection without dragging
                        />
                    </div>
                ))}

                {/* Remote Selections Layer - z-index 10 */}
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

                {/* Cursors Layer - z-index 50 */}
                {Object.entries(cursors).map(([key, cursor]) => (
                    key !== myName && (
                        <div
                            key={key}
                            className="absolute pointer-events-none z-50 transition-all duration-100 ease-linear flex flex-col items-start print:hidden"
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

                <div className="max-w-3xl mx-auto px-8 py-12 min-h-full shadow-sm border-x border-dashed border-muted/30" style={{ backgroundColor: noteColor }}>
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
            {/* <WhiteboardModal isOpen={isWhiteboardOpen} onClose={() => setIsWhiteboardOpen(false)} onSave={insertWhiteboard} /> */}
        </div>
    );
}

function CollaborativeWhiteboard({ id, initialX, initialY, initialWidth, initialHeight, onMove, channel, onClose }: any) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(3);
    const [tool, setTool] = useState<'pen' | 'line'>('pen');
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
    const [snapshot, setSnapshot] = useState<ImageData | null>(null);
    const [showGrid, setShowGrid] = useState(true);

    // Dragging logic
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = initialWidth;
            canvas.height = initialHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.strokeStyle = color;
                context.lineWidth = brushSize;
                setCtx(context);
            }
        }
    }, []);

    // Listen for remote draw events
    useEffect(() => {
        const handleRemoteDraw = (e: CustomEvent) => {
            const { type, x, y, color: remoteColor, size, tool: remoteTool, startX, startY } = e.detail;
            if (!ctx) return;

            ctx.save();
            ctx.strokeStyle = remoteColor;
            ctx.lineWidth = size;

            if (type === 'start') {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else if (type === 'move') {
                if (remoteTool === 'pen') {
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                }
            } else if (type === 'line') {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            ctx.restore();
        };

        window.addEventListener(`draw-${id}`, handleRemoteDraw as EventListener);
        return () => window.removeEventListener(`draw-${id}`, handleRemoteDraw as EventListener);
    }, [ctx, id]);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (isDragging) return;
        e.stopPropagation(); // Prevent dragging the board
        setIsDrawing(true);
        const { x, y } = getCoords(e);

        if (tool === 'line') {
            setStartPoint({ x, y });
            if (ctx && canvasRef.current) {
                setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
            }
        } else {
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            broadcastDraw('start', x, y);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctx || !canvasRef.current) return;
        e.stopPropagation();
        e.preventDefault();

        const { x, y } = getCoords(e);

        if (tool === 'line') {
            if (snapshot) {
                ctx.putImageData(snapshot, 0, 0);
            }
            if (startPoint) {
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
            broadcastDraw('move', x, y);
        }
    };

    const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (tool === 'line' && startPoint) {
            const { x, y } = getCoords(e);
            broadcastDraw('line', x, y, startPoint.x, startPoint.y);
        }

        if (ctx) ctx.beginPath();
    };

    const broadcastDraw = (type: string, x: number, y: number, startX?: number, startY?: number) => {
        if (channel) {
            channel.send({
                type: 'broadcast',
                event: 'draw_event',
                payload: { whiteboardId: id, type, x, y, color, size: brushSize, tool, startX, startY }
            });
        }
    };

    // Dragging Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag if clicking header
        if ((e.target as HTMLElement).closest('.wb-header')) {
            setIsDragging(true);
            const rect = containerRef.current!.getBoundingClientRect();
            // Need to account for parent scroll/offset if absolute
            // But here we are using left/top style, so we need offset relative to that
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && containerRef.current) {
            // Calculate new position relative to parent container
            // The parent is the editor container.
            // We need to find the parent's rect to calculate relative position
            const parent = containerRef.current.offsetParent as HTMLElement;
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                const x = e.clientX - parentRect.left - dragOffset.x + parent.scrollTop;
                const y = e.clientY - parentRect.top - dragOffset.y; // + scrollTop if parent scrolls?
                // Actually, our parent is the relative container.
                // Let's rely on onMove prop
                onMove(x, y);
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove as any);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove as any);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove as any);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
        }
    }, [color, brushSize, ctx]);

    return (
        <div
            ref={containerRef}
            className="absolute bg-white shadow-2xl border rounded-lg flex flex-col z-30"
            style={{ left: initialX, top: initialY, width: initialWidth, height: initialHeight + 40 }}
            onMouseDown={handleMouseDown}
        >
            {/* Header / Toolbar */}
            <div className="wb-header h-10 bg-gray-100 border-b flex items-center justify-between px-2 cursor-move select-none rounded-t-lg">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">WHITEBOARD</span>
                    <div className="h-4 w-px bg-gray-300 mx-1" />
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-5 h-5 p-0 border-0 rounded cursor-pointer" />
                    <input type="range" min="1" max="20" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-16 h-1" />
                    <div className="h-4 w-px bg-gray-300 mx-1" />
                    <button onClick={() => setTool('pen')} className={`p-1 rounded ${tool === 'pen' ? 'bg-gray-300' : 'hover:bg-gray-200'}`} title="Pen">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => setTool('line')} className={`p-1 rounded ${tool === 'line' ? 'bg-gray-300' : 'hover:bg-gray-200'}`} title="Line">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <button onClick={() => setShowGrid(!showGrid)} className={`p-1 rounded ${showGrid ? 'bg-gray-300' : 'hover:bg-gray-200'}`} title="Grid">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </button>
                </div>
                <button onClick={onClose} className="hover:bg-red-100 p-1 rounded text-red-500"><X className="h-4 w-4" /></button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-white rounded-b-lg">
                {showGrid && (
                    <div className="absolute inset-0 pointer-events-none opacity-10"
                        style={{
                            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />
                )}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
        </div>
    );
}
