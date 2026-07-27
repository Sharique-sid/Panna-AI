import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const uploadSchema = z.object({
  noteId: z.string().uuid(),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { noteId, fileName, fileType, fileSize } = uploadSchema.parse(body);

    // Verify note ownership
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, user_id")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Generate unique file name
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${noteId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Create signed URL for upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("note-images")
      .createSignedUploadUrl(uniqueFileName, {
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message || "Failed to create upload URL. Ensure 'note-images' storage bucket exists in Supabase." }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      publicUrl: uploadData.path,
      fileName: uniqueFileName,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}








