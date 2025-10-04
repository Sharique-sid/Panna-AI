"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Twitter, Facebook, Linkedin, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
  isPublic: boolean;
  publicShareId: string | null;
  ensureShared: () => Promise<string>; // returns shareId
}

export function ShareDialog({ open, onOpenChange, noteId, isPublic, publicShareId, ensureShared }: ShareDialogProps) {
  const [shareId, setShareId] = useState<string | null>(publicShareId);
  const shareUrl = useMemo(() => (shareId ? `${window.location.origin}/s/${shareId}` : ""), [shareId]);

  useEffect(() => {
    setShareId(publicShareId);
  }, [publicShareId]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!shareId && open) {
        try {
          const id = await ensureShared();
          setShareId(id);
        } catch (e: any) {
          toast.error(e?.message || "Failed to create share link");
          onOpenChange(false);
        }
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const copy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  };

  const iconBtn = "h-9 w-9 p-0 justify-center";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share note</DialogTitle>
          <DialogDescription>Anyone with the link can view this note.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly value={shareUrl} className="flex-1" />
          <Button onClick={copy} variant="secondary" className={iconBtn}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <TooltipProvider>
          <div className="flex items-center gap-2 pt-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" className={iconBtn} aria-label="Share on Twitter">
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Twitter</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" className={iconBtn} aria-label="Share on Facebook">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Facebook</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" className={iconBtn} aria-label="Share on LinkedIn">
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>LinkedIn</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" className={iconBtn} aria-label="Share via Email">
                  <a href={`mailto:?subject=Shared note&body=${encodeURIComponent(shareUrl)}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Email</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


