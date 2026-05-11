import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const uploadType = formData.get('type') as string || 'submission'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  let folder = 'csol-lms/submissions'
  let prefix = 'submission'
  if (uploadType === 'dp') {
    folder = 'csol-lms/profiles'
    prefix = 'dp'
  } else if (uploadType === 'faq') {
    folder = 'csol-lms/faqs'
    prefix = 'faq'
  } else if (uploadType === 'resource') {
    folder = 'csol-lms/resources'
    prefix = 'res'
  }

  const result = await new Promise<{ secure_url: string; original_filename: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'auto',
            public_id: `${prefix}_${session.userId}_${Date.now()}`,
          },
          (error, result) => {
            if (error || !result) reject(error)
            else resolve(result as { secure_url: string; original_filename: string })
          }
        )
        .end(buffer)
    }
  )

  return NextResponse.json({
    url: result.secure_url,
    name: file.name,
  })
}
