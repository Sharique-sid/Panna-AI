"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";
import { NotesList } from "./notes-list";
import { NoteEditor } from "./note-editor";
import { useNotesStore } from "@/hooks/use-notes-store";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  user: User;
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const {
    notes,
    categories,
    selectedNote,
    selectedCategory,
    searchQuery,
    isLoading,
    setSelectedNote,
    setSelectedCategory,
    setSearchQuery,
    loadNotes,
    loadCategories,
    createCategory,
  } = useNotesStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const isMobile = useIsMobile();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadNotes(), loadCategories()]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    loadData();
  }, [loadNotes, loadCategories]);

  // Filter notes based on selected category and search query
  const normalizedQuery = (searchQuery || "").trim().toLowerCase();
  const byCategory =
    normalizedQuery
      ? // When searching, ignore specific categories and search across all
        (selectedCategory === "trash"
          ? notes.filter((n) => n.deletedAt)
          : notes.filter((n) => !n.deletedAt))
      : // Normal (non-search) filtering by selected category
        selectedCategory === "trash"
      ? notes.filter((n) => n.deletedAt)
      : selectedCategory === "favorites"
      ? notes.filter((n) => n.isFavorite && !n.deletedAt)
      : selectedCategory === "all"
      ? notes.filter((n) => !n.deletedAt)
      : notes.filter((n) => n.categoryId === selectedCategory && !n.deletedAt);

  const filteredNotes = normalizedQuery
    ? byCategory.filter((n) => {
        const title = (n.title || "").toLowerCase();
        const content = (n.content || "").replace(/!\[.*?\]\(.*?\)/g, "").toLowerCase();
        const tagsText = (n.tags || []).join(" ").toLowerCase();
        return (
          title.includes(normalizedQuery) ||
          content.includes(normalizedQuery) ||
          tagsText.includes(normalizedQuery)
        );
      })
    : byCategory;

  // Auto-hide sidebar on mobile when note is selected
  useEffect(() => {
    if (isMobile && selectedNote) {
      setSidebarOpen(false);
    }
  }, [isMobile, selectedNote]);

  // Auto-show sidebar on mobile when no note is selected
  useEffect(() => {
    if (isMobile && !selectedNote) {
      setSidebarOpen(true);
    }
  }, [isMobile, selectedNote]);

  const handleNoteSelect = (note: typeof selectedNote) => {
    setSelectedNote(note);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setSelectedNote(null);
      setSidebarOpen(true);
    }
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen w-full">
        <AppSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          user={user}
          onCreateCategory={createCategory}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <SidebarInset className="flex flex-col">
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            user={user}
            onBackToList={handleBackToList}
            showBackButton={isMobile && !!selectedNote}
          />

          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Notes List - Hidden on mobile when note is selected */}
            <div
              className={cn(
                "border-r border-muted-foreground/20 bg-muted/10 min-h-0 overflow-hidden transform transition-all duration-300",
                isMobile && selectedNote ? "hidden" : "flex",
                isMobile ? "flex-1" : "w-80 xl:w-96",
                isFocusMode ? "-translate-x-full" : "translate-x-0"
              )}
              style={{ width: isFocusMode && !isMobile ? 0 : undefined }}
              aria-hidden={isFocusMode}
            >
              <NotesList
                notes={filteredNotes}
                selectedNote={selectedNote}
                selectedCategory={selectedCategory}
                onNoteSelect={handleNoteSelect}
                className="w-full"
                isLoading={isLoading}
              />
            </div>

            {/* Note Editor - Full width on mobile when note is selected */}
            <div
              className={cn(
                "flex-1 transition-all duration-300",
                isMobile && !selectedNote && "hidden"
              )}
            >
              <NoteEditor
                note={selectedNote}
                categories={categories}
                onBackToList={handleBackToList}
                showBackButton={isMobile}
                isFocusMode={isFocusMode}
                onToggleFocusMode={() => setIsFocusMode((v) => !v)}
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
