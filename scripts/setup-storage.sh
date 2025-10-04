#!/bin/bash

# Setup script for Panna.ai Supabase Storage
# This script sets up the required storage buckets and RLS policies

echo "🚀 Setting up Panna.ai Storage Buckets..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials first."
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
    exit 1
fi

echo "📦 Setting up storage buckets and policies..."

# Run the SQL script using Supabase CLI or psql
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    supabase db reset --db-url "$NEXT_PUBLIC_SUPABASE_URL" --schema public,storage
    cat scripts/setup-storage.sql | supabase db push --db-url "$NEXT_PUBLIC_SUPABASE_URL"
elif command -v psql &> /dev/null; then
    echo "Using psql..."
    # Extract database URL from Supabase URL
    DB_URL=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | sed 's/supabase\.co/aws.neon.tech/')
    psql "$DB_URL" -f scripts/setup-storage.sql
else
    echo "⚠️  Neither Supabase CLI nor psql found."
    echo "Please run the SQL commands in scripts/setup-storage.sql manually in your Supabase dashboard."
    echo ""
    echo "Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql"
    echo "Copy and paste the contents of scripts/setup-storage.sql"
fi

echo "✅ Storage setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Try uploading an avatar in the settings page"
echo "3. If you still get errors, check the Supabase dashboard for any RLS policy issues"
