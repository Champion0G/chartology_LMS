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

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const result = await new Promise<{ secure_url: string; original_filename: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'csol-lms/submissions',
            resource_type: 'auto',
            public_id: `submission_${session.userId}_${Date.now()}`,
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
