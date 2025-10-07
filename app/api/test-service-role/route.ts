import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST SERVICE ROLE API CALLED ===');
    console.log('Environment variables check:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.log('ERROR: SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY not found in environment variables',
        serviceRoleKey: 'NOT_SET'
      });
    }

    console.log('- Service role key preview:', serviceRoleKey.substring(0, 20) + '...');
    console.log('- Service role key length:', serviceRoleKey.length);
    console.log('- Is placeholder value:', serviceRoleKey === 'your_supabase_service_role_key_here');

    if (serviceRoleKey === 'your_supabase_service_role_key_here') {
      console.log('ERROR: SUPABASE_SERVICE_ROLE_KEY is still set to placeholder value');
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY is still set to placeholder value',
        serviceRoleKey: 'PLACEHOLDER_VALUE',
        message: 'Please replace with your actual service role key from Supabase dashboard'
      });
    }

    // Test if the service role key works
    try {
      console.log('- Creating admin client with service role key...');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { persistSession: false } }
      );
      console.log('- Admin client created successfully');

      console.log('- Testing service role key with database query...');
      // Try a simple query to test the key
      const { data, error } = await supabaseAdmin
        .from('notes')
        .select('count')
        .limit(1);

      console.log('- Database query result:', { data: !!data, error: !!error });

      if (error) {
        console.error('ERROR: Service role key test failed');
        console.error('Supabase error:', error);
        return NextResponse.json({
          error: 'Service role key is invalid',
          serviceRoleKey: serviceRoleKey.substring(0, 20) + '...',
          supabaseError: error.message,
          errorCode: error.code,
          errorHint: error.hint
        });
      }

      console.log('SUCCESS: Service role key is working correctly');
      return NextResponse.json({
        success: true,
        message: 'Service role key is working correctly',
        serviceRoleKey: serviceRoleKey.substring(0, 20) + '...',
        testQuery: 'SUCCESS'
      });

    } catch (testError: any) {
      console.error('ERROR: Failed to test service role key');
      console.error('Test error:', testError);
      return NextResponse.json({
        error: 'Failed to test service role key',
        serviceRoleKey: serviceRoleKey.substring(0, 20) + '...',
        testError: testError.message
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal error',
      message: error.message
    });
  }
}
