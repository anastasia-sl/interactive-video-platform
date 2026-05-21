import type {
    CertificateDto,
    CertificateEligibilityDto,
    IssueCertificateResponseDto
} from '@interactive-video-platform/shared'
import { apiClient } from '../../../shared/api/client'

export const certificatesApi = {
    getEligibility: (courseId: string) =>
        apiClient<CertificateEligibilityDto>(`/api/courses/${courseId}/certificate/eligibility`),

    issue: (courseId: string) =>
        apiClient<IssueCertificateResponseDto>(`/api/courses/${courseId}/certificate`, {
            method: 'POST'
        }),

    getMyCertificates: () =>
        apiClient<{ certificates: CertificateDto[] }>('/api/certificates/my')
}