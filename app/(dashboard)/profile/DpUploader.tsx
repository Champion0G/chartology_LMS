'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight)
}

export default function DpUploader({ currentDp, initials }: { currentDp: string | null, initials: string }) {
  const [uploading, setUploading] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setImgSrc(objectUrl)
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }

  const handleUploadCrop = async () => {
    if (!completedCrop || !imgRef.current) return

    setUploading(true)
    try {
      const canvas = document.createElement('canvas')
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height
      canvas.width = completedCrop.width
      canvas.height = completedCrop.height
      const ctx = canvas.getContext('2d')

      if (!ctx) throw new Error('No 2d context')

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      )

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas is empty')), 'image/jpeg', 0.95)
      })

      const formData = new FormData()
      formData.append('file', blob, 'dp.jpg')
      formData.append('type', 'dp')

      const upRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!upRes.ok) throw new Error('Upload failed')
      const data = await upRes.json()

      const saveRes = await fetch('/api/user/dp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dpUrl: data.url }),
      })

      if (!saveRes.ok) throw new Error('Failed to save DP')
      
      setImgSrc('')
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Error uploading profile picture')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="dp-container">
        <div className="avatar-large" style={{ overflow: 'hidden', position: 'relative' }}>
          {currentDp ? (
            <img src={currentDp} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : initials}

          <label className={`dp-overlay ${uploading && !imgSrc ? 'uploading' : ''}`}>
            {uploading && !imgSrc ? <Loader2 className="spinner" size={24} /> : <Camera size={24} />}
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={handleFileChange} />
          </label>
        </div>
      </div>

      {imgSrc && (
        <div className="modal-overlay">
          <div className="modal glass-card" style={{ maxWidth: 500, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Crop Profile Picture</h3>
              <button onClick={() => setImgSrc('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ maxHeight: '60vh', overflow: 'auto', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img ref={imgRef} src={imgSrc} alt="Crop me" onLoad={handleImageLoad} style={{ maxWidth: '100%', maxHeight: '50vh', objectFit: 'contain' }} />
              </ReactCrop>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="btn-secondary" onClick={() => setImgSrc('')} disabled={uploading}>Cancel</button>
              <button className="btn-primary" onClick={handleUploadCrop} disabled={uploading}>
                {uploading ? <Loader2 size={16} className="spinner" style={{ marginRight: 8 }} /> : null}
                Save Picture
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dp-container { position: relative; display: inline-block; margin-bottom: 20px; }
        .avatar-large { width: 80px; height: 80px; border-radius: 20px; background: var(--gradient); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #fff; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4); }
        .dp-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; cursor: pointer; color: white; }
        .avatar-large:hover .dp-overlay, .dp-overlay.uploading { opacity: 1; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px); padding: 20px; }
        .modal { width: 100%; max-height: 90vh; overflow-y: auto; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
