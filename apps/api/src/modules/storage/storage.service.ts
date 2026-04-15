import { v2 as cloudinary } from 'cloudinary'
import type { VideoAssetDto } from '@interactive-video-platform/shared'
import { env } from '../../config/env'
import { VideoAssetsService } from '../video-assets/video-assets.service'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

type CloudinaryVideoUploadResult = {
  public_id: string
  secure_url: string
  playback_url?: string
  thumbnail_url?: string
  duration?: number
  format?: string
  bytes?: number
  width?: number
  height?: number
  version?: number
}

export class StorageService {
  static async uploadVideo(
      fileBuffer: Buffer,
      originalName: string,
      uploadedBy: string
  ): Promise<VideoAssetDto> {
    const result = await new Promise<CloudinaryVideoUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'courses/videos',
          public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, '')}`,
          overwrite: false
        },
          (error, uploadResult) => {
            if (error || !uploadResult) {
            reject(error ?? new Error('Upload failed'))
            return
          }
            resolve(uploadResult as CloudinaryVideoUploadResult)        }
      )

      uploadStream.end(fileBuffer)
    })
    const playbackUrl = result.playback_url ?? result.secure_url
    const thumbnailUrl =
        result.thumbnail_url ??
        cloudinary.url(result.public_id, {
          resource_type: 'video',
          format: 'jpg',
          transformation: [{ width: 640, crop: 'scale' }]
        })

    return VideoAssetsService.create({
      provider: 'cloudinary',
      publicId: result.public_id,
      secureUrl: result.secure_url,
      playbackUrl,
      thumbnailUrl,
      durationSec: result.duration ? Math.round(result.duration) : undefined,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      version: result.version,
      status: 'ready',
      uploadedBy
    })
  }
}