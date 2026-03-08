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

    const { text, language, noteId } = await request.json()

    if (!text || !language) {
      return NextResponse.json({ error: "Text and language are required" }, { status: 400 })
    }

    // Enhanced prompts for specific languages
    const getLanguagePrompt = (lang: string) => {
      if (lang === "Hindi") {
        return `Translate the following text to Hindi (हिंदी). Use proper Devanagari script and maintain the original meaning and tone. Only return the translation:\n\n`
      }
      if (lang === "English") {
        return `Translate the following text to English. Use clear, natural English and maintain the original meaning and tone. Only return the translation:\n\n`
      }
      return `Translate the following text to ${language}. Only return the translation:\n\n`
    }

    const prompt = getLanguagePrompt(language) + text
    const translated = await generateText(prompt)

    // Save AI interaction to database
    if (noteId) {
      await supabase.from("ai_interactions").insert({
        user_id: user.id,
        note_id: noteId,
        interaction_type: "translate",
        input_text: text.substring(0, 1000),
        output_text: translated,
        metadata: { language },
      })
    }

    return NextResponse.json({ result: translated })
  } catch (error) {
    if (error instanceof GeminiError) {
      const status = error.code === "RATE_LIMITED" ? 429 : error.code === "CONTENT_BLOCKED" ? 422 : 503;
      console.error("AI Translate Error:", error.message, { code: error.code })
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error("AI Translate Error:", error)
    return NextResponse.json({ error: "Failed to translate text" }, { status: 500 })
  }
}
