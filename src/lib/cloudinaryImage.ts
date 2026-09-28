import { Cloudinary } from '@cloudinary/url-gen'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity'
import { face } from '@cloudinary/url-gen/qualifiers/focusOn'

/**
 * Delivery-side Cloudinary client. The cloud name is public — it appears in
 * every image URL — so it lives in a VITE_ variable. Uploads are signed
 * server-side; see lib/cloudinary.ts.
 */
export const cld = new Cloudinary({
  cloud: { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '' },
})

/**
 * Square avatar cropped around the subject's face, with automatic format and
 * quality negotiation (WebP/AVIF where the browser supports it).
 */
export function avatarImage(publicId: string, size = 168, version?: number) {
  const img = cld.image(publicId)
  // public_id is pinned to the uid, so without the version a re-upload would
  // resolve to the same URL and serve a stale image.
  if (version) img.setVersion(String(version))
  return img
    .format('auto')
    .quality('auto')
    .resize(fill().gravity(focusOn(face())).width(size).height(size))
}
