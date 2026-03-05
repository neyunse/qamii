import { S3Client, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  // Only warn at build time, error at runtime if used
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export async function uploadImage(buffer, key, contentType) {
  if (!R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME not defined')

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })

  try {
    await s3Client.send(command)
    return key
  } catch (error) {
    console.error('Error uploading image to R2:', error)
    throw error
  }
}

export async function deleteImages(keys) {
  if (!keys || keys.length === 0) return
  if (!R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME not defined')

  const command = new DeleteObjectsCommand({
    Bucket: R2_BUCKET_NAME,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
      Quiet: true,
    },
  })

  try {
    console.log('R2 Delete Request for keys:', keys)
    await s3Client.send(command)
    console.log('R2 Delete Success')
  } catch (error) {
    console.error('Error deleting images from R2:', error)
    throw error
  }
}

export async function deleteImage(key) {
  if (!key) return
  return await deleteImages([key])
}

// Proxy URL generator
export function getImageUrl(key) {
  if (!key) return null
  if (key.startsWith('http')) return key // Already a full URL

  // The database saves keys like 'username/avatars/avatar.jpg'
  // We need to pass this whole key to the proxy, but since our proxy is at
  // /api/images/[...key], passing a '/' will break Next.js single dynamic routes.
  // Instead, we encode the key.
  const proxyKey = encodeURIComponent(key);

  return `/api/images/${proxyKey}`
}
