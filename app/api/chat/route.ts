import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST - Send a chat message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { noteId, message } = await request.json()

    if (!noteId || !message) {
      return NextResponse.json({ error: "Note ID and message are required" }, { status: 400 })
    }

    // Get user profile for name and avatar
    const { data: profile } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()

    const userName = user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous"
    const userAvatar = user.user_metadata?.avatar_url || null

    // Insert chat message
    const { data, error } = await supabase
      .from("note_chat_messages")
      .insert({
        note_id: noteId,
        user_id: user.id,
        user_name: userName,
        user_avatar: userAvatar,
        message: message
      })
      .select()
      .single()

    if (error) {
      console.error("Error sending chat message:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Fetch chat messages for a note
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const noteId = searchParams.get("noteId")

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
    }

    // Fetch chat messages
    const { data, error } = await supabase
      .from("note_chat_messages")
      .select("*")
      .eq("note_id", noteId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching chat messages:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a chat message
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    // Delete message (RLS policy ensures user can only delete their own messages)
    const { error } = await supabase
      .from("note_chat_messages")
      .delete()
      .eq("id", messageId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting chat message:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
