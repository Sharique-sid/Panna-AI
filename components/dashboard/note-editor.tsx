"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Star,
  Trash2,
  Share,
  Users,
  Clock,
  Wifi,
  WifiOff,
  MoreHorizontal,
  Info,
  Link2,
  Eye,
  Edit3,
  PanelRightOpen,
  Image,
  X,
  Sparkles,
} from "lucide-react";
import { Maximize2, Minimize2 } from "lucide-react";
import type { Note, Category } from "@/types";
import { useNotesStore } from "@/hooks/use-notes-store";
import { SimpleTagInput } from "@/components/dashboard/simple-tag-input";
import { AIToolsMenu } from "@/components/dashboard/ai-tools-menu";
import { KeyboardShortcutsDialog } from "@/components/dashboard/keyboard-shortcuts-dialog";
import { FeatureNotReadyDialog } from "@/components/dashboard/feature-not-ready-dialog";
import { ShareDialog } from "@/components/dashboard/share-dialog";
import { toast } from "sonner";
import { CategorySelect } from "@/components/dashboard/category-select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAI } from "@/hooks/use-ai";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { TagDisplay } from "./tag-display";

interface NoteEditorProps {
  note: Note | null;
  categories: Category[];
  onBackToList?: () => void;
  showBackButton?: boolean;
  className?: string;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export function NoteEditor({
  note,
  categories,
  onBackToList,
  showBackButton,
  className,
  isFocusMode = false,
  onToggleFocusMode,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [featureDialog, setFeatureDialog] = useState<string | null>(null);
  const [publicShareId, setPublicShareId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isOnline] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  // Related notes removed
  const [shareOpen, setShareOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editorWidthPct, setEditorWidthPct] = useState<number>(70);
  const IMAGE_PANEL_WIDTH_PX = 160; // fixed width for images panel
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { updateNote, toggleFavorite, deleteNote, createCategory, createNote } =
    useNotesStore();
  const {
    summarizeText,
    rephraseText,
    translateText,
    generateTemplate,
    generateTags,
    isLoading,
  } = useAI();
  const isMobile = useIsMobile();
  const supabase = createClient();

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setCategoryId(note.categoryId || "");
      setTags(note.tags || []);
      setHasUnsavedChanges(false);
      setLastSaved(note.updatedAt ? new Date(note.updatedAt) : null);
      setPublicShareId((note as any).publicShareId || null);
      setIsPublic(!!(note as any).isPublic);
    }
  }, [note]);

  const handleSave = useCallback(async () => {
    if (note && hasUnsavedChanges) {
      updateNote(note.id, {
        title: title.trim() || "",
        content,
        categoryId: categoryId || undefined,
        tags,
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    }
  }, [note, title, content, categoryId, tags, hasUnsavedChanges, updateNote]);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasUnsavedChanges && isOnline) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, handleSave, isOnline]);

  // Auto-generate tags disabled to preserve AI API rate limits (tags generated via AI Menu on demand)

  const handleTitleChange = (value: string) => {
    // Limit length
    if (value.length <= 100) {
      setTitle(value);
      setHasUnsavedChanges(true);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasUnsavedChanges(true);
  };


  const insertMarkdown = (before: string, after: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);

    const newText = content.slice(0, start) + before + selectedText + after + content.slice(end);
    const newCursorPos = start + before.length + selectedText.length;

    handleContentChange(newText);

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const createNewNote = async () => {
    console.log('=== createNewNote function called ===');
    try {
      await createNote();
      console.log('=== New note created successfully ===');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create new note');
    }
  };

  const saveNote = async () => {
    if (!title.trim() && !content.trim()) {
      console.log('Cannot save empty note');
      return;
    }

    try {
      const noteData = {
        title: title.trim() || 'Untitled',
        content,
        categoryId: categoryId || undefined,
        tags,
        isPublic,
      };

      if (note) {
        // Update existing note
        await updateNote(note.id, noteData);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast.success('Note saved successfully');
      } else {
        // For new notes, create in store
        await createNote();
        toast.success('Note created');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const focusSearch = () => {
    // Try to focus the search input in the sidebar
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      console.log('Search focused');
    } else {
      console.log('Search input not found');
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setHasUnsavedChanges(true);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setHasUnsavedChanges(true);
  };

  // Marker separating text content from image gallery section
  const IMAGE_SECTION_MARKER = "\n<!-- Images -->\n";

  // AI Functions (simulated)
  const handleAISummarize = async () => {
    if (!content) return;
    const summary = await summarizeText(content, note?.id);
    if (summary) {
      handleContentChange(content + "\n\n## Summary\n" + summary);
    }
  };

  const handleAIRephrase = async (
    style: "formal" | "informal" | "concise" | "extended"
  ) => {
    if (!content) return;

    // 1. SEPARATE text from images
    const textToProcess = getCleanText(content);
    const preservedImageMarkdown = extractImageMarkdown(content);

    if (!textToProcess) return;

    // 2. PROCESS only the text
    const rephrasedText = await rephraseText(textToProcess, style, note?.id);

    // 3. RECOMBINE the AI result with the preserved images
    if (rephrasedText) {
      const newContent = rephrasedText + preservedImageMarkdown;
      handleContentChange(newContent);
    }
  };

  const handleAITranslate = async (language: string) => {
    if (!content) return;

    // 1. SEPARATE text from images
    const textToProcess = getCleanText(content);
    const preservedImageMarkdown = extractImageMarkdown(content);

    if (!textToProcess) return;

    // 2. PROCESS only the text
    const translatedText = await translateText(textToProcess, language, note?.id);

    // 3. RECOMBINE the AI result with the preserved images
    if (translatedText) {
      const newContent = translatedText + preservedImageMarkdown;
      handleContentChange(newContent);
    }
  };

  const handleGenerateTemplate = async (
    type: "meeting" | "project" | "daily" | "research"
  ) => {
    if (!content) return;

    // 1. SEPARATE text from images
    const textToProcess = getCleanText(content);
    const preservedImageMarkdown = extractImageMarkdown(content);

    // 2. PROCESS - Generate template (this replaces the text content)
    const template = await generateTemplate(type, note?.id);

    // 3. RECOMBINE the template with the preserved images
    if (template) {
      const newContent = template + preservedImageMarkdown;
      handleContentChange(newContent);
    }
  };

  const handleGenerateTags = async () => {
    if (!content || tags.length >= 2) return; // Don't generate if content is empty or tags limit reached

    const suggestedTags = await generateTags(content, note?.id);
    if (suggestedTags && Array.isArray(suggestedTags)) {
      // Calculate how many new tags we can add
      const remainingSlots = 2 - tags.length;
      if (remainingSlots <= 0) return;

      const limitedTags = suggestedTags.slice(0, remainingSlots);
      const newTags = [...new Set([...tags, ...limitedTags])];
      handleTagsChange(newTags);
    }
  };

  // ... (rest of the code)

  <SimpleTagInput
    tags={tags}
    onChange={handleTagsChange}
    placeholder="Add tags..."
    maxTags={2}
  />

  const handleToggleFavorite = () => {
    if (note) {
      toggleFavorite(note.id);
    }
  };

  const enableShare = async () => {
    if (!note) return;
    const res = await fetch("/api/notes/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId: note.id, action: "enable" }),
    });
    const data = await res.json();
    if (res.ok) {
      setPublicShareId(data.shareId);
      setIsPublic(true);
      toast.success("Share link created");
      return data.shareId as string;
    } else {
      toast.error(data.error || "Failed to enable share");
      throw new Error(data.error || "Failed to enable share");
    }
  };

  const disableShare = async () => {
    if (!note) return;
    const res = await fetch("/api/notes/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId: note.id, action: "disable" }),
    });
    const data = await res.json();
    if (res.ok) {
      setPublicShareId(null);
      setIsPublic(false);
      toast.success("Share disabled");
    } else {
      toast.error(data.error || "Failed to disable share");
    }
  };

  const copyShareLink = async () => {
    const id = publicShareId || (await enableShare());
    const url = `${window.location.origin}/s/${id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleDeleteNote = () => {
    if (note) {
      deleteNote(note.id);
      if (onBackToList) {
        onBackToList();
      }
    }
  };

  // Helper function to extract image URLs from the IMAGES section only
  const extractImages = (text: string): string[] => {
    const markerIndex = text.indexOf(IMAGE_SECTION_MARKER);
    if (markerIndex === -1) return [];
    const imagesBlock = text.slice(markerIndex + IMAGE_SECTION_MARKER.length);
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = imageRegex.exec(imagesBlock)) !== null) {
      // De-duplicate
      const url = match[1];
      if (!matches.includes(url)) matches.push(url);
    }
    return matches;
  };

  // Helper function to get clean text content (without image markdown)
  const getCleanText = (text: string): string => {
    const markerIndex = text.indexOf(IMAGE_SECTION_MARKER);
    if (markerIndex >= 0) {
      return text.slice(0, markerIndex);
    }
    return text;
  };

  // Helper function to extract image markdown section (everything after the marker)
  const extractImageMarkdown = (fullContent: string): string => {
    const markerIndex = fullContent.indexOf(IMAGE_SECTION_MARKER);
    if (markerIndex >= 0) {
      return fullContent.slice(markerIndex);
    }
    return '';
  };

  // Helper function to remove an image from content
  const removeImage = (imageUrl: string) => {
    const currentImages = extractImages(content);
    const cleanText = getCleanText(content);
    // Remove all occurrences of this exact URL (robust against duplicates)
    const remainingImages = currentImages.filter(url => url !== imageUrl);
    const imageSection = remainingImages.length > 0
      ? `${IMAGE_SECTION_MARKER}${remainingImages.map(url => `![Image](${url})`).join('\n')}`
      : '';
    // Also strip any accidental occurrence of the image markdown from the text area
    const accidentalImageInText = cleanText.replace(new RegExp(`!\\\[.*?\\\]\(${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\)`, 'g'), '');
    handleContentChange(accidentalImageInText + imageSection);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !note) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);

    try {
      // Get upload URL
      const uploadResponse = await fetch("/api/notes/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: note.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Failed to get upload URL");
      }

      // Upload file to Supabase storage
      const uploadResult = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload image");
      }

      // Get public URL
      const { data: { publicUrl } } = await supabase.storage
        .from("note-images")
        .getPublicUrl(uploadData.fileName);

      // Add image to the content
      const imageMarkdown = `![${file.name}](${publicUrl})`;
      const currentImages = extractImages(content);
      const cleanText = getCleanText(content);

      // Add new image to the list
      const allImages = [...currentImages, publicUrl];
      const imageSection = allImages.length > 0 ? `${IMAGE_SECTION_MARKER}${allImages.map(url => `![Image](${url})`).join('\n')}` : '';

      handleContentChange(cleanText + imageSection);

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      (event.target as HTMLInputElement).value = '';
    }
  };

  const hasImages = extractImages(content).length > 0;

  // Reset width when there are no images; clamp when there are
  useEffect(() => {
    if (!hasImages) {
      setEditorWidthPct(100);
    } else {
      setEditorWidthPct((w) => Math.min(90, Math.max(50, w)));
    }
  }, [hasImages]);

  const onDragStart = (e: React.MouseEvent) => {
    if (!hasImages) return;
    isDraggingRef.current = true;
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
    e.preventDefault();
  };

  const onDragMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    const clamped = Math.min(90, Math.max(50, pct));
    setEditorWidthPct(clamped);
  };

  const onDragEnd = () => {
    isDraggingRef.current = false;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
  };

  // Fullscreen controls
  const toggleFullscreen = async () => {
    // Use in-app focus mode if handler provided, otherwise fallback to FS API
    if (onToggleFocusMode) {
      onToggleFocusMode();
      return;
    }
    try {
      if (!isFullscreen) {
        await containerRef.current?.requestFullscreen?.();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) { }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Debug all keyboard events
      if (e.ctrlKey || e.altKey || e.shiftKey) {
        console.log('=== KEYBOARD EVENT ===');
        console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Alt:', e.altKey, 'Shift:', e.shiftKey);
        console.log('Event target:', e.target);
      }

      // Only handle shortcuts when the note editor is visible and focused
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();

        // Handle Ctrl+Shift+E for preview toggle
        if (e.shiftKey && key === 'e') {
          e.preventDefault();
          console.log('Global Ctrl+Shift+E pressed, current preview mode:', isPreviewMode);
          setIsPreviewMode(!isPreviewMode);
          console.log('Preview mode toggled to:', !isPreviewMode);
          return;
        }

        // Handle Ctrl+Shift+T for new note
        if (e.shiftKey && key === 't') {
          e.preventDefault();
          console.log('=== Global Ctrl+Shift+T detected! ===');
          console.log('Calling createNewNote()...');
          createNewNote();
          return;
        }

        // Handle Ctrl+Shift+H for focusing title
        if (e.shiftKey && key === 'h') {
          e.preventDefault();
          console.log('=== Global Ctrl+Shift+H detected! ===');
          titleInputRef.current?.focus();
          titleInputRef.current?.select();
          return;
        }

        // Handle other shortcuts
        switch (key) {
          case 'b':
            e.preventDefault();
            insertMarkdown('**', '**');
            break;
          case 'i':
            e.preventDefault();
            insertMarkdown('*', '*');
            break;
          case 'u':
            e.preventDefault();
            insertMarkdown('<u>', '</u>');
            break;
          case 'k':
            e.preventDefault();
            insertMarkdown('[', '](url)');
            break;
          case 's':
            e.preventDefault();
            saveNote();
            break;
          case 'f':
            e.preventDefault();
            focusSearch();
            break;
        }
      }
    };

    // Add global event listener
    document.addEventListener('keydown', handleGlobalKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isPreviewMode, insertMarkdown, createNewNote, saveNote, focusSearch]);

  const renderPreview = () => {
    return (
      <div
        className="prose prose-sm max-w-none p-4"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg shadow-sm my-4"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            )
          }}
        >
          {content || "No content"}
        </ReactMarkdown>
      </div>
    );
  };

  if (!note) {
    return (
      <div
        className={cn(
          "h-full flex items-center justify-center text-muted-foreground bg-muted/10",
          className
        )}
      >
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto opacity-50" />
          <div>
            <p className="font-medium">Select a note to start editing</p>
            <p className="text-sm text-muted-foreground/70">
              Choose from your notes or create a new one
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Editor Header */}
      <div className="border-b border-muted-foreground/20 bg-background/95 backdrop-blur">
        <div className="p-3 lg:p-4 space-y-3">
          {/* Status and Actions Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span className="hidden sm:inline">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              {lastSaved && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    Saved{" "}
                    {lastSaved.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Unsaved
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="h-6 w-6 p-0"
                title={isPreviewMode ? "Edit Mode (Ctrl+Shift+E)" : "Preview Mode (Ctrl+Shift+E)"}
              >
                {isPreviewMode ? (
                  <Edit3 className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
              {/* Related notes button removed */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(true)}
                className="h-6 w-6 p-0"
              >
                <Info className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-6 w-6 p-0"
                title={isFullscreen ? "Exit full screen" : "Enter full screen"}
              >
                {isFocusMode || isFullscreen ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="h-6 w-6 p-0"
              >
                <Star
                  className={cn(
                    "h-3 w-3",
                    note.isFavorite && "fill-yellow-400 text-yellow-400"
                  )}
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setFeatureDialog("collaboration")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Collaborate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShareOpen(true)}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteNote}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Title */}
          <div className="relative group">
            <Input
              ref={titleInputRef}
              placeholder="Untitled Note"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={cn(
                "text-lg lg:text-xl font-semibold border-0 px-0 focus-visible:ring-0 bg-transparent",
                "transition-all duration-200 ease-in-out",
                "placeholder:text-muted-foreground/60 placeholder:font-normal",
                "hover:bg-muted/30 focus:bg-muted/50 rounded-md px-2 py-1",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "min-h-[2.5rem] flex items-center",
                title ? "text-foreground" : "text-muted-foreground"
              )}
              maxLength={100}
              autoFocus={!note}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  titleInputRef.current?.blur();
                }
              }}
            />
          </div>

          {/* Metadata and Tools */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 sm:items-center">
            <CategorySelect
              categories={categories}
              value={categoryId}
              onValueChange={handleCategoryChange}
              onCreateCategory={createCategory}
            />

            <div className="flex-1 min-w-0">
              {isPreviewMode ? (
                <TagDisplay
                  tags={tags}
                  isPreview={true}
                  maxPreviewTags={3}
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <SimpleTagInput
                    tags={tags}
                    onChange={handleTagsChange}
                    placeholder="Add tags..."
                    maxTags={2}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploadingImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isUploadingImage}
                    className="h-8 px-3 text-xs shrink-0"
                  >
                    <Image className="h-3 w-3 mr-1" />
                    {isUploadingImage ? "Uploading..." : "Add Image"}
                  </Button>
                </div>
              )}
            </div>

            <AIToolsMenu
              onSummarize={handleAISummarize}
              onRephrase={handleAIRephrase}
              onTranslate={handleAITranslate}
              onGenerateTemplate={handleGenerateTemplate}
              onGenerateTags={handleGenerateTags}
            />
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {isPreviewMode ? (
            <div className="h-full overflow-auto">{renderPreview()}</div>
          ) : (
            <div className={cn("h-full flex w-full transform transition-all duration-300", isFocusMode ? "translate-x-0" : "translate-x-0")} ref={containerRef}>
              {/* Left: Text Editor */}
              <div className="overflow-hidden" style={{
                width: hasImages ? `calc(100% - ${IMAGE_PANEL_WIDTH_PX}px)` : '100%',
                flex: '1 1 auto'
              }}>
                <Textarea
                  value={getCleanText(content)}
                  onChange={(e) => {
                    const cleanText = e.target.value;
                    const images = extractImages(content);
                    // Only add image markdown if there are actually images
                    const imageMarkdown = images.length > 0 ? `${IMAGE_SECTION_MARKER}${images.map(url => `![Image](${url})`).join('\n')}` : '';
                    // Ensure no image markdown leaks into the text area
                    const sanitized = cleanText.replace(/!\[.*?\]\(.*?\)/g, '');
                    handleContentChange(sanitized + imageMarkdown);
                  }}
                  placeholder="Start writing here..."
                  className="w-full h-full resize-none border-0 focus-visible:ring-0 bg-transparent text-sm leading-relaxed p-4 whitespace-pre-wrap break-words"
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    wordBreak: 'normal',
                    overflowWrap: 'break-word'
                  }}
                />
              </div>
              {/* Divider for resizing */}
              {/* Resizer removed for fixed image panel width */}

              {/* Right: Image Gallery - keep visible in focus mode, fixed width */}
              {hasImages && (
                <div className="overflow-auto border-l border-muted-foreground/20 bg-background/50" style={{ width: `${IMAGE_PANEL_WIDTH_PX}px`, flex: `0 0 ${IMAGE_PANEL_WIDTH_PX}px` }}>
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground text-center">Images</h3>
                    <div className="space-y-3">
                      {extractImages(content).map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            className="w-full h-auto rounded-lg shadow-sm"
                            style={{ maxHeight: '150px', objectFit: 'contain' }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(imageUrl)}
                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                          >
                            <X className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Notes removed */}
      </div>

      {/* Dialogs */}
      <KeyboardShortcutsDialog
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />

      <FeatureNotReadyDialog
        open={!!featureDialog}
        onOpenChange={() => setFeatureDialog(null)}
        feature={featureDialog || ""}
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        noteId={note.id}
        isPublic={isPublic}
        publicShareId={publicShareId}
        ensureShared={async () => {
          const id = await enableShare();
          return id || "";
        }}
      />
    </div>
  );
}
