import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
// Import the base Supabase client creator for the admin client
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('=== NOTES CREATE API CALLED ===');
    console.log('Environment check:');
    console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('- SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('- SERVICE_ROLE_KEY_PREVIEW:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
      console.log('- SERVICE_ROLE_KEY_IS_PLACEHOLDER:', process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key_here');
    }

    // --- Step 1: Authenticate the user (no changes here) ---
    const authHeader = request.headers.get('authorization');
    console.log('- Authorization header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('ERROR: Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('- Token preview:', token.substring(0, 20) + '...');
    
    const supabase = await createClient(); // User-context client
    console.log('- Created user-context Supabase client');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('- Auth result:', { user: !!user, error: !!authError });
    
    if (authError) {
      console.error('- Auth error details:', authError);
      console.error('- Auth error message:', authError.message);
    }
    
    if (!user) {
      console.error('- No user found in auth result');
    }

    if (authError || !user) {
      console.error('=== AUTHENTICATION FAILED ===');
      
      let errorMessage = 'Invalid or expired token';
      if (authError && authError.message.includes('expired')) {
        errorMessage = 'Your session has expired. Please log in again.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          code: authError?.code || 'auth_failed',
          details: authError?.message || 'Authentication failed'
        },
        { status: 401 }
      );
    }

    // --- Step 2: Parse the request body (no changes here) ---
    const body = await request.json();
    const { content, title } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    const noteTitle = title || extractTitle(content);

    // --- Step 3: Insert the note using an admin client (UPDATED) ---
    console.log('- Creating admin client with service role key...');
    
    // Create a separate admin client using the service role key.
    // This client will bypass RLS policies for the insertion.
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    console.log('- Admin client created successfully');
    
    console.log('- Inserting note with data:', {
      user_id: user.id,
      title: noteTitle,
      content_length: content.trim().length
    });
    
    // Use the admin client for the database insertion
    const { data: note, error: insertError } = await supabaseAdmin
      .from('notes')
      .insert({
        user_id: user.id, // The user_id is from the authenticated user
        title: noteTitle,
        content: content.trim(),
        // created_at and updated_at are now handled by Supabase defaults
      })
      .select()
      .single();
    
    console.log('- Database insert result:', { note: !!note, error: !!insertError });

    if (insertError) {
      console.error('=== INSERT ERROR ===');
      console.error('Insert error details:', insertError);
      console.error('Error message:', insertError.message);
      console.error('Error code:', insertError.code);
      console.error('Error hint:', insertError.hint);
      console.error('Error details:', insertError.details);
      // Provide the specific database error message for easier debugging
      return NextResponse.json(
        { error: insertError.message || 'Failed to create note' },
        { status: 500 }
      );
    }

    console.log('=== SUCCESS ===');
    console.log('Note created successfully:', {
      id: note.id,
      title: note.title,
      user_id: note.user_id
    });

    // --- Step 4: Return the successful response (no changes here) ---
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
    console.error('=== CATCH ERROR ===');
    console.error('Create note error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to extract title from content (no changes here)
function extractTitle(content: string): string {
  // ... (your existing helper function)
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
