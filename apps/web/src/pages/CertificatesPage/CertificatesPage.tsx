import { useMyCertificates } from '../../features/certificates/hooks/useMyCertificates'
import { useDownloadCertificate } from '../../features/certificates/hooks/useDownloadCertificate'

export const CertificatesPage = () => {
    const certificatesQuery = useMyCertificates()
    const downloadCertificate = useDownloadCertificate()

    if (certificatesQuery.isLoading) {
        return <main>Завантаження сертифікатів...</main>
    }

    const certificates = certificatesQuery.data?.certificates ?? []

    return (
        <main>
            <h1>Мої сертифікати</h1>

            {certificates.length === 0 && <p>У вас ще немає виданих сертифікатів.</p>}

            {certificates.map((certificate) => (
                <article key={certificate.id}>
                    <h2>{certificate.courseTitle}</h2>
                    <p>Дата видачі: {new Date(certificate.issuedAt).toLocaleDateString('uk-UA')}</p>
                    <p>Успішність: {certificate.scorePercent}%</p>
                    <p>Номер сертифіката: {certificate.certificateNumber}</p>
                    <button type="button" onClick={() => downloadCertificate(certificate.id)}>
                        Завантажити PDF
                    </button>
                </article>
            ))}
        </main>
    )
}