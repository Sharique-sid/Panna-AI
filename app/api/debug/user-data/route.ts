import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if tables exist and get data
    const checks = {
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      },
      notes: null,
      categories: null,
      preferences: null,
      errors: []
    }

    // Check notes table
    try {
      const { data: notes, error: notesError } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .limit(5)
      
      if (notesError) {
        checks.errors.push(`Notes error: ${notesError.message}`)
      } else {
        checks.notes = {
          count: notes?.length || 0,
          sample: notes?.[0] || null
        }
      }
    } catch (error) {
      checks.errors.push(`Notes exception: ${error}`)
    }

    // Check categories table
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .limit(5)
      
      if (categoriesError) {
        checks.errors.push(`Categories error: ${categoriesError.message}`)
      } else {
        checks.categories = {
          count: categories?.length || 0,
          sample: categories?.[0] || null
        }
      }
    } catch (error) {
      checks.errors.push(`Categories exception: ${error}`)
    }

    // Check preferences table
    try {
      const { data: preferences, error: preferencesError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single()
      
      if (preferencesError && preferencesError.code !== "PGRST116") {
        checks.errors.push(`Preferences error: ${preferencesError.message}`)
      } else {
        checks.preferences = preferences || null
      }
    } catch (error) {
      checks.errors.push(`Preferences exception: ${error}`)
    }

    return NextResponse.json(checks)
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 })
  }
}

