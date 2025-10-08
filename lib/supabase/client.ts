import { createBrowserClient } from "@supabase/ssr"

// Updated: October 7, 2025 - Panna.ai v2.0.0
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
