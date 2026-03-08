import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

// Service role is used here only for Supabase Storage operations.
// The user is authenticated first via getUser() before any storage action is taken.
function getStorageClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceClient = getStorageClient()

    const { data: buckets } = await serviceClient.storage.listBuckets()
    const avatarsBucket = buckets?.find(bucket =>
      bucket.id.toLowerCase() === 'avatars'
    )

    if (!avatarsBucket) {
      console.error('Avatars bucket not found')
      return NextResponse.json({ error: "Storage bucket not configured. Please contact support." }, { status: 500 })
    }

    const bucketName = avatarsBucket.id

    const oldAvatarUrl = user.user_metadata?.avatar_url
    if (oldAvatarUrl) {
      try {
        const urlParts = oldAvatarUrl.split('/')
        const bucketIndex = urlParts.findIndex((part: string) => part.toLowerCase() === 'avatars')
        if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/')
          await serviceClient.storage.from(bucketName).remove([filePath])
        }
      } catch {
        // Non-fatal — old avatar cleanup failure should not block upload
      }
    }

    const fileExtension = file.name.split(".").pop() || 'jpg'
    const fileName = `${user.id}/${Date.now()}.${fileExtension}`

    const { error: uploadError } = await serviceClient.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError.message)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 400 })
    }

    const { data: { publicUrl } } = serviceClient.storage.from(bucketName).getPublicUrl(fileName)

    const { data: userData, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_url: publicUrl,
      },
    })

    if (updateError) {
      console.error('Update user metadata error:', updateError.message)
      return NextResponse.json({ error: `Failed to update profile: ${updateError.message}` }, { status: 400 })
    }

    return NextResponse.json({ avatar_url: publicUrl, user: userData.user })
  } catch (error: any) {
    console.error('Avatar upload error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceClient = getStorageClient()

    const oldAvatarUrl = user.user_metadata?.avatar_url
    if (oldAvatarUrl) {
      try {
        const urlParts = oldAvatarUrl.split('/')
        const bucketIndex = urlParts.findIndex((part: string) => part.toLowerCase() === 'avatars')
        if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/')
          await serviceClient.storage.from('avatars').remove([filePath])
        }
      } catch {
        // Non-fatal
      }
    }

    const { data: userData, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_url: null,
      },
    })

    if (updateError) {
      console.error('Remove avatar error:', updateError.message)
      return NextResponse.json({ error: `Failed to remove avatar: ${updateError.message}` }, { status: 400 })
    }

    return NextResponse.json({ user: userData.user })
  } catch (error: any) {
    console.error('Avatar removal error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
