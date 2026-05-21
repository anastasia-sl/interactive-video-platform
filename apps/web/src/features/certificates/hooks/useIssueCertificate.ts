import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { IssueCertificateResponseDto } from '@interactive-video-platform/shared'
import { certificatesApi } from '../api/certificates.api'

export const useIssueCertificate = (courseId: string) => {
    const queryClient = useQueryClient()

    return useMutation<IssueCertificateResponseDto>({
        mutationFn: () => certificatesApi.issue(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificate-eligibility', courseId] })
            queryClient.invalidateQueries({ queryKey: ['my-certificates'] })
        }
    })
}