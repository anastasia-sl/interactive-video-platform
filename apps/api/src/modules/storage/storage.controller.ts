import type { Request, Response } from 'express'
import { StorageService } from './storage.service'

export class StorageController {
  static async uploadVideo(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({message: 'Файл не надано'})
      return
    }

    const videoAsset = await StorageService.uploadVideo(
        req.file.buffer,
        req.file.originalname,
        req.auth!.userId
    )

    res.status(200).json({
      url: videoAsset.playbackUrl,
      videoAsset
    })
  }
}