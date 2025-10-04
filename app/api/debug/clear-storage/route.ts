import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // This API endpoint will help clear problematic localStorage data
    // The actual clearing needs to be done on the client side
    
    return NextResponse.json({ 
      message: "Storage clearing instructions",
      instructions: [
        "1. Open browser Developer Tools (F12)",
        "2. Go to Application tab",
        "3. Click on Local Storage",
        "4. Find your domain (localhost:3000)",
        "5. Delete the 'notes-store' key",
        "6. Refresh the page"
      ],
      alternative: "Or visit: http://localhost:3000/clear-storage"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 })
  }
}

