import { useMutation } from '@tanstack/react-query'
import { uploadVideoApi } from '../api/upload.api'

export const useUploadVideo = () => {
  return useMutation({
    mutationFn: (file: File) => uploadVideoApi(file)
  })
}