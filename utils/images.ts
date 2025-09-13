// utils/images.ts
import { storage } from '@/lib/firebase'
import { getDownloadURL, ref as sref } from 'firebase/storage'
import { PixelRatio } from 'react-native'

/**
 * Hook: hämtar URL och gör en snabb retry om vi fick fallback (t.ex. direkt efter upload).
 */
import { useEffect, useState } from 'react'

/** ===== Grundhelpers (som tidigare) ===== */

export function pathWithSize(path: string, size: number, ext: 'webp' | 'jpg' = 'webp') {
  const dot = path.lastIndexOf('.')
  const stem = dot === -1 ? path : path.slice(0, dot)
  return `${stem}_${size}x${size}.${ext}`
}

/** Försök extrahera storage-path från en Firebase download-URL. */
export function extractStoragePathFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const idx = u.pathname.indexOf('/o/')
    if (idx === -1) return null
    const encoded = u.pathname.slice(idx + 3)
    const end = encoded.indexOf('?')
    const encPath = end >= 0 ? encoded.slice(0, end) : encoded
    return decodeURIComponent(encPath)
  } catch {
    return null
  }
}

export type ThumbResult = {
  url: string
  chosen?: number
  fallbackOriginal: boolean
  fromHttp: boolean
  storagePath?: string | null
}

/** Hämtar lämplig thumbnail-variant för målbredd i *layout*-px. */
export async function getBestThumb(
  originalPathOrUrl: string,
  targetPx: number
): Promise<ThumbResult> {
  const isHttp = /^https?:\/\//i.test(originalPathOrUrl)
  const storagePath = isHttp ? extractStoragePathFromUrl(originalPathOrUrl) : originalPathOrUrl

  const deviceSize = Math.min(512, Math.ceil(targetPx * PixelRatio.get()))
  const candidates = [64, 128, 256, 512].filter(n => n >= deviceSize)
  const chosen = candidates.length ? candidates[0] : 512

  if (!storagePath) {
    return {
      url: originalPathOrUrl,
      chosen: undefined,
      fallbackOriginal: true,
      fromHttp: isHttp,
      storagePath: null,
    }
  }

  const variantPath = pathWithSize(storagePath, chosen, 'webp')
  try {
    const url = await getDownloadURL(sref(storage, variantPath))
    return { url, chosen, fallbackOriginal: false, fromHttp: isHttp, storagePath }
  } catch {
    if (isHttp) {
      return {
        url: originalPathOrUrl,
        chosen: undefined,
        fallbackOriginal: true,
        fromHttp: true,
        storagePath,
      }
    }
    const url = await getDownloadURL(sref(storage, storagePath))
    return { url, chosen: undefined, fallbackOriginal: true, fromHttp: false, storagePath }
  }
}

/** För större vyer: prova *_orig.webp, annars originalfilen. */
export async function getOriginalWebpOrOriginal(pathOrUrl: string) {
  const isHttp = /^https?:\/\//i.test(pathOrUrl)
  const storagePath = isHttp ? extractStoragePathFromUrl(pathOrUrl) : pathOrUrl
  if (storagePath) {
    const dot = storagePath.lastIndexOf('.')
    const stem = dot === -1 ? storagePath : storagePath.slice(0, dot)
    const origWebp = `${stem}_orig.webp`
    try {
      return await getDownloadURL(sref(storage, origWebp))
    } catch {
      // fallback
    }
    return await getDownloadURL(sref(storage, storagePath))
  }
  return pathOrUrl
}

/** ===== Presets + hook ===== */

/** Förval för olika UI-ytor (i layout-px, inte device px). */
export type ImagePreset =
  | 'avatar' // små ikoner
  | 'thumb' // små listtumnaglar
  | 'list' // standardlistor
  | 'grid' // rutnät/kort
  | 'card' // större kort
  | 'cover' // header/hero (mellanstor)
  | 'detail' // detaljvy (använder _orig.webp)

const PRESET_TARGETS: Record<Exclude<ImagePreset, 'detail'>, number> = {
  avatar: 24,
  thumb: 36,
  list: 50,
  grid: 96,
  card: 128,
  cover: 256,
}

/** En enkel minnescache så vi inte hämtar samma URL om och om igen. */
const urlCache = new Map<string, string>()
const k = (label: string, key: string) => `${label}::${key}`

/**
 * Generisk resolver:
 * - preset 'detail' → original-webp (ev. cap) via getOriginalWebpOrOriginal
 * - övriga presets → getBestThumb(target)
 * - target (nummer) stöttas också direkt
 */
export async function resolveImageUrl(
  label: string | null | undefined,
  presetOrTarget: ImagePreset | number = 'list'
): Promise<{ url: string | null; meta?: ThumbResult }> {
  if (!label) return { url: null }

  // cache key
  const key =
    typeof presetOrTarget === 'number'
      ? k(label, `t:${presetOrTarget}`)
      : k(label, `p:${presetOrTarget}`)

  const cached = urlCache.get(key)
  if (cached) return { url: cached }

  if (presetOrTarget === 'detail') {
    const url = await getOriginalWebpOrOriginal(label)
    urlCache.set(key, url)
    return { url }
  }

  const target =
    typeof presetOrTarget === 'number'
      ? presetOrTarget
      : (PRESET_TARGETS[presetOrTarget] ?? PRESET_TARGETS.list)

  const meta = await getBestThumb(label, target)
  urlCache.set(key, meta.url)
  return { url: meta.url, meta }
}
export function useImageUrl(
  label: string | null | undefined,
  presetOrTarget: ImagePreset | number = 'list',
  opts?: { retryOnFallback?: boolean; retryDelayMs?: number }
) {
  const { retryOnFallback = true, retryDelayMs = 1200 } = opts ?? {}
  const [url, setUrl] = useState<string | null>(null)
  const [meta, setMeta] = useState<ThumbResult | undefined>(undefined)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await resolveImageUrl(label, presetOrTarget)
      if (!alive) return
      setUrl(res.url)
      if (res.meta) setMeta(res.meta)

      if (retryOnFallback && res.meta?.fallbackOriginal && attempt < 1) {
        setTimeout(() => setAttempt(a => a + 1), retryDelayMs)
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, JSON.stringify(presetOrTarget), attempt])

  return { url, meta, loading: !url && !!label }
}
