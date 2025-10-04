"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  FileText,
  Star,
  Trash2,
  Plus,
  Folder,
  Settings,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Category, User } from "@/types";
import { useNotesStore } from "@/hooks/use-notes-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AppSidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  user: User;
  onCreateCategory: (name: string) => void;
  onToggleSidebar?: () => void;
}

export function AppSidebar({
  categories,
  selectedCategory,
  onCategorySelect,
  user,
  onCreateCategory,
  onToggleSidebar,
}: AppSidebarProps) {
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatches for theme-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const { createNote, notes } = useNotesStore();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" });
      if (res.ok) {
        router.push("/"); // or your login page
      } else {
        toast.error("Failed to sign out");
      }
    } catch (e) {
      toast.error("Failed to sign out");
    }
  };

  const handleNewNote = () => {
    createNote();
  };

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      onCreateCategory(newCategoryName.trim());
      setNewCategoryName("");
      setIsCreatingCategory(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateCategory();
    } else if (e.key === "Escape") {
      setIsCreatingCategory(false);
      setNewCategoryName("");
    }
  };

  const mainItems = [
    {
      id: "all",
      label: "All Notes",
      icon: FileText,
      count: notes.filter((n) => !n.deletedAt).length,
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: Star,
      count: notes.filter((n) => n.isFavorite && !n.deletedAt).length,
    },
    {
      id: "trash",
      label: "Trash",
      icon: Trash2,
      count: notes.filter((n) => n.deletedAt).length,
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <Sidebar className="border-r bg-sidebar data-[mobile=true]:bg-sidebar">
      <SidebarHeader className="p-4 border-b bg-sidebar/95 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onToggleSidebar}
            className="relative flex items-center justify-center w-10 h-10 hover:bg-muted/50 rounded-lg transition-colors duration-200"
            title="Toggle sidebar"
          >
            {/* Static logo image with jpg fallback */}
            <img
              src="/123-removebg-preview.png"
              alt="Panna.ai"
              className={`w-10 h-10 object-contain ${theme === 'dark' ? 'invert' : ''}`}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = '1';
                  target.src = '/123-removebg-preview.jpg';
                }
              }}
            />
          </button>
          <span className={`font-bold text-xl ${
            theme === 'dark' 
              ? 'text-white' 
              : 'text-black'
          }`}>
            Panna.ai
          </span>
        </div>

        <Button onClick={handleNewNote} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Note
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+T</span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-3 overflow-hidden bg-sidebar/95">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={selectedCategory === item.id}
                    onClick={() => onCategorySelect(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-3" />

        <SidebarGroup className="flex-1 overflow-hidden min-h-0">
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Categories</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatingCategory(true)}
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>

          <SidebarGroupContent className="overflow-hidden min-h-0">
            <div className="h-full overflow-y-auto pr-1">
              <SidebarMenu>
                {isCreatingCategory && (
                  <SidebarMenuItem>
                    <div className="px-2 py-1">
                      <Input
                        placeholder="Category name..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                          if (!newCategoryName.trim()) {
                            setIsCreatingCategory(false);
                          }
                        }}
                        className="h-7 text-xs"
                        autoFocus
                      />
                    </div>
                  </SidebarMenuItem>
                )}

                {categories.map((category) => {
                  const categoryNotes = notes.filter(
                    (n) => n.categoryId === category.id && !n.deletedAt
                  );
                  return (
                    <SidebarMenuItem key={category.id}>
                      <SidebarMenuButton
                        isActive={selectedCategory === category.id}
                        onClick={() => onCategorySelect(category.id)}
                      >
                        <Folder className="h-4 w-4" />
                        <span className="flex-1 truncate">{category.name}</span>
                        {categoryNotes.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {categoryNotes.length}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

                {categories.length === 0 && !isCreatingCategory && (
                  <SidebarMenuItem>
                    <div className="px-2 py-4 text-center text-muted-foreground">
                      <Folder className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No categories yet</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCreatingCategory(true)}
                        className="mt-2 h-6 text-xs"
                      >
                        Create your first category
                      </Button>
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-sidebar/95">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-12 px-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 rounded-full bg-neutral-800 text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 border border-neutral-300/50 dark:border-neutral-300/30">
                  <span className="text-sm font-medium">
                    {user.user_metadata?.first_name?.[0] ||
                      user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
