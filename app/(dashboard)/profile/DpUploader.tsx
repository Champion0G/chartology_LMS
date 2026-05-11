'use client'

import { useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DpUploader({ currentDp, initials }: { currentDp: string | null, initials: string }) {
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'dp')

      const upRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!upRes.ok) throw new Error('Upload failed')
      const data = await upRes.json()

      const saveRes = await fetch('/api/user/dp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dpUrl: data.url }),
      })

      if (!saveRes.ok) throw new Error('Failed to save DP')
      
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Error uploading profile picture')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="dp-container">
      <div className="avatar-large" style={{ overflow: 'hidden', position: 'relative' }}>
        {currentDp ? (
          <img src={currentDp} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : initials}

        <label className={`dp-overlay ${uploading ? 'uploading' : ''}`}>
          {uploading ? <Loader2 className="spinner" size={24} /> : <Camera size={24} />}
          <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={handleFileChange} />
        </label>
      </div>

      <style jsx>{`
        .dp-container {
          position: relative;
          display: inline-block;
          margin-bottom: 20px;
        }
        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
        }
        .dp-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          cursor: pointer;
          color: white;
        }
        .avatar-large:hover .dp-overlay,
        .dp-overlay.uploading {
          opacity: 1;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
