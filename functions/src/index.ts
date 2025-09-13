import { Storage } from '@google-cloud/storage'
import { storage as cfStorage, logger } from 'firebase-functions'
import path from 'node:path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

/** ====== KONFIG ====== */
const REGION = 'us-east1' // matcha din bucket-region
const SIZES = [64, 128, 256, 512] as const // thumbnails (kvadratiska)
const FORMAT: 'webp' | 'jpeg' = 'webp' // format för thumbnails
const QUALITY = 80
const CACHE_CONTROL = 'public, max-age=31536000, immutable'
const WITHOUT_ENLARGEMENT = true

// Original→WebP (”fullstorlek” eller capped)
const MAKE_ORIGINAL_WEBP = true
const ORIGINAL_MAX = 1600 // cap längsta sida (px). Sätt till e.g. 0/undefined för ingen resize
const ORIGINAL_SUFFIX = '_orig' // filsuffix för original-webp
const DELETE_ORIGINAL_AFTER_CONVERT = false // Sätt true om du vill ta bort original (JPEG/PNG) efter konvertering

/** ====== UTIL ====== */
const gcs = new Storage()

function isImage(ct?: string | null) {
  return !!ct && ct.startsWith('image/')
}
function hasGeneratedSuffix(fileName: string) {
  // hoppa över egna filer: _NxN.(webp/jpg/…) eller *_orig.webp
  return /(_\d+x\d+\.(webp|jpe?g|png|avif)|_orig\.webp)$/i.test(fileName)
}
function buildThumbPath(objectPath: string, size: number, outExt: string) {
  const dir = path.posix.dirname(objectPath)
  const base = path.posix.basename(objectPath)
  const dot = base.lastIndexOf('.')
  const stem = dot === -1 ? base : base.slice(0, dot)
  return path.posix.join(dir, `${stem}_${size}x${size}.${outExt}`)
}
function buildOriginalWebpPath(objectPath: string) {
  const dir = path.posix.dirname(objectPath)
  const base = path.posix.basename(objectPath)
  const dot = base.lastIndexOf('.')
  const stem = dot === -1 ? base : base.slice(0, dot)
  return path.posix.join(dir, `${stem}${ORIGINAL_SUFFIX}.webp`)
}

/** ====== TRIGGER: on upload ====== */
export const generateThumbnails = cfStorage.onObjectFinalized(
  { region: REGION, memory: '1GiB', timeoutSeconds: 120, maxInstances: 5 },
  async event => {
    const object = event.data
    const filePath = object.name // t.ex. 'drink_images/abc.jpg'
    const contentType = object.contentType
    if (!filePath) return
    if (!isImage(contentType)) {
      logger.log(`Skip non-image: ${filePath} (${contentType})`)
      return
    }
    if (hasGeneratedSuffix(path.posix.basename(filePath))) {
      logger.log(`Skip generated file: ${filePath}`)
      return
    }

    const bucket = gcs.bucket(object.bucket)
    const original = bucket.file(filePath)

    // Ladda originalet EN gång i minnet för att slippa läsa flera gånger
    const [buf] = await original.download()

    const outExt = FORMAT === 'webp' ? 'webp' : 'jpg'
    const commonMeta = (ct: string, from = filePath) => ({
      contentType: ct,
      cacheControl: CACHE_CONTROL,
      metadata: { firebaseStorageDownloadTokens: uuidv4(), resizedFrom: from },
    })

    // 1) Skapa thumbnails parallellt
    await Promise.all(
      SIZES.map(async size => {
        const outPath = buildThumbPath(filePath, size, outExt)
        const outFile = bucket.file(outPath)
        const t = sharp(buf)
          .rotate()
          .resize(size, size, { fit: 'cover', withoutEnlargement: WITHOUT_ENLARGEMENT })
        if (FORMAT === 'webp') t.webp({ quality: QUALITY })
        else t.jpeg({ quality: QUALITY, mozjpeg: true })
        await outFile.save(await t.toBuffer(), {
          metadata: commonMeta(`image/${outExt}`, filePath),
          resumable: false,
        })
        logger.log(`Wrote ${outPath}`)
      })
    )

    // 2) Skapa original-WebP (ev. nedskalat)
    if (MAKE_ORIGINAL_WEBP) {
      try {
        const outPath = buildOriginalWebpPath(filePath) // ..._orig.webp
        const outFile = bucket.file(outPath)

        let s = sharp(buf).rotate()
        if (ORIGINAL_MAX && ORIGINAL_MAX > 0) {
          s = s.resize(ORIGINAL_MAX, ORIGINAL_MAX, { fit: 'inside', withoutEnlargement: true })
        }
        const webpBuf = await s.webp({ quality: 85 }).toBuffer()
        await outFile.save(webpBuf, {
          metadata: commonMeta('image/webp', filePath),
          resumable: false,
        })
        logger.log(`Wrote ${outPath}`)

        // (valfritt) Ta bort originalet för att spara lagring
        if (DELETE_ORIGINAL_AFTER_CONVERT) {
          await original.delete({ ignoreNotFound: true })
          logger.log(`Deleted original ${filePath}`)
        }
      } catch (e) {
        logger.warn(`Original→WebP failed for ${filePath}`, e as any)
      }
    }
  }
)

/** ====== TRIGGER: on delete (städa även _orig.webp & thumbs) ====== */
export const cleanupThumbnails = cfStorage.onObjectDeleted(
  { region: REGION, timeoutSeconds: 60, maxInstances: 5 },
  async event => {
    const filePath = event.data.name
    const contentType = event.data.contentType
    if (!filePath || !isImage(contentType)) return
    if (hasGeneratedSuffix(path.posix.basename(filePath))) {
      // redan en genererad fil → låt GC sköta resten
      return
    }
    const bucket = gcs.bucket(event.data.bucket)
    const toDelete: string[] = []

    // thumbs
    for (const s of SIZES) {
      toDelete.push(buildThumbPath(filePath, s, FORMAT === 'webp' ? 'webp' : 'jpg'))
    }
    // _orig.webp
    if (MAKE_ORIGINAL_WEBP) {
      toDelete.push(buildOriginalWebpPath(filePath))
    }

    await Promise.allSettled(toDelete.map(p => bucket.file(p).delete({ ignoreNotFound: true })))
    logger.log(`Cleaned generated images for ${filePath}`)
  }
)
