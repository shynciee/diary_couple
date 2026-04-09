import { useCallback, useMemo, useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import type { MediaItem } from '../types'
import {
  dataUrlToBlob,
  generateVideoThumbnail,
  getImageDimensions,
  getVideoDimensions,
  isImageFile,
  isVideoFile,
} from '../lib/utils'
import { uploadUnsignedToCloudinary } from '../lib/cloudinary'

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export type UploadStatus =
  | 'queued'
  | 'compressing'
  | 'uploading'
  | 'done'
  | 'error'
  | 'cancelled'

export type UploadItem = {
  id: string
  file: File
  type: 'photo' | 'video'
  caption: string
  order: number
  previewUrl: string
  progress: number
  status: UploadStatus
  error?: string
  url?: string
  thumbnailUrl?: string
  storagePath?: string
  width?: number
  height?: number
}

type UseUploadParams = {
  coupleId: string
  memoryId: string
}

export function useUpload({ coupleId, memoryId }: UseUploadParams) {
  const [items, setItems] = useState<UploadItem[]>([])
  const xhrRef = useRef<Map<string, XMLHttpRequest>>(new Map())

  const setItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    )
  }, [])

  const addFiles = useCallback(
    async (files: File[]) => {
      const accepted = files.filter((f) => isImageFile(f) || isVideoFile(f))
      const maxBytes = 100 * 1024 * 1024
      const filtered = accepted.filter((f) => f.size <= maxBytes)

      const baseOrder = items.length
      const newItems: UploadItem[] = filtered.map((file, idx) => {
        const type: 'photo' | 'video' = isVideoFile(file) ? 'video' : 'photo'
        return {
          id: makeId(),
          file,
          type,
          caption: '',
          order: baseOrder + idx,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          status: 'queued',
        }
      })

      setItems((prev) => [...prev, ...newItems])

      for (const it of newItems) {
        void (async () => {
          try {
            if (it.type === 'photo') {
              setItem(it.id, { status: 'compressing' })
            } else {
              setItem(it.id, { status: 'uploading' })
            }

            const filenameSafe = `${it.id}-${it.file.name}`.replace(
              /[^a-zA-Z0-9._-]/g,
              '_',
            )

            let uploadFile = it.file
            if (it.type === 'photo') {
              uploadFile = await imageCompression(it.file, {
                maxSizeMB: 2,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              })
              setItem(it.id, { status: 'uploading' })
            }

            const dims =
              it.type === 'photo'
                ? await getImageDimensions(uploadFile)
                : await getVideoDimensions(uploadFile)

            const folder = `couples/${coupleId}/memories/${memoryId}`
            const basePublicId = `${it.id}-${filenameSafe}`.slice(0, 180)

            const main = await uploadUnsignedToCloudinary({
              file: uploadFile,
              filename: filenameSafe,
              resourceType: it.type === 'photo' ? 'image' : 'video',
              folder,
              publicId: basePublicId,
              onProgress: (pct) => setItem(it.id, { progress: pct }),
              setXhr: (xhr) => xhrRef.current.set(it.id, xhr),
            })
            console.log('[Upload] Cloudinary main uploaded', {
              localId: it.id,
              type: it.type,
              url: main.secureUrl,
              publicId: main.publicId,
            })

            let thumbUrl = ''
            if (it.type === 'video') {
              const dataUrl = await generateVideoThumbnail(it.file)
              const blob = dataUrlToBlob(dataUrl)
              const thumb = await uploadUnsignedToCloudinary({
                file: blob,
                filename: `${filenameSafe}.thumb.jpg`,
                resourceType: 'image',
                folder,
                publicId: `${basePublicId}-thumb`,
              })
              thumbUrl = thumb.secureUrl
              console.log('[Upload] Cloudinary thumbnail uploaded', {
                localId: it.id,
                thumbUrl,
                thumbPublicId: thumb.publicId,
              })
            }

            setItem(it.id, {
              progress: 100,
              status: 'done',
              url: main.secureUrl,
              thumbnailUrl: thumbUrl,
              storagePath: main.publicId,
              width: dims.width,
              height: dims.height,
            })
          } catch (e: unknown) {
            const msg =
              e instanceof Error ? e.message : 'Upload thất bại (không rõ lỗi)'
            setItem(it.id, { status: 'error', error: msg })
          } finally {
            xhrRef.current.delete(it.id)
          }
        })()
      }
    },
    [coupleId, memoryId, items.length, setItem],
  )

  const removeItem = useCallback(
    (id: string) => {
      const xhr = xhrRef.current.get(id)
      if (xhr) {
        try {
          xhr.abort()
        } catch {
          // ignore
        }
        xhrRef.current.delete(id)
      }
      setItems((prev) => {
        const it = prev.find((x) => x.id === id)
        if (it) URL.revokeObjectURL(it.previewUrl)
        return prev.filter((x) => x.id !== id).map((x, idx) => ({ ...x, order: idx }))
      })
    },
    [setItems],
  )

  const cancelUpload = useCallback((id: string) => {
    const xhr = xhrRef.current.get(id)
    if (!xhr) return
    xhr.abort()
    xhrRef.current.delete(id)
    setItem(id, { status: 'cancelled', error: 'Đã huỷ' })
  }, [setItem])

  const setCaption = useCallback(
    (id: string, caption: string) => setItem(id, { caption }),
    [setItem],
  )

  const reorder = useCallback((orderedIds: string[]) => {
    setItems((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]))
      return orderedIds
        .map((id, idx) => {
          const it = map.get(id)
          return it ? { ...it, order: idx } : null
        })
        .filter(Boolean) as UploadItem[]
    })
  }, [])

  const allDone = useMemo(
    () => items.length > 0 && items.every((i) => i.status === 'done'),
    [items],
  )

  const toMediaItems = useCallback((): MediaItem[] => {
    const done = items
      .filter((i) => i.status === 'done' && i.url && i.storagePath)
      .sort((a, b) => a.order - b.order)

    return done.map((i, idx) => ({
      id: i.id,
      type: i.type,
      url: i.url!,
      thumbnailUrl: i.thumbnailUrl ?? '',
      storagePath: i.storagePath!,
      caption: i.caption,
      width: i.width ?? 0,
      height: i.height ?? 0,
      order: idx,
    }))
  }, [items])

  return {
    items,
    addFiles,
    removeItem,
    cancelUpload,
    setCaption,
    reorder,
    allDone,
    toMediaItems,
  }
}

