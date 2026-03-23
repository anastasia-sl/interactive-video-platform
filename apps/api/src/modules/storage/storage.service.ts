import { v2 as cloudinary } from 'cloudinary'
import { env } from '../../config/env'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

export class StorageService {
  static async uploadVideo(fileBuffer: Buffer, originalName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'courses/videos',
          public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, '')}`,
          overwrite: false
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Upload failed'))
            return
          }
          resolve(result.secure_url)
        }
      )

      uploadStream.end(fileBuffer)
    })
  }
}