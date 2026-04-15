import type { VideoAssetDto } from '@interactive-video-platform/shared'

export type UploadLessonVideoResponse = {
    url: string
    videoAsset: VideoAssetDto
}
const ACCESS_TOKEN_KEY = 'ivp_access_token'

export const uploadLessonVideo = async (file: File): Promise<UploadLessonVideoResponse> => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)

    if (!token) {
        throw new Error('Користувач не авторизований')
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${import.meta.env.VITE_API_URL}/storage/video`, {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message ?? 'Не вдалося завантажити відео')
    }

    return response.json()
}