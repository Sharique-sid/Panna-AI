import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Google token is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: token,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Google: ' + error.message },
        { status: 401 }
      );
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        { error: 'Authentication failed - no session created' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email,
        }
      }
    });

  } catch (error: any) {
    console.error('Google extension auth error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
