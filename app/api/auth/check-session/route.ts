import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    const { data: { session } } = await supabase.auth.getSession();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email
      },
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token
      } : null
    });

  } catch (error: any) {
    console.error('Check session error:', error.message);
    return NextResponse.json({ user: null });
  }
}
