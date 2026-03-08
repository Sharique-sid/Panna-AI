import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { crudRatelimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { success } = await crudRatelimit.limit(user.id);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const { content, title } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    const noteTitle = title || extractTitle(content);

    // Use the user-context client — RLS enforces user_id ownership
    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: noteTitle,
        content: content.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Extension note insert error:', insertError.message);
      return NextResponse.json(
        { error: insertError.message || 'Failed to create note' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.created_at,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Extension create note error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractTitle(content: string): string {
  const headerMatch = content.match(/^#\s+(.+)$/m);
  if (headerMatch) {
    return headerMatch[1].trim();
  }
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length > 100) {
    return firstLine.substring(0, 97) + '...';
  }
  return firstLine || 'Quick Note';
}
