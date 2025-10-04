import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if avatars bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets()
    const avatarsBucket = buckets?.find(bucket => bucket.id === 'avatars')
    
    if (!avatarsBucket) {
      // Create the avatars bucket
      const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })
      
      if (createBucketError) {
        console.error('Error creating avatars bucket:', createBucketError)
        return NextResponse.json({ error: "Failed to create storage bucket" }, { status: 500 })
      }
    }

    // Delete old avatar if exists
    const oldAvatarUrl = user.user_metadata?.avatar_url
    if (oldAvatarUrl) {
      try {
        const oldFileName = oldAvatarUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage.from("avatars").remove([oldFileName])
        }
      } catch (error) {
        console.warn('Could not delete old avatar:', error)
      }
    }

    // Upload to Supabase Storage
    const fileExtension = file.name.split(".").pop() || 'jpg'
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 400 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName)

    // Update user metadata
    const { data: userData, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_url: publicUrl,
      },
    })

    if (updateError) {
      console.error('Update user error:', updateError)
      return NextResponse.json({ error: `Failed to update profile: ${updateError.message}` }, { status: 400 })
    }

    return NextResponse.json({ avatar_url: publicUrl, user: userData.user })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete old avatar from storage if exists
    const oldAvatarUrl = user.user_metadata?.avatar_url
    if (oldAvatarUrl) {
      try {
        const oldFileName = oldAvatarUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage.from("avatars").remove([oldFileName])
        }
      } catch (error) {
        console.warn('Could not delete old avatar from storage:', error)
      }
    }

    // Remove avatar from user metadata
    const { data: userData, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_url: null,
      },
    })

    if (updateError) {
      console.error('Remove avatar error:', updateError)
      return NextResponse.json({ error: `Failed to remove avatar: ${updateError.message}` }, { status: 400 })
    }

    return NextResponse.json({ user: userData.user })
  } catch (error: any) {
    console.error('Avatar removal error:', error)
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 })
  }
}
