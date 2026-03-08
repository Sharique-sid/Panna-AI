import { type NextRequest, NextResponse } from "next/server"
import { generateText, GeminiError } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/server"
import { aiRatelimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { success } = await aiRatelimit.limit(user.id)
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 })
    }

    const { text, style, noteId } = await request.json()

    if (!text || !style) {
      return NextResponse.json({ error: "Text and style are required" }, { status: 400 })
    }

    const stylePrompts = {
      formal: "Rewrite the following text in a formal, professional tone:",
      informal: "Rewrite the following text in a casual, conversational tone:",
      concise: "Rewrite the following text to be more concise and to the point:",
      extended: "Expand and elaborate on the following text with more details and examples:",
    }

    const prompt = `${stylePrompts[style as keyof typeof stylePrompts]}\n\n${text}`
    const rephrased = await generateText(prompt)

    // Save AI interaction to database
    if (noteId) {
      await supabase.from("ai_interactions").insert({
        user_id: user.id,
        note_id: noteId,
        interaction_type: "rephrase",
        input_text: text.substring(0, 1000),
        output_text: rephrased,
        metadata: { style },
      })
    }

    return NextResponse.json({ result: rephrased })
  } catch (error) {
    if (error instanceof GeminiError) {
      const status = error.code === "RATE_LIMITED" ? 429 : error.code === "CONTENT_BLOCKED" ? 422 : 503;
      console.error("AI Rephrase Error:", error.message, { code: error.code })
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error("AI Rephrase Error:", error)
    return NextResponse.json({ error: "Failed to rephrase text" }, { status: 500 })
  }
}
