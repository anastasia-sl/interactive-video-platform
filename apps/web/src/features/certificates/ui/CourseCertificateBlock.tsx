import { useState } from 'react'
import { useCertificateEligibility } from '../hooks/useCertificateEligibility'
import { useIssueCertificate } from '../hooks/useIssueCertificate'
import { useDownloadCertificate } from '../hooks/useDownloadCertificate'

type CourseCertificateBlockProps = {
    courseId: string
}

export const CourseCertificateBlock = ({ courseId }: CourseCertificateBlockProps) => {
    const eligibilityQuery = useCertificateEligibility(courseId)
    const issueCertificate = useIssueCertificate(courseId)
    const downloadCertificate = useDownloadCertificate()
    const [certificateId, setCertificateId] = useState<string | null>(null)

    if (eligibilityQuery.isLoading) {
        return <section className="course-certificate">Завантаження даних сертифіката...</section>
    }

    if (!eligibilityQuery.data) {
        return null
    }

    const eligibility = eligibilityQuery.data

    const handleIssue = async () => {
        const response = await issueCertificate.mutateAsync()
        setCertificateId(response.certificate.id)
    }

    return (
        <section className="course-certificate">
            <h2>Сертифікат</h2>
            <p>Для отримання сертифіката потрібно завершити всі уроки та набрати не менше {eligibility.minScorePercent}%.</p>
            <p>Прогрес проходження: {eligibility.completionPercent}%</p>
            <p>Успішність: {eligibility.scorePercent}%</p>

            {!eligibility.eligible && eligibility.reason && <p>{eligibility.reason}</p>}

            {eligibility.eligible && !certificateId && (
                <button type="button" onClick={handleIssue} disabled={issueCertificate.isPending}>
                    Отримати сертифікат
                </button>
            )}

            {certificateId && (
                <button type="button" onClick={() => downloadCertificate(certificateId)}>
                    Завантажити PDF
                </button>
            )}
        </section>
    )
}