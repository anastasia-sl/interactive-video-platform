import { useQuery } from '@tanstack/react-query'
import { certificatesApi } from '../api/certificates.api'

export const useMyCertificates = () => {
    return useQuery({
        queryKey: ['my-certificates'],
        queryFn: certificatesApi.getMyCertificates
    })
}