import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic";

export default async function TestDashboard() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/signin")
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Dashboard Test</h1>
          <p className="text-gray-600 mb-4">You are logged in as: {user.email}</p>
          <p className="text-sm text-gray-500">This is a test page to verify the dashboard works.</p>
          <a 
            href="/dashboard" 
            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Real Dashboard
          </a>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Test dashboard error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Test Dashboard Error</h1>
          <p className="text-gray-600 mb-4">There was an error loading the test dashboard.</p>
          <p className="text-sm text-gray-500">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <a 
            href="/auth/signin" 
            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    )
  }
}

