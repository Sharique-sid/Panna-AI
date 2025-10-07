import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('notes')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: data
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error
    });
  }
}
