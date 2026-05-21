import { env } from '../../../shared/config/env'
import { authStorage } from '../../../shared/lib/auth-storage'

export const useDownloadCertificate = () => {
    return async (certificateId: string) => {
        const token = authStorage.getToken()

        const response = await fetch(`${env.apiBaseUrl}/api/certificates/${certificateId}/download`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })

        if (!response.ok) {
            throw new Error('Не вдалося завантажити сертифікат')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = `certificate-${certificateId}.pdf`
        link.click()

        window.URL.revokeObjectURL(url)
    }
}