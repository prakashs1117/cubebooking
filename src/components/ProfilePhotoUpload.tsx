import { useEffect, useRef, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { AdvancedImage } from '@cloudinary/react'
import { uploadProfileImage, validateImageFile } from '../lib/cloudinary'
import { avatarImage } from '../lib/cloudinaryImage'

interface ProfilePhotoUploadProps {
  photoURL?: string
  photoPublicId?: string
  photoVersion?: number
  displayName?: string
  email?: string
  /** Persists the new photo (or clears it when the values are empty). */
  onChange: (photo: { photoURL: string; photoPublicId: string; photoVersion: number }) => void | Promise<void>
}

function initialsFrom(name?: string, email?: string): string {
  const source = (name || '').trim() || (email || '').trim()
  if (!source) return '?'
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export default function ProfilePhotoUpload({
  photoURL,
  photoPublicId,
  photoVersion,
  displayName,
  email,
  onChange,
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState<'upload' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Revoke the object URL whenever it is replaced or the component unmounts.
  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset immediately so picking the same file twice still fires onChange.
    e.target.value = ''
    if (!file) return

    setError(null)
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setPreview(URL.createObjectURL(file))
    setBusy('upload')
    try {
      const { url, publicId, version } = await uploadProfileImage(file)
      await onChange({ photoURL: url, photoPublicId: publicId, photoVersion: version })
      setPreview(null)
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  // Deleting from Cloudinary requires a signed request, which needs a backend.
  // Removing here detaches the photo from the profile; the stored asset is
  // cleaned up from the Cloudinary Media Library.
  const handleRemove = async () => {
    setError(null)
    setBusy('delete')
    try {
      await onChange({ photoURL: '', photoPublicId: '', photoVersion: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove the photo.')
    } finally {
      setBusy(null)
    }
  }


  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-[84px] h-[84px] rounded-full overflow-hidden bg-gradient-to-br from-[#772432] to-[#5A1926] text-[#F2DF74] flex items-center justify-center text-[26px] font-extrabold tracking-tight ring-2 ring-white shadow-[0_2px_8px_rgba(26,21,25,.12)]">
            {preview ? (
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : photoPublicId ? (
              <AdvancedImage
                cldImg={avatarImage(photoPublicId, 168, photoVersion)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initialsFrom(displayName, email)
            )}
          </div>

          {busy === 'upload' ? (
            <div className="absolute inset-0 rounded-full bg-[#1A1519]/55 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">Uploading…</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy !== null}
            aria-label="Change profile photo"
            className="absolute -bottom-0.5 -right-0.5 w-8 h-8 rounded-full bg-white border border-[#D6D1CC] flex items-center justify-center text-[#772432] transition-colors hover:bg-[#772432] hover:text-white hover:border-[#772432] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Camera className="w-[15px] h-[15px]" />
          </button>
        </div>

        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-[#1A1519]">Profile photo</p>
          <p className="text-[12.5px] text-[#6B6470] mt-0.5">JPG, PNG, WebP or GIF · up to 5 MB</p>
          {(photoURL || photoPublicId) && !preview ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy !== null}
              className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#B3261E] hover:underline disabled:text-[#A29BA6] disabled:no-underline disabled:cursor-not-allowed"
            >
              <Trash2 className="w-[13px] h-[13px]" />
              {busy === 'delete' ? 'Removing…' : 'Remove photo'}
            </button>
          ) : null}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {error ? <p className="mt-3 text-[12.5px] font-semibold text-[#B3261E]">{error}</p> : null}
    </div>
  )
}
