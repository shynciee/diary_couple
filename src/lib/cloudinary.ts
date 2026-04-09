export type CloudinaryUploadResult = {
  secureUrl: string
  publicId: string
  width?: number
  height?: number
  resourceType?: 'image' | 'video' | 'raw' | string
}

export type CloudinaryUploadOptions = {
  file: Blob
  filename?: string
  resourceType: 'image' | 'video'
  folder?: string
  publicId?: string
  onProgress?: (pct: number) => void
  signalId?: string
  setXhr?: (xhr: XMLHttpRequest) => void
}

function cloudName() {
  const v = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
  if (!v) throw new Error('Missing VITE_CLOUDINARY_CLOUD_NAME')
  return v
}

function uploadPreset() {
  const v = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined
  if (!v) throw new Error('Missing VITE_CLOUDINARY_UPLOAD_PRESET')
  return v
}

export async function uploadUnsignedToCloudinary(
  opts: CloudinaryUploadOptions,
): Promise<CloudinaryUploadResult> {
  const url = `https://api.cloudinary.com/v1_1/${cloudName()}/${opts.resourceType}/upload`

  const form = new FormData()
  form.append('file', opts.file, opts.filename ?? 'upload')
  form.append('upload_preset', uploadPreset())
  if (opts.folder) form.append('folder', opts.folder)
  if (opts.publicId) form.append('public_id', opts.publicId)

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    opts.setXhr?.(xhr)

    xhr.open('POST', url, true)

    xhr.upload.onprogress = (ev) => {
      if (!ev.lengthComputable) return
      const pct = Math.round((ev.loaded / ev.total) * 100)
      opts.onProgress?.(pct)
    }

    xhr.onerror = () => reject(new Error('Cloudinary upload failed'))
    xhr.onabort = () => reject(new Error('aborted'))

    xhr.onload = () => {
      try {
        const ok = xhr.status >= 200 && xhr.status < 300
        if (!ok) {
          reject(
            new Error(
              `Cloudinary upload failed (${xhr.status}): ${xhr.responseText || ''}`.trim(),
            ),
          )
          return
        }
        const json = JSON.parse(xhr.responseText || '{}') as any
        resolve({
          secureUrl: json.secure_url,
          publicId: json.public_id,
          width: json.width,
          height: json.height,
          resourceType: json.resource_type,
        })
      } catch (e) {
        reject(e)
      }
    }

    xhr.send(form)
  })
}

