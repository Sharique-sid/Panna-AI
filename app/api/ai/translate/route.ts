import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, language, noteId } = await request.json()

    if (!text || !language) {
      return NextResponse.json({ error: "Text and language are required" }, { status: 400 })
    }

    // Enhanced prompts for better translation quality
    const getLanguagePrompt = (lang: string) => {
      const languagePrompts: Record<string, string> = {
        Hindi: `Translate the following text to Hindi (हिंदी). Use proper Devanagari script and maintain the original meaning and tone. Only return the translation:\n\n`,
        Chinese: `Translate the following text to Chinese (中文). Use simplified Chinese characters and maintain the original meaning. Only return the translation:\n\n`,
        Japanese: `Translate the following text to Japanese (日本語). Use appropriate Japanese characters (Hiragana, Katakana, Kanji) and maintain the original meaning. Only return the translation:\n\n`,
        Korean: `Translate the following text to Korean (한국어). Use Hangul script and maintain the original meaning. Only return the translation:\n\n`,
        Arabic: `Translate the following text to Arabic (العربية). Use proper Arabic script and maintain the original meaning. Only return the translation:\n\n`,
        Portuguese: `Translate the following text to Portuguese (Português). Use Brazilian Portuguese and maintain the original meaning. Only return the translation:\n\n`,
        Spanish: `Translate the following text to Spanish (Español). Use proper Spanish and maintain the original meaning. Only return the translation:\n\n`,
        French: `Translate the following text to French (Français). Use proper French and maintain the original meaning. Only return the translation:\n\n`,
        German: `Translate the following text to German (Deutsch). Use proper German and maintain the original meaning. Only return the translation:\n\n`,
        Italian: `Translate the following text to Italian (Italiano). Use proper Italian and maintain the original meaning. Only return the translation:\n\n`,
      }
      
      return languagePrompts[lang] || `Translate the following text to ${language}. Only return the translation:\n\n`
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
    console.error("AI Translate Error:", error)
    return NextResponse.json({ error: "Failed to translate text" }, { status: 500 })
  }
}
