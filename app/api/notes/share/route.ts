import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateSlug(): string {
  const buf = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId, action } = await req.json();
    if (!noteId || !["enable", "disable"].includes(action)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const isEnable = action === "enable";
    const updates: any = { is_public: isEnable };
    if (isEnable) {
      updates.public_share_id = generateSlug();
    } else {
      updates.public_share_id = null;
    }

    // .eq("user_id", user.id) ensures the user can only modify their own notes
    const { data, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", noteId)
      .eq("user_id", user.id)
      .select("public_share_id, is_public")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ shareId: data.public_share_id, isPublic: data.is_public });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
