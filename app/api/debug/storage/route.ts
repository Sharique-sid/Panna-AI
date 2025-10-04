import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Test bucket listing
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    return NextResponse.json({
      success: true,
      user: user ? { id: user.id, email: user.email } : null,
      userError: userError?.message,
      buckets: buckets || [],
      bucketError: bucketError?.message,
      bucketCount: buckets?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

