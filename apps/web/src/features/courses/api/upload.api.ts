import { apiClient } from '../../../shared/api/client'

export const uploadVideoApi = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('video', file)

  const response = await apiClient<{ url: string }>('/api/storage/video', {
    method: 'POST',
    body: formData
  })

  return response.url
}