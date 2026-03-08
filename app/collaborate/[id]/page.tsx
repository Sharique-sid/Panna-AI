"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Share2, Bold, Italic, List, Minus, Save, Download, ImageIcon, StickyNote, X, Type, Undo, Redo, Square, Circle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Note } from "@/types";

const getCaretCoordinates = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    return { x: rect.left, y: rect.top, height: rect.height };
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
                    isPublic: data.is_public,
                    publicShareId: data.public_share_id
                } as Note;
                setNote(fetchedNote);
            } catch (error) {
                toast.error("Session not found or expired");
                router.push("/collaborate");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchNote();
    }, [id]);

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
            <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/collaborate")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Exit
                    </Button>
                    <div className="h-4 w-px bg-border mx-2" />
                    <span className="font-semibold text-sm truncate max-w-[200px]">Session: {id}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied!");
                    }}
                >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
            </header>
            <div className="flex-1 overflow-hidden">
                <SimpleCollaborativeEditor initialNote={note} />
            </div>
        </div>
    );
}

function SimpleCollaborativeEditor({ initialNote }: { initialNote: Note }) {
    const [content, setContent] = useState(initialNote.content || "");
    const [title, setTitle] = useState(initialNote.title || "");
    const [noteColor, setNoteColor] = useState((initialNote as any).color || "#ffffff");
    const [textColor, setTextColor] = useState("#000000");
    const [cards, setCards] = useState<Array<{ id: string; x: number; y: number; content: string; color: string }>>([]);
    const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [whiteboards, setWhiteboards] = useState<Array<{ id: string; x: number; y: number; width: number; height: number; data: string }>>([]);
    const [textBoxes, setTextBoxes] = useState<Array<{ id: string; x: number; y: number; content: string; fontSize: number; color: string }>>([]);
    const [draggedTextBoxId, setDraggedTextBoxId] = useState<string | null>(null);
    const [textBoxDragOffset, setTextBoxDragOffset] = useState({ x: 0, y: 0 });
    const [myName, setMyName] = useState("");
    const [myColor] = useState(() => `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`);
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Array<{ name: string; color: string }>>([]);
    const [cursors, setCursors] = useState<Record<string, {
        x: number; y: number; color: string; name: string;
        isTyping: boolean; selectionRects?: { x: number; y: number; width: number; height: number }[];
    }>>({});

    // Undo/Redo history
    const history = useRef<string[]>([initialNote.content || ""]);
    const historyIndex = useRef(0);
    const isUndoRedo = useRef(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const supabase = useRef(createClient()).current;
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    // Throttle refs
    const lastCursorBroadcast = useRef(0);
    const cardContentTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // Debounced card content broadcast
    const broadcastCardContent = useCallback((updatedCards: typeof cards) => {
        if (channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'card_update',
                payload: { cards: updatedCards }
            });
        }
    }, []);

    useEffect(() => {
        if (editorRef.current && initialNote.content && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = initialNote.content;
        }
    }, [initialNote.content]);

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
    }, []);

    useEffect(() => {
        if (!myName) return;

        if (channelRef.current) supabase.removeChannel(channelRef.current);

        const channel = supabase.channel(`note-${initialNote.id}`, {
            config: { presence: { key: myName }, broadcast: { self: false } },
        });

        channel
            .on('broadcast', { event: 'text_update' }, ({ payload }) => {
                if (payload.content !== undefined && editorRef.current) {
                    setContent(payload.content);
                    if (editorRef.current.innerHTML !== payload.content) {
                        editorRef.current.innerHTML = payload.content;
                    }
                }
                if (payload.title !== undefined) setTitle(payload.title);
                if (payload.color !== undefined) setNoteColor(payload.color);
                if (payload.textColor !== undefined) setTextColor(payload.textColor);
            })
            .on('broadcast', { event: 'card_update' }, ({ payload }) => {
                if (payload.cards) setCards(payload.cards);
            })
            .on('broadcast', { event: 'whiteboard_update' }, ({ payload }) => {
                if (payload.whiteboards) setWhiteboards(payload.whiteboards);
            })
            .on('broadcast', { event: 'textbox_update' }, ({ payload }) => {
                if (payload.textBoxes) setTextBoxes(payload.textBoxes);
            })
            .on('broadcast', { event: 'draw_event' }, ({ payload }) => {
                window.dispatchEvent(new CustomEvent(`draw-${payload.whiteboardId}`, { detail: payload }));
            })
            .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
                setCursors(prev => ({
                    ...prev,
                    [payload.user]: {
                        x: payload.x, y: payload.y,
                        color: payload.color, name: payload.user,
                        isTyping: payload.isTyping,
                        selectionRects: payload.selectionRects
                    }
                }));
            })
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users = Object.values(state).flat().map((u: any) => ({
                    name: u.user,
                    color: u.color || myColor
                }));
                setOnlineUsers(users);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    await channel.track({ user: myName, color: myColor, online_at: new Date().toISOString() });
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setIsConnected(false);
                }
            });

        channelRef.current = channel;
        return () => { supabase.removeChannel(channel); };
    }, [myName, initialNote.id]);

    const pushHistory = useCallback((html: string) => {
        if (isUndoRedo.current) return;
        const newHistory = history.current.slice(0, historyIndex.current + 1);
        newHistory.push(html);
        if (newHistory.length > 100) newHistory.shift();
        history.current = newHistory;
        historyIndex.current = newHistory.length - 1;
    }, []);

    const handleUndo = useCallback(() => {
        if (historyIndex.current <= 0) return;
        historyIndex.current--;
        const prev = history.current[historyIndex.current];
        isUndoRedo.current = true;
        setContent(prev);
        if (editorRef.current) editorRef.current.innerHTML = prev;
        isUndoRedo.current = false;
        channelRef.current?.send({ type: 'broadcast', event: 'text_update', payload: { content: prev, title, color: noteColor, textColor } });
    }, [title, noteColor, textColor]);

    const handleRedo = useCallback(() => {
        if (historyIndex.current >= history.current.length - 1) return;
        historyIndex.current++;
        const next = history.current[historyIndex.current];
        isUndoRedo.current = true;
        setContent(next);
        if (editorRef.current) editorRef.current.innerHTML = next;
        isUndoRedo.current = false;
        channelRef.current?.send({ type: 'broadcast', event: 'text_update', payload: { content: next, title, color: noteColor, textColor } });
    }, [title, noteColor, textColor]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) handleRedo(); else handleUndo();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget.innerHTML;
        setContent(newContent);
        pushHistory(newContent);
        channelRef.current?.send({ type: 'broadcast', event: 'text_update', payload: { content: newContent, title, color: noteColor, textColor } });
        updateCaretPosition(true);
    };

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        channelRef.current?.send({ type: 'broadcast', event: 'text_update', payload: { content, title: newTitle, color: noteColor, textColor } });
    };

    const handleColorChange = (newColor: string) => {
        setNoteColor(newColor);
        channelRef.current?.send({ type: 'broadcast', event: 'text_update', payload: { content, title, color: newColor, textColor } });
    };

    const handleTextColorChange = (newColor: string) => {
        setTextColor(newColor);
        channelRef.current?.send({ type: 'broadcast', event: 'text_update', payload: { content, title, color: noteColor, textColor: newColor } });
    };

    const insertCard = () => {
        const newCard = { id: Math.random().toString(36).substr(2, 9), x: 100 + cards.length * 20, y: 100 + cards.length * 20, content: "New Note", color: "#fef3c7" };
        const newCards = [...cards, newCard];
        setCards(newCards);
        channelRef.current?.send({ type: 'broadcast', event: 'card_update', payload: { cards: newCards } });
    };

    const handleCardMouseDown = (e: React.MouseEvent, cardId: string) => {
        e.stopPropagation();
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setDraggedCardId(cardId);
    };

    const handleCardContentChange = (id: string, newContent: string) => {
        const newCards = cards.map(c => c.id === id ? { ...c, content: newContent } : c);
        setCards(newCards);
        // Debounce card content broadcast to 150ms
        clearTimeout(cardContentTimers.current[id]);
        cardContentTimers.current[id] = setTimeout(() => broadcastCardContent(newCards), 150);
    };

    const insertWhiteboard = () => {
        const newBoard = { id: Math.random().toString(36).substr(2, 9), x: 150, y: 150, width: 600, height: 400, data: "" };
        const newBoards = [...whiteboards, newBoard];
        setWhiteboards(newBoards);
        channelRef.current?.send({ type: 'broadcast', event: 'whiteboard_update', payload: { whiteboards: newBoards } });
    };

    const updateWhiteboardPosition = (id: string, x: number, y: number) => {
        const newBoards = whiteboards.map(w => w.id === id ? { ...w, x, y } : w);
        setWhiteboards(newBoards);
        channelRef.current?.send({ type: 'broadcast', event: 'whiteboard_update', payload: { whiteboards: newBoards } });
    };

    const updateWhiteboardSize = (id: string, width: number, height: number) => {
        setWhiteboards(prev => {
            const newBoards = prev.map(w => w.id === id ? { ...w, width, height } : w);
            channelRef.current?.send({ type: 'broadcast', event: 'whiteboard_update', payload: { whiteboards: newBoards } });
            return newBoards;
        });
    };

    const handleCanvasDoubleClick = (e: React.MouseEvent) => {
        // Don't create text box if clicking on an existing element
        if ((e.target as HTMLElement).closest('.tb-box, .wb-container, .card-el')) return;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + containerRef.current.scrollTop;
        const newBox = { id: Math.random().toString(36).substr(2, 9), x, y, content: "", fontSize: 16, color: textColor };
        const newBoxes = [...textBoxes, newBox];
        setTextBoxes(newBoxes);
        channelRef.current?.send({ type: 'broadcast', event: 'textbox_update', payload: { textBoxes: newBoxes } });
    };

    const handleTextBoxChange = (id: string, newContent: string) => {
        const newBoxes = textBoxes.map(tb => tb.id === id ? { ...tb, content: newContent } : tb);
        setTextBoxes(newBoxes);
        channelRef.current?.send({ type: 'broadcast', event: 'textbox_update', payload: { textBoxes: newBoxes } });
    };

    const handleTextBoxMouseDown = (e: React.MouseEvent, tbId: string) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
        e.stopPropagation();
        const el = (e.currentTarget as HTMLElement);
        const rect = el.getBoundingClientRect();
        setTextBoxDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setDraggedTextBoxId(tbId);
    };

    const handleSave = async () => {
        const { error } = await supabase.from("notes").update({ title, content, updated_at: new Date().toISOString() }).eq("id", initialNote.id);
        if (error) toast.error("Failed to save"); else toast.success("Saved!");
    };

    const getSelectionRects = () => {
        if (!containerRef.current) return [];
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return [];
        const range = selection.getRangeAt(0);
        const containerRect = containerRef.current.getBoundingClientRect();
        return Array.from(range.getClientRects()).map(rect => ({
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top + containerRef.current!.scrollTop,
            width: rect.width, height: rect.height
        }));
    };

    const updateCaretPosition = (isTyping = false) => {
        if (!containerRef.current || !channelRef.current) return;
        const coords = getCaretCoordinates();
        if (!coords) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        channelRef.current.send({
            type: 'broadcast', event: 'cursor_move',
            payload: {
                x: coords.x - containerRect.left,
                y: coords.y - containerRect.top + containerRef.current.scrollTop,
                color: myColor, user: myName, isTyping,
                selectionRects: getSelectionRects()
            }
        });
    };

    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === editorRef.current) updateCaretPosition(false);
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, [myName, myColor]);

    // Throttled cursor broadcast — max 33fps
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;

        if (draggedCardId) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - containerRect.left - dragOffset.x;
            const y = e.clientY - containerRect.top + containerRef.current.scrollTop - dragOffset.y;
            setCards(prev => prev.map(c => c.id === draggedCardId ? { ...c, x, y } : c));
            return;
        }

        if (draggedTextBoxId) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - containerRect.left - textBoxDragOffset.x;
            const y = e.clientY - containerRect.top + containerRef.current.scrollTop - textBoxDragOffset.y;
            setTextBoxes(prev => prev.map(tb => tb.id === draggedTextBoxId ? { ...tb, x, y } : tb));
            return;
        }

        const now = Date.now();
        if (now - lastCursorBroadcast.current < 30) return; // throttle to ~33fps
        lastCursorBroadcast.current = now;

        if (!channelRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        channelRef.current.send({
            type: 'broadcast', event: 'cursor_move',
            payload: {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top + containerRef.current.scrollTop,
                color: myColor, user: myName, isTyping: false
            }
        });
    };

    const handleMouseUp = () => {
        if (draggedCardId) {
            setDraggedCardId(null);
            channelRef.current?.send({ type: 'broadcast', event: 'card_update', payload: { cards } });
        }
        if (draggedTextBoxId) {
            setDraggedTextBoxId(null);
            channelRef.current?.send({ type: 'broadcast', event: 'textbox_update', payload: { textBoxes } });
        }
    };

    // Auto-save debounced
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (content !== initialNote.content || title !== initialNote.title) {
                await supabase.from("notes").update({ title, content, updated_at: new Date().toISOString() }).eq("id", initialNote.id);
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [content, title, initialNote.id]);

    const toggleFormat = (command: string) => {
        document.execCommand(command, false);
        editorRef.current?.focus();
        const newContent = editorRef.current?.innerHTML || content;
        setContent(newContent);
        pushHistory(newContent);
        channelRef.current?.send({ type: 'broadcast', event: 'text_update', payload: { content: newContent, title, color: noteColor, textColor } });
    };

    if (isNameDialogOpen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-card border p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xl">✏️</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Join Session</h2>
                            <p className="text-sm text-muted-foreground">Enter your name to start collaborating</p>
                        </div>
                    </div>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const name = (new FormData(e.currentTarget).get('name') as string)?.trim();
                        if (name) { setMyName(name); setIsNameDialogOpen(false); }
                    }} className="mt-4">
                        <input name="name" className="w-full p-3 border rounded-lg mb-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Your name" autoFocus />
                        <Button type="submit" className="w-full">Join Collaboration</Button>
                    </form>
                </div>
            </div>
        );
    }

    const colors = ["#ffffff","#f28b82","#fbbc04","#fff475","#ccff90","#a7ffeb","#cbf0f8","#aecbfa","#d7aefb","#fdcfe8","#e6c9a8","#e8eaed"];

    return (
        <div className="h-full w-full overflow-hidden relative flex flex-col" style={{ backgroundColor: noteColor, color: textColor }}>
            {/* Toolbar */}
            <div className="h-12 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-10">
                <div className="flex items-center gap-1">
                    {/* Undo/Redo */}
                    <Button variant="ghost" size="sm" onClick={handleUndo} title="Undo (Ctrl+Z)" disabled={historyIndex.current <= 0}>
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRedo} title="Redo (Ctrl+Shift+Z)" disabled={historyIndex.current >= history.current.length - 1}>
                        <Redo className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    {/* Formatting */}
                    <Button variant="ghost" size="sm" onMouseDown={e => e.preventDefault()} onClick={() => toggleFormat("bold")} title="Bold">
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onMouseDown={e => e.preventDefault()} onClick={() => toggleFormat("italic")} title="Italic">
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onMouseDown={e => e.preventDefault()} onClick={() => toggleFormat("insertUnorderedList")} title="List">
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onMouseDown={e => e.preventDefault()} onClick={() => toggleFormat("insertHorizontalRule")} title="Divider">
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onMouseDown={e => e.preventDefault()} onClick={insertCard} title="Sticky Note">
                        <StickyNote className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onMouseDown={e => e.preventDefault()} onClick={insertWhiteboard} title="Whiteboard">
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground/60 hidden sm:block ml-1 select-none">Double-click canvas to add text</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Background colors */}
                    <div className="flex items-center gap-0.5">
                        {colors.map(c => (
                            <button key={c}
                                className={`w-4 h-4 rounded-full border border-gray-300 hover:scale-125 transition-transform ${noteColor === c ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => handleColorChange(c)}
                            />
                        ))}
                    </div>
                    <div className="w-px h-4 bg-border mx-1" />
                    {/* Text color */}
                    <div className="flex items-center gap-1">
                        <Type className="h-3.5 w-3.5 text-muted-foreground" />
                        <input type="color" value={textColor} onChange={e => handleTextColorChange(e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" title="Text Color" />
                    </div>
                    <div className="w-px h-4 bg-border mx-1" />
                    {/* Online users */}
                    <div className="flex items-center gap-1">
                        {isConnected
                            ? <Wifi className="h-3.5 w-3.5 text-green-500" />
                            : <WifiOff className="h-3.5 w-3.5 text-red-500" />}
                        <div className="flex -space-x-1">
                            {/* Self */}
                            <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style={{ backgroundColor: myColor }} title={`${myName} (you)`}>
                                {myName[0]?.toUpperCase()}
                            </div>
                            {/* Others */}
                            {Object.entries(cursors).filter(([k]) => k !== myName).map(([key, c]) => (
                                <div key={key} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style={{ backgroundColor: c.color }} title={c.name}>
                                    {c.name[0]?.toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onClick={handleSave} title="Save">
                        <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.print()} title="Print / PDF">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Connection banner */}
            {!isConnected && (
                <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-xs px-4 py-1.5 flex items-center gap-2 shrink-0">
                    <WifiOff className="h-3 w-3" />
                    Reconnecting... Changes will sync when connection is restored.
                </div>
            )}

            {/* Editor Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto relative cursor-text"
                onClick={(e) => {
                    if (e.target === containerRef.current || e.target === editorRef.current) editorRef.current?.focus();
                }}
                onDoubleClick={handleCanvasDoubleClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Whiteboards */}
                {whiteboards.map(wb => (
                    <CollaborativeWhiteboard
                        key={wb.id}
                        id={wb.id}
                        initialX={wb.x}
                        initialY={wb.y}
                        initialWidth={wb.width}
                        initialHeight={wb.height}
                        onMove={(x: number, y: number) => updateWhiteboardPosition(wb.id, x, y)}
                        onResize={(w: number, h: number) => updateWhiteboardSize(wb.id, w, h)}
                        channel={channelRef.current}
                        onClose={() => {
                            const newBoards = whiteboards.filter(w => w.id !== wb.id);
                            setWhiteboards(newBoards);
                            channelRef.current?.send({ type: 'broadcast', event: 'whiteboard_update', payload: { whiteboards: newBoards } });
                        }}
                    />
                ))}

                {/* Sticky Cards */}
                {cards.map(card => (
                    <div
                        key={card.id}
                        className="absolute w-52 shadow-xl rounded-lg flex flex-col z-20 cursor-move select-none"
                        style={{ left: card.x, top: card.y, backgroundColor: card.color }}
                        onMouseDown={e => handleCardMouseDown(e, card.id)}
                    >
                        {/* Card header */}
                        <div className="flex justify-between items-center px-3 pt-2 pb-1">
                            <div className="flex gap-1">
                                {["#fef3c7","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff"].map(c => (
                                    <button key={c} className={`w-3 h-3 rounded-full border border-black/10 hover:scale-125 transition-transform ${card.color === c ? 'ring-1 ring-black/30' : ''}`}
                                        style={{ backgroundColor: c }}
                                        onClick={e => { e.stopPropagation(); const nc = cards.map(cc => cc.id === card.id ? { ...cc, color: c } : cc); setCards(nc); broadcastCardContent(nc); }}
                                        onMouseDown={e => e.stopPropagation()}
                                    />
                                ))}
                            </div>
                            <button className="hover:bg-black/10 rounded p-0.5 transition-colors" onClick={e => { e.stopPropagation(); const nc = cards.filter(c => c.id !== card.id); setCards(nc); channelRef.current?.send({ type: 'broadcast', event: 'card_update', payload: { cards: nc } }); }}>
                                <X className="h-3 w-3 text-black/40" />
                            </button>
                        </div>
                        <textarea
                            value={card.content}
                            onChange={e => handleCardContentChange(card.id, e.target.value)}
                            className="flex-1 bg-transparent resize-none border-none focus:outline-none text-sm leading-relaxed text-black/80 px-3 pb-3 min-h-[100px]"
                            placeholder="Type here..."
                            onMouseDown={e => e.stopPropagation()}
                        />
                    </div>
                ))}

                {/* Free-form Text Boxes — double-click anywhere to create */}
                {textBoxes.map(tb => (
                    <div
                        key={tb.id}
                        className="tb-box absolute z-25 group"
                        style={{ left: tb.x, top: tb.y, minWidth: 120 }}
                        onMouseDown={e => handleTextBoxMouseDown(e, tb.id)}
                    >
                        <div className="absolute -top-5 left-0 hidden group-hover:flex items-center gap-1 bg-black/70 rounded px-1 py-0.5">
                            <button className="text-white/60 hover:text-red-400 text-[10px] px-1" onMouseDown={e => e.stopPropagation()} onClick={() => { const nb = textBoxes.filter(t => t.id !== tb.id); setTextBoxes(nb); channelRef.current?.send({ type: 'broadcast', event: 'textbox_update', payload: { textBoxes: nb } }); }}>✕</button>
                            <input type="color" value={tb.color} onMouseDown={e => e.stopPropagation()} onChange={e => { const nb = textBoxes.map(t => t.id === tb.id ? { ...t, color: e.target.value } : t); setTextBoxes(nb); channelRef.current?.send({ type: 'broadcast', event: 'textbox_update', payload: { textBoxes: nb } }); }} className="w-4 h-4 p-0 border-0 cursor-pointer" title="Text color" />
                            <select value={tb.fontSize} onMouseDown={e => e.stopPropagation()} onChange={e => { const nb = textBoxes.map(t => t.id === tb.id ? { ...t, fontSize: +e.target.value } : t); setTextBoxes(nb); channelRef.current?.send({ type: 'broadcast', event: 'textbox_update', payload: { textBoxes: nb } }); }} className="text-white text-[10px] bg-transparent border-0 cursor-pointer">
                                {[12,14,16,20,24,32,48].map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                            </select>
                        </div>
                        <textarea
                            value={tb.content}
                            onChange={e => handleTextBoxChange(tb.id, e.target.value)}
                            onMouseDown={e => e.stopPropagation()}
                            autoFocus={tb.content === ""}
                            placeholder="Type here…"
                            className="bg-transparent border-0 border-b border-dashed border-gray-300 focus:border-gray-500 focus:outline-none resize-none overflow-hidden leading-snug"
                            style={{ fontSize: tb.fontSize, color: tb.color, minWidth: 120, width: Math.max(120, tb.content.length * (tb.fontSize * 0.6) + 20) }}
                            rows={1}
                            onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }}
                        />
                    </div>
                ))}

                {/* Remote Selections */}
                {Object.entries(cursors).map(([key, cursor]) =>
                    key !== myName && cursor.selectionRects?.map((rect, i) => (
                        <div key={`${key}-sel-${i}`} className="absolute pointer-events-none z-10 opacity-25 rounded-sm"
                            style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height, backgroundColor: cursor.color }}
                        />
                    ))
                )}

                {/* Remote Cursors — smooth with CSS transition */}
                {Object.entries(cursors).map(([key, cursor]) =>
                    key !== myName && (
                        <div
                            key={key}
                            className="absolute pointer-events-none z-50 flex flex-col items-start print:hidden"
                            style={{
                                left: cursor.x,
                                top: cursor.y,
                                transition: 'left 80ms linear, top 80ms linear',
                                willChange: 'left, top',
                            }}
                        >
                            {cursor.isTyping ? (
                                <div className="relative">
                                    <div className="w-0.5 h-5 animate-pulse" style={{ backgroundColor: cursor.color }} />
                                    <div className="absolute -top-7 left-0 px-2 py-0.5 text-[10px] font-semibold text-white rounded-md shadow-lg whitespace-nowrap" style={{ backgroundColor: cursor.color }}>
                                        {cursor.name} <span className="opacity-75 font-normal">typing…</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill={cursor.color} className="drop-shadow-md">
                                        <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                                    </svg>
                                    <span className="absolute top-3.5 left-3 px-1.5 py-0.5 text-[10px] font-semibold text-white rounded-full shadow-sm whitespace-nowrap" style={{ backgroundColor: cursor.color }}>
                                        {cursor.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                )}

                {/* Note content */}
                <div className="max-w-3xl mx-auto px-8 py-12 min-h-full" style={{ backgroundColor: noteColor }}>
                    <input
                        value={title}
                        onChange={e => handleTitleChange(e.target.value)}
                        className="w-full text-4xl font-bold bg-transparent border-none focus:outline-none mb-6 placeholder:text-muted-foreground/40"
                        placeholder="Untitled Session"
                        onClick={e => e.stopPropagation()}
                        style={{ color: textColor }}
                    />
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onSelect={() => updateCaretPosition(true)}
                        className="w-full min-h-[calc(100vh-300px)] outline-none text-lg leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
                        data-placeholder="Start typing… your collaborators will see it live."
                        spellCheck={false}
                        suppressContentEditableWarning
                        style={{ color: textColor }}
                    />
                </div>
            </div>
        </div>
    );
}

function CollaborativeWhiteboard({ id, initialX, initialY, initialWidth, initialHeight, onMove, onResize, channel, onClose }: any) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(3);
    const [tool, setTool] = useState<'pen' | 'line' | 'rect' | 'circle'>('pen');
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [snapshot, setSnapshot] = useState<ImageData | null>(null);
    const [showGrid, setShowGrid] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
    const isResizing = useRef(false);
    const resizeStart = useRef({ x: 0, y: 0, w: initialWidth, h: initialHeight });

    // Sync size when remote resize arrives (initialWidth/Height props change)
    useEffect(() => {
        if (!isResizing.current) {
            setSize({ width: initialWidth, height: initialHeight });
        }
    }, [initialWidth, initialHeight]);
    const colorRef = useRef("#000000");
    const brushSizeRef = useRef(3);

    // Sync color/brushSize to refs so draw handlers always have current values
    useEffect(() => { colorRef.current = color; }, [color]);
    useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);

    // Initialise canvas only once on mount; resize preserves content
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = initialWidth;
        canvas.height = initialHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.lineCap = 'round';
            context.lineJoin = 'round';
            ctxRef.current = context;
        }
    }, []);

    // When size changes (resize), expand canvas while preserving drawn content
    useEffect(() => {
        if (!canvasRef.current || !ctxRef.current) return;
        const canvas = canvasRef.current;
        // Save current pixels
        const imageData = ctxRef.current.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = size.width;
        canvas.height = size.height;
        // Restore context settings (canvas resize resets them)
        ctxRef.current.lineCap = 'round';
        ctxRef.current.lineJoin = 'round';
        ctxRef.current.strokeStyle = colorRef.current;
        ctxRef.current.lineWidth = brushSizeRef.current;
        // Restore drawn content
        ctxRef.current.putImageData(imageData, 0, 0);
    }, [size.width, size.height]);


    const remotePenPos = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const handleRemoteDraw = (e: CustomEvent) => {
            const { type, x, y, color: rc, size: sz, tool: rt, startX, startY } = e.detail;
            const c = ctxRef.current;
            if (!c) return;

            if (type === 'start') {
                c.strokeStyle = rc;
                c.lineWidth = sz;
                c.lineCap = 'round';
                c.lineJoin = 'round';
                c.beginPath();
                c.moveTo(x, y);
                remotePenPos.current = { x, y };
            } else if (type === 'move' && rt === 'pen') {
                c.strokeStyle = rc;
                c.lineWidth = sz;
                c.lineCap = 'round';
                c.lineJoin = 'round';
                c.lineTo(x, y);
                c.stroke();
                c.beginPath();
                c.moveTo(x, y);
                remotePenPos.current = { x, y };
            } else {
                const prevStroke = c.strokeStyle;
                const prevWidth = c.lineWidth;
                c.strokeStyle = rc;
                c.lineWidth = sz;
                c.lineCap = 'round';
                c.lineJoin = 'round';
                if (type === 'line') { c.beginPath(); c.moveTo(startX, startY); c.lineTo(x, y); c.stroke(); }
                else if (type === 'rect') { c.strokeRect(startX, startY, x - startX, y - startY); }
                else if (type === 'circle') {
                    const rx = Math.abs(x - startX) / 2, ry = Math.abs(y - startY) / 2;
                    c.beginPath(); c.ellipse(startX + (x - startX) / 2, startY + (y - startY) / 2, rx, ry, 0, 0, 2 * Math.PI); c.stroke();
                }
                // Restore local drawing settings
                c.strokeStyle = prevStroke;
                c.lineWidth = prevWidth;
            }
        };
        window.addEventListener(`draw-${id}`, handleRemoteDraw as EventListener);
        return () => window.removeEventListener(`draw-${id}`, handleRemoteDraw as EventListener);
    }, [id]);

    // Keep canvas strokeStyle/lineWidth in sync with local color/brush settings
    useEffect(() => {
        if (ctxRef.current) { ctxRef.current.strokeStyle = color; ctxRef.current.lineWidth = brushSize; }
    }, [color, brushSize]);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const broadcastDraw = (type: string, x: number, y: number, startX?: number, startY?: number) => {
        channel?.send({ type: 'broadcast', event: 'draw_event', payload: { whiteboardId: id, type, x, y, color: colorRef.current, size: brushSizeRef.current, tool, startX, startY } });
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (isDragging) return;
        e.stopPropagation();
        const c = ctxRef.current;
        setIsDrawing(true);
        const { x, y } = getCoords(e);
        if (tool === 'pen') {
            c?.beginPath(); c?.moveTo(x, y); c?.lineTo(x, y); c?.stroke();
            broadcastDraw('start', x, y);
        } else {
            setStartPoint({ x, y });
            if (c && canvasRef.current) setSnapshot(c.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        const c = ctxRef.current;
        if (!isDrawing || !c || !canvasRef.current) return;
        e.stopPropagation(); e.preventDefault();
        const { x, y } = getCoords(e);
        if (tool === 'pen') {
            c.lineTo(x, y); c.stroke(); c.beginPath(); c.moveTo(x, y);
            broadcastDraw('move', x, y);
        } else if (startPoint && snapshot) {
            c.putImageData(snapshot, 0, 0);
            if (tool === 'line') { c.beginPath(); c.moveTo(startPoint.x, startPoint.y); c.lineTo(x, y); c.stroke(); }
            else if (tool === 'rect') { c.strokeRect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y); }
            else if (tool === 'circle') {
                const rx = Math.abs(x - startPoint.x) / 2, ry = Math.abs(y - startPoint.y) / 2;
                c.beginPath(); c.ellipse(startPoint.x + (x - startPoint.x) / 2, startPoint.y + (y - startPoint.y) / 2, rx, ry, 0, 0, 2 * Math.PI); c.stroke();
            }
        }
    };

    const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const c = ctxRef.current;
        if (!isDrawing) return;
        setIsDrawing(false);
        if (startPoint && tool !== 'pen') {
            const { x, y } = getCoords(e);
            broadcastDraw(tool, x, y, startPoint.x, startPoint.y);
        }
        c?.beginPath();
        setSnapshot(null);
    };

    // Dragging
    useEffect(() => {
        const handleDragMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;
            const parent = containerRef.current.offsetParent as HTMLElement;
            if (parent) {
                const pr = parent.getBoundingClientRect();
                onMove(e.clientX - pr.left - dragOffset.x, e.clientY - pr.top - dragOffset.y);
            }
        };
        const onUp = () => setIsDragging(false);
        if (isDragging) { window.addEventListener('mousemove', handleDragMove); window.addEventListener('mouseup', onUp); }
        return () => { window.removeEventListener('mousemove', handleDragMove); window.removeEventListener('mouseup', onUp); };
    }, [isDragging, dragOffset]);

    // Resizing
    useEffect(() => {
        const handleResizeMove = (e: MouseEvent) => {
            if (!isResizing.current) return;
            const newW = Math.max(300, resizeStart.current.w + (e.clientX - resizeStart.current.x));
            const newH = Math.max(200, resizeStart.current.h + (e.clientY - resizeStart.current.y));
            setSize({ width: newW, height: newH });
        };
        const onUp = (e: MouseEvent) => {
            if (isResizing.current) {
                isResizing.current = false;
                const newW = Math.max(300, resizeStart.current.w + (e.clientX - resizeStart.current.x));
                const newH = Math.max(200, resizeStart.current.h + (e.clientY - resizeStart.current.y));
                onResize?.(newW, newH);
            }
        };
        window.addEventListener('mousemove', handleResizeMove);
        window.addEventListener('mouseup', onUp);
        return () => { window.removeEventListener('mousemove', handleResizeMove); window.removeEventListener('mouseup', onUp); };
    }, [onResize]);

    const toolBtn = (t: typeof tool, icon: React.ReactNode, label: string) => (
        <button onClick={() => setTool(t)} className={`p-1 rounded transition-colors ${tool === t ? 'bg-gray-300' : 'hover:bg-gray-200'}`} title={label}>
            {icon}
        </button>
    );

    return (
        <div ref={containerRef} className="absolute bg-white shadow-2xl border rounded-xl flex flex-col z-30 overflow-hidden"
            style={{ left: initialX, top: initialY, width: size.width, height: size.height + 44 }}
            onMouseDown={e => { if ((e.target as HTMLElement).closest('.wb-header')) { setIsDragging(true); const r = containerRef.current!.getBoundingClientRect(); setDragOffset({ x: e.clientX - r.left, y: e.clientY - r.top }); } }}
        >
            {/* Header */}
            <div className="wb-header h-11 bg-gray-50 border-b flex items-center justify-between px-2 cursor-move select-none rounded-t-xl">
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Board</span>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-5 h-5 p-0 border-0 rounded cursor-pointer" title="Color" />
                    <input type="range" min="1" max="20" value={brushSize} onChange={e => setBrushSize(+e.target.value)} className="w-14 h-1 accent-gray-600" />
                    <div className="w-px h-4 bg-gray-200 mx-0.5" />
                    {toolBtn('pen', <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>, 'Pen')}
                    {toolBtn('line', <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>, 'Line')}
                    {toolBtn('rect', <Square className="w-3 h-3" />, 'Rectangle')}
                    {toolBtn('circle', <Circle className="w-3 h-3" />, 'Circle')}
                    <div className="w-px h-4 bg-gray-200 mx-0.5" />
                    <button onClick={() => setShowGrid(!showGrid)} className={`p-1 rounded transition-colors ${showGrid ? 'bg-gray-300' : 'hover:bg-gray-200'}`} title="Toggle Grid">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </button>
                    <button onClick={() => { if (ctxRef.current && canvasRef.current) ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); }} className="p-1 rounded hover:bg-red-100 transition-colors" title="Clear">
                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
                <button onClick={onClose} className="hover:bg-red-100 p-1 rounded transition-colors text-red-400"><X className="h-4 w-4" /></button>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden bg-white">
                {showGrid && (
                    <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
                        style={{ backgroundImage: 'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)', backgroundSize: '20px 20px' }}
                    />
                )}
                <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair touch-none"
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                />
                {/* Resize handle */}
                <div
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-50 flex items-end justify-end pr-0.5 pb-0.5"
                    onMouseDown={e => {
                        e.stopPropagation();
                        isResizing.current = true;
                        resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
                    }}
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-400">
                        <path d="M1 9L9 1M5 9L9 5M9 9L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}
