"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Note, Category } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface NotesStore {
  notes: Note[];
  categories: Category[];
  selectedNote: Note | null;
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Setters
  setNotes: (notes: Note[]) => void;
  setCategories: (categories: Category[]) => void;
  setSelectedNote: (note: Note | null) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions
  loadNotes: () => Promise<void>;
  loadCategories: () => Promise<void>;
  createNote: () => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  purgeNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Real-time management
  cleanup: () => void;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => {
      const supabase = createClient();
      let realtimeChannel: any = null;

      // Initialize real-time subscription
      const initRealtime = () => {
        if (realtimeChannel) return; // Already initialized

        realtimeChannel = supabase
          .channel('notes-realtime')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notes',
            },
            (payload) => {
              console.log('New note created via real-time:', payload);
              // Add the new note to the store
              const newNote = {
                id: payload.new.id,
                userId: payload.new.user_id,
                title: payload.new.title,
                content: payload.new.content,
                categoryId: payload.new.category_id,
                tags: payload.new.tags || [],
                isFavorite: payload.new.is_favorite,
                deletedAt: payload.new.deleted_at,
                createdAt: payload.new.created_at,
                updatedAt: payload.new.updated_at,
              };
              
              set((state) => ({
                notes: [newNote, ...state.notes],
              }));

              // Show notification for new notes (likely from extension)
              if (typeof window !== 'undefined') {
                // Import toast dynamically to avoid SSR issues
                import('sonner').then(({ toast }) => {
                  toast.success(`📝 New note added: "${newNote.title}"`, {
                    description: 'Created from extension',
                    duration: 4000,
                  });
                });
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notes',
            },
            (payload) => {
              console.log('Note updated via real-time:', payload);
              // Update the note in the store
              set((state) => ({
                notes: state.notes.map((note) =>
                  note.id === payload.new.id
                    ? {
                        ...note,
                        title: payload.new.title,
                        content: payload.new.content,
                        categoryId: payload.new.category_id,
                        tags: payload.new.tags || [],
                        isFavorite: payload.new.is_favorite,
                        deletedAt: payload.new.deleted_at,
                        updatedAt: payload.new.updated_at,
                      }
                    : note
                ),
                selectedNote:
                  state.selectedNote?.id === payload.new.id
                    ? {
                        ...state.selectedNote,
                        title: payload.new.title,
                        content: payload.new.content,
                        categoryId: payload.new.category_id,
                        tags: payload.new.tags || [],
                        isFavorite: payload.new.is_favorite,
                        deletedAt: payload.new.deleted_at,
                        updatedAt: payload.new.updated_at,
                      }
                    : state.selectedNote,
              }));
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'notes',
            },
            (payload) => {
              console.log('Note deleted via real-time:', payload);
              // Remove the note from the store
              set((state) => ({
                notes: state.notes.filter((note) => note.id !== payload.old.id),
                selectedNote:
                  state.selectedNote?.id === payload.old.id
                    ? null
                    : state.selectedNote,
              }));
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
          });
      };

      // Cleanup real-time subscription
      const cleanupRealtime = () => {
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }
      };

      return {
        notes: [],
        categories: [],
        selectedNote: null,
        selectedCategory: "all",
        searchQuery: "",
        isLoading: false,
        error: null,

        setNotes: (notes) => set({ notes }),
        setCategories: (categories) => set({ categories }),
        setSelectedNote: (note) => set({ selectedNote: note }),
        setSelectedCategory: (categoryId) =>
          set({ selectedCategory: categoryId }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),

        loadNotes: async () => {
          set({ isLoading: true, error: null });
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            const user = userData.user;
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
              .from("notes")
              .select("*")
              .eq("user_id", user.id)
              .order("updated_at", { ascending: false });

            if (error) throw error;

            const notes = data.map((note) => ({
              id: note.id,
              userId: note.user_id,
              title: note.title,
              content: note.content,
              categoryId: note.category_id,
              tags: note.tags || [],
              isFavorite: note.is_favorite,
              deletedAt: note.deleted_at,
              createdAt: note.created_at,
              updatedAt: note.updated_at,
            }));

            set({ notes, isLoading: false });
            
            // Initialize real-time subscription after loading notes
            initRealtime();
          } catch (error: any) {
            set({ error: error.message, isLoading: false });
          }
        },

        loadCategories: async () => {
          try {
            const { data, error } = await supabase
              .from("categories")
              .select("*")
              .order("name");

            if (error) throw error;

            const categories = data.map((category) => ({
              id: category.id,
              userId: category.user_id,
              name: category.name,
              createdAt: category.created_at,
            }));

            set({ categories });
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        createNote: async () => {
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
              .from("notes")
              .insert({
                user_id: user.id,
                title: "Untitled",
                content: "",
                tags: [],
              })
              .select()
              .single();

            if (error) throw error;
            console.log("New note created:", data);

            const newNote: Note = {
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
            };

            set((state) => ({
              notes: [newNote, ...state.notes],
              selectedNote: newNote,
            }));
          } catch (error: any) {
            console.log("Error creating note:", error);
            set({ error: error.message });
          }
        },

        updateNote: async (id, updates) => {
          try {
            const { error } = await supabase
              .from("notes")
              .update({
                title: updates.title,
                content: updates.content,
                category_id: updates.categoryId,
                tags: updates.tags,
                is_favorite: updates.isFavorite,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id);

            if (error) throw error;

            set((state) => ({
              notes: state.notes.map((note) =>
                note.id === id
                  ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                  : note
              ),
              selectedNote:
                state.selectedNote?.id === id
                  ? {
                      ...state.selectedNote,
                      ...updates,
                      updatedAt: new Date().toISOString(),
                    }
                  : state.selectedNote,
            }));
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        deleteNote: async (id) => {
          try {
            const { error } = await supabase
              .from("notes")
              .update({
                deleted_at: new Date().toISOString(),
              })
              .eq("id", id);

            if (error) throw error;

            set((state) => ({
              notes: state.notes.map((note) =>
                note.id === id
                  ? { ...note, deletedAt: new Date().toISOString() }
                  : note
              ),
              selectedNote:
                state.selectedNote?.id === id ? null : state.selectedNote,
            }));
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        // Permanently delete a note (hard delete) – used from Trash
        purgeNote: async (id) => {
          try {
            const { error } = await supabase
              .from("notes")
              .delete()
              .eq("id", id);

            if (error) throw error;

            set((state) => ({
              notes: state.notes.filter((note) => note.id !== id),
              selectedNote:
                state.selectedNote?.id === id ? null : state.selectedNote,
            }));
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        restoreNote: async (id) => {
          try {
            const { error } = await supabase
              .from("notes")
              .update({
                deleted_at: null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id);

            if (error) throw error;

            set((state) => ({
              notes: state.notes.map((note) =>
                note.id === id
                  ? {
                      ...note,
                      deletedAt: null,
                      updatedAt: new Date().toISOString(),
                    }
                  : note
              ),
            }));
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        duplicateNote: async (id) => {
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const originalNote = get().notes.find((n) => n.id === id);
            if (!originalNote) throw new Error("Note not found");

            const { data, error } = await supabase
              .from("notes")
              .insert({
                user_id: user.id,
                title: `${originalNote.title} (Copy)`,
                content: originalNote.content,
                category_id: originalNote.categoryId,
                tags: originalNote.tags,
              })
              .select()
              .single();

            if (error) throw error;

            const duplicatedNote: Note = {
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
            };

            set((state) => ({
              notes: [duplicatedNote, ...state.notes],
            }));
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        toggleFavorite: async (id) => {
          try {
            const note = get().notes.find((n) => n.id === id);
            if (!note) return;

            const { error } = await supabase
              .from("notes")
              .update({
                is_favorite: !note.isFavorite,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id);

            if (error) throw error;

            set((state) => ({
              notes: state.notes.map((n) =>
                n.id === id
                  ? {
                      ...n,
                      isFavorite: !n.isFavorite,
                      updatedAt: new Date().toISOString(),
                    }
                  : n
              ),
              selectedNote:
                state.selectedNote?.id === id
                  ? {
                      ...state.selectedNote,
                      isFavorite: !state.selectedNote.isFavorite,
                    }
                  : state.selectedNote,
            }));
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        createCategory: async (name) => {
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
              .from("categories")
              .insert({
                user_id: user.id,
                name,
              })
              .select()
              .single();

            if (error) throw error;

            const newCategory: Category = {
              id: data.id,
              userId: data.user_id,
              name: data.name,
              createdAt: data.created_at,
            };

            set((state) => ({
              categories: [...state.categories, newCategory].sort((a, b) =>
                a.name.localeCompare(b.name)
              ),
            }));
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        updateCategory: async (id, name) => {
          try {
            const { error } = await supabase
              .from("categories")
              .update({ name })
              .eq("id", id);

            if (error) throw error;

            set((state) => ({
              categories: state.categories
                .map((cat) => (cat.id === id ? { ...cat, name } : cat))
                .sort((a, b) => a.name.localeCompare(b.name)),
            }));
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        deleteCategory: async (id) => {
          try {
            // First, remove category from all notes
            await supabase
              .from("notes")
              .update({ category_id: null })
              .eq("category_id", id);

            // Then delete the category
            const { error } = await supabase
              .from("categories")
              .delete()
              .eq("id", id);

            if (error) throw error;

            set((state) => ({
              categories: state.categories.filter((cat) => cat.id !== id),
              notes: state.notes.map((note) =>
                note.categoryId === id ? { ...note, categoryId: null } : note
              ),
              selectedCategory:
                state.selectedCategory === id ? "all" : state.selectedCategory,
            }));
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        cleanup: () => {
          cleanupRealtime();
        },
      };
    },
    {
      name: "notes-store",
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
        searchQuery: state.searchQuery,
      }),
      // Add storage size limit to prevent 431 errors
      storage: {
        getItem: (name: string) => {
          try {
            // Check if we're in browser environment
            if (typeof window === 'undefined') {
              return null;
            }
            
            // Check if we're in bypass mode
            if (window.location.pathname.includes('force-clear') || 
                window.location.pathname.includes('bypass-storage') ||
                sessionStorage.getItem('bypass-persistence') === 'true') {
              return null;
            }
            
            const item = localStorage.getItem(name);
            if (item && item.length > 50000) { // 50KB limit (reduced)
              console.warn("Storage item too large, clearing:", name);
              localStorage.removeItem(name);
              return null;
            }
            return item;
          } catch (error) {
            console.error("Error reading from storage:", error);
            return null;
          }
        },
        setItem: (name: string, value: string) => {
          try {
            // Check if we're in browser environment
            if (typeof window === 'undefined') {
              return;
            }
            
            // Check if we're in bypass mode
            if (sessionStorage.getItem('bypass-persistence') === 'true') {
              return; // Don't save anything in bypass mode
            }
            
            if (value.length > 50000) { // 50KB limit (reduced)
              console.warn("Storage item too large, not saving:", name);
              return;
            }
            localStorage.setItem(name, value);
          } catch (error) {
            console.error("Error writing to storage:", error);
          }
        },
        removeItem: (name: string) => {
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(name);
            }
          } catch (error) {
            console.error("Error removing from storage:", error);
          }
        },
      },
    }
  )
);
