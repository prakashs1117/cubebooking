export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

interface CloudinaryUploadResponse {
  secure_url?: string
  public_id?: string
  version?: number
  status?: string
  error?: { message: string }
}

export interface UploadedImage {
  url: string
  publicId: string
  version: number
}

/** Client-side guard so obvious rejects never cost a round trip. */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file (JPG, PNG, WebP or GIF).'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    return `That image is ${mb} MB. Please choose one under 5 MB.`
  }
  return null
}

/**
 * Uploads a profile picture straight from the browser using an unsigned
 * upload preset — no backend required.
 *
 * Cloudinary forces `overwrite: false` on unsigned uploads, so we must NOT
 * pin public_id to the uid: re-uploading to an existing public_id would just
 * return the old asset. Instead Cloudinary assigns a unique public_id per
 * upload and we store whichever one came back.
 *
 * The real limits (allowed formats, max file size, folder) are enforced by
 * the preset's own configuration in the Cloudinary console, since an unsigned
 * request can't be trusted to set them.
 */
export async function uploadProfileImage(file: File): Promise<UploadedImage> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Image uploads are not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET, then restart the dev server.',
    )
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  // Folder, allowed formats and size limits all come from the preset's own
  // configuration — an unsigned request can't be trusted to set them.

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    // Cloudinary reports the reason in the X-Cld-Error header as well as the
    // JSON body; the header is populated even when the body is not JSON.
    const header = res.headers.get('X-Cld-Error')
    let bodyMessage = ''
    try {
      bodyMessage = ((await res.json()) as CloudinaryUploadResponse)?.error?.message ?? ''
    } catch {
      // Non-JSON error response — fall back to the header.
    }
    throw new Error(header || bodyMessage || 'Upload failed. Please try again.')
  }

  const body = (await res.json()) as CloudinaryUploadResponse

  // An async preset returns only { status: 'pending', batch_id } — the URL
  // arrives later via webhook. Fail loudly rather than saving an empty photo.
  if (!body.secure_url || !body.public_id) {
    throw new Error(
      body.status === 'pending'
        ? 'The upload preset has "Async" enabled, so no image URL is returned. Turn Async off on the preset.'
        : 'Cloudinary did not return an image URL. Please try again.',
    )
  }

  return { url: body.secure_url, publicId: body.public_id, version: body.version ?? 0 }
}
