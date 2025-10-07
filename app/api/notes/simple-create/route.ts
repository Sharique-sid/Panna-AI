import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // For now, just return success without saving to database
    // This will test if the extension can communicate with the API
    console.log('Note received:', { title, content, token: token.substring(0, 20) + '...' });

    return NextResponse.json({
      success: true,
      message: 'Note received successfully (not saved to database yet)',
      note: {
        id: 'temp-' + Date.now(),
        title: title || null,
        content,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Simple notes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
