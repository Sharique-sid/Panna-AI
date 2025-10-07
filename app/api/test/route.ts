import { NextResponse } from 'next/server'

export async function GET() {
  console.log('=== TEST API CALLED ===');
  console.log('Environment check:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('- SERVICE_ROLE_KEY_PREVIEW:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
    console.log('- SERVICE_ROLE_KEY_IS_PLACEHOLDER:', process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key_here');
  }
  
  return NextResponse.json({ 
    message: 'API is working!',
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
    }
  });
}
