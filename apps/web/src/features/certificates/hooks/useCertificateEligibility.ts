import { useQuery } from '@tanstack/react-query'
import { certificatesApi } from '../api/certificates.api'

export const useCertificateEligibility = (courseId: string) => {
    return useQuery({
        queryKey: ['certificate-eligibility', courseId],
        queryFn: () => certificatesApi.getEligibility(courseId),
        enabled: Boolean(courseId)
    })
}