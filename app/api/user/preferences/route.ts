import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  fontSize: z.enum(["small", "medium", "large"]).optional(),
  editorTheme: z.enum(["default", "github", "monokai", "solarized"]).optional(),
  autoSave: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Map database column names to frontend property names
    const preferences = data ? {
      theme: data.theme,
      fontSize: data.font_size,
      editorTheme: data.editor_theme,
      autoSave: data.auto_save,
      emailNotifications: data.email_notifications,
      pushNotifications: data.push_notifications,
      weeklyDigest: data.weekly_digest,
    } : {}

    return NextResponse.json({ preferences })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const preferences = preferencesSchema.parse(body)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Map frontend property names to database column names
    const dbPreferences = {
      user_id: user.id,
      theme: preferences.theme,
      font_size: preferences.fontSize,
      editor_theme: preferences.editorTheme,
      auto_save: preferences.autoSave,
      email_notifications: preferences.emailNotifications,
      push_notifications: preferences.pushNotifications,
      weekly_digest: preferences.weeklyDigest,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(dbPreferences)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Map back to frontend property names
    const responsePreferences = {
      theme: data.theme,
      fontSize: data.font_size,
      editorTheme: data.editor_theme,
      autoSave: data.auto_save,
      emailNotifications: data.email_notifications,
      pushNotifications: data.push_notifications,
      weeklyDigest: data.weekly_digest,
    }

    return NextResponse.json({ preferences: responsePreferences })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
