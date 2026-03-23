import multer from 'multer'

const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
const MAX_SIZE_BYTES = 500 * 1024 * 1024

export const uploadVideoMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(null, true)
    } else {
      callback(new Error('Дозволені формати: mp4, webm, ogg'))
    }
  }
}).single('video')