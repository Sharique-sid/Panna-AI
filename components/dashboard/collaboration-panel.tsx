"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Users,
  Share2,
  Copy,
  Check,
  Send,
  ScreenShare,
  MoreVertical
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface Collaborator {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: "owner" | "editor" | "viewer"
  is_online: boolean
  last_seen?: string
}

interface ChatMessage {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  message: string
  created_at: string
}

interface CollaborationPanelProps {
  noteId: string
  currentUserId: string
  isPublic: boolean
  shareLink?: string
}

export function CollaborationPanel({
  noteId,
  currentUserId,
  isPublic,
  shareLink
}: CollaborationPanelProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)

  const supabase = createClient()

  // Load collaborators
  useEffect(() => {
    loadCollaborators()
    subscribeToPresence()
  }, [noteId])

  // Load chat messages
  useEffect(() => {
    loadChatMessages()
    subscribeToChat()
  }, [noteId])

  const loadCollaborators = async () => {
    // TODO: Load from database
    // Mock data for now
    setCollaborators([
      {
        id: currentUserId,
        email: "you@example.com",
        name: "You",
        role: "owner",
        is_online: true
      }
    ])
  }

  const loadChatMessages = async () => {
    // TODO: Load from database
    setChatMessages([])
  }

  const subscribeToPresence = () => {
    const channel = supabase
      .channel(`collab-${noteId}`)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        // Update online users
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const subscribeToChat = () => {
    const channel = supabase
      .channel(`chat-${noteId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "note_chat_messages",
          filter: `note_id=eq.${noteId}`
        },
        (payload) => {
          setChatMessages(prev => [...prev, payload.new as ChatMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      user_id: currentUserId,
      user_name: "You",
      message: newMessage,
      created_at: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, message])
    setNewMessage("")

    // TODO: Save to database
    toast.success("Message sent")
  }

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  const handleStartCall = () => {
    setIsInCall(true)
    setIsVideoOn(true)
    setIsAudioOn(true)
    toast.success("Video call started")
    // TODO: Initialize WebRTC connection
  }

  const handleEndCall = () => {
    setIsInCall(false)
    setIsVideoOn(false)
    setIsAudioOn(false)
    toast("Call ended")
    // TODO: Close WebRTC connection
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    toast(isVideoOn ? "Camera off" : "Camera on")
  }

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn)
    toast(isAudioOn ? "Microphone muted" : "Microphone unmuted")
  }

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        {/* Share Link */}
        {isPublic && shareLink && (
          <div className="flex gap-2">
            <Input
              value={shareLink}
              readOnly
              className="text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
            >
              {linkCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Collaborators List */}
      <div className="p-4 border-b">
        <p className="text-sm text-muted-foreground mb-3">
          {collaborators.length} {collaborators.length === 1 ? "person" : "people"} collaborating
        </p>
        <div className="space-y-2">
          {collaborators.map((collab) => (
            <div key={collab.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={collab.avatar_url} />
                <AvatarFallback>
                  {collab.name?.[0] || collab.email[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{collab.name || collab.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{collab.role}</p>
              </div>
              {collab.is_online && (
                <Badge variant="secondary" className="text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                  Online
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Video Call Controls */}
      <div className="p-4 border-b bg-muted/50">
        {!isInCall ? (
          <Button
            onClick={handleStartCall}
            className="w-full"
            variant="default"
          >
            <Video className="h-4 w-4 mr-2" />
            Start Video Call
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={toggleVideo}
                variant={isVideoOn ? "default" : "destructive"}
                size="sm"
                className="flex-1"
              >
                {isVideoOn ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={toggleAudio}
                variant={isAudioOn ? "default" : "destructive"}
                size="sm"
                className="flex-1"
              >
                {isAudioOn ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleEndCall}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <ScreenShare className="h-4 w-4 mr-2" />
              Share Screen
            </Button>
          </div>
        )}
      </div>

      {/* Chat */}
      {showChat && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 pb-2">
            <h4 className="text-sm font-semibold">Chat</h4>
          </div>
          
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 pb-4">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={msg.user_avatar} />
                      <AvatarFallback className="text-xs">
                        {msg.user_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{msg.user_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
