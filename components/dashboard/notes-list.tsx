"use client";

import type React from "react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Star,
  Trash2,
  MoreHorizontal,
  Calendar,
  Tag,
  Loader2,
  FileText,
  CheckSquare,
  Square,
  CheckCheck,
  X,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Note } from "@/types";
import { useNotesStore } from "@/hooks/use-notes-store";
import { cn } from "@/lib/utils";

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  selectedCategory: string;
  onNoteSelect: (note: Note) => void;
  isLoading?: boolean;
  className?: string;
}

export function NotesList({
  notes,
  selectedNote,
  selectedCategory,
  onNoteSelect,
  isLoading = false,
  className,
}: NotesListProps) {
  const { toggleFavorite, deleteNote, duplicateNote, purgeNote, restoreNote } = useNotesStore();
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleMultiSelect = () => {
    if (isMultiSelectMode) {
      // Exit multi-select mode
      setIsMultiSelectMode(false);
      setSelectedNotes(new Set());
    } else {
      // Enter multi-select mode
      setIsMultiSelectMode(true);
    }
  };

  const handleNoteClick = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();

    if (isMultiSelectMode) {
      // In multi-select mode, toggle selection
      setSelectedNotes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(note.id)) {
          newSet.delete(note.id);
        } else {
          newSet.add(note.id);
        }
        return newSet;
      });
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd+click starts multi-select mode
      setIsMultiSelectMode(true);
      setSelectedNotes(new Set([note.id]));
    } else {
      // Normal single selection
      setIsMultiSelectMode(false);
      setSelectedNotes(new Set());
      onNoteSelect(note);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotes.size === notes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(notes.map(note => note.id)));
    }
  };

  const handleDeleteSelected = () => {
    selectedNotes.forEach(noteId => {
      deleteNote(noteId);
    });
    setSelectedNotes(new Set());
    setIsMultiSelectMode(false);
  };

  const handleRecoverSelected = () => {
    selectedNotes.forEach(noteId => {
      restoreNote(noteId);
    });
    setSelectedNotes(new Set());
    setIsMultiSelectMode(false);
  };

  const handlePurgeSelected = () => {
    selectedNotes.forEach(noteId => {
      purgeNote(noteId);
    });
    setSelectedNotes(new Set());
    setIsMultiSelectMode(false);
    setShowDeleteConfirm(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    toggleFavorite(noteId);
  };

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    deleteNote(noteId);
  };

  // duplicate action removed per request

  const handlePurgeNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    purgeNote(noteId);
  };

  const handleRestoreNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    restoreNote(noteId);
  };

  const handleDragStart = (e: React.DragEvent, note: Note) => {
    setDraggedNote(note);
    e.dataTransfer.setData("text/plain", note.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetNote: Note) => {
    e.preventDefault();
    if (draggedNote && draggedNote.id !== targetNote.id) {
      console.log("Reorder notes:", draggedNote.id, "->", targetNote.id);
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-muted/10", className)}>
      <div className="p-4 border-b border-muted-foreground/20 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Notes</h2>
            {isMultiSelectMode && (
              <Badge variant="outline" className="text-xs">
                {selectedNotes.size} selected
              </Badge>
            )}
          </div>
        <div className="flex items-center gap-2">
          {isMultiSelectMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-6 px-2 text-xs"
              >
                {selectedNotes.size === notes.length ? "None" : "All"}
              </Button>
              {selectedCategory === "trash" ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRecoverSelected}
                    className="h-6 px-2 text-xs text-green-600 hover:text-green-600"
                    disabled={selectedNotes.size === 0}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <DropdownMenu open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                        disabled={selectedNotes.size === 0}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={handlePurgeSelected}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete {selectedNotes.size} note(s) permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                  disabled={selectedNotes.size === 0}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleMultiSelect}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMultiSelect}
                className="h-6 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Multi-Select
              </Button>
              <Badge variant="secondary" className="text-xs">
                {notes.length}
              </Badge>
            </>
          )}
        </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p className="font-medium">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No notes found</p>
              <p className="text-sm text-muted-foreground/70">
                Create your first note to get started
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                draggable
                onDragStart={(e) => handleDragStart(e, note)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, note)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-all duration-200 group border border-transparent",
                  selectedNote?.id === note.id &&
                    "bg-accent border-accent-foreground/20 shadow-sm",
                  selectedNotes.has(note.id) && isMultiSelectMode &&
                    "bg-accent/30 border-accent-foreground/30 shadow-sm",
                  draggedNote?.id === note.id && "opacity-50"
                )}
                onClick={(e) => handleNoteClick(e, note)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {(isMultiSelectMode || selectedNotes.has(note.id)) && (
                      <div className="mt-0.5">
                        {selectedNotes.has(note.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium break-words">
                          {note.title || "Untitled"}
                        </h3>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed break-words">
                        {note.content?.replace(/[#*`]/g, "").replace(/!\[.*?\]\(.*?\)/g, "").replace(/<!-- Images -->.*$/s, "").trim() || "No content"}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="break-words">
                            {formatDistanceToNow(new Date(note.updatedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {note.tags && note.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 h-4"
                            >
                              {note.tags[0]}
                              {note.tags.length > 1 &&
                                ` +${note.tags.length - 1}`}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!note.deletedAt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => handleToggleFavorite(e, note.id)}
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            note.isFavorite && "fill-yellow-400 text-yellow-400"
                          )}
                        />
                      </Button>
                    )}
                    
                    {note.deletedAt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-green-600 hover:text-green-600"
                        onClick={(e) => handleRestoreNote(e, note.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {note.deletedAt ? (
                          <DropdownMenuItem
                            onClick={(e) => handlePurgeNote(e, note.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete permanently
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteNote(e, note.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
