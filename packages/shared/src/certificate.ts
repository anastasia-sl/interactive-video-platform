export interface CertificateDto {
    id: string
    userId: string
    courseId: string
    certificateNumber: string
    studentFullName: string
    courseTitle: string
    issuedAt: string
    completionPercent: number
    scorePercent: number
    pdfFileName: string
    createdAt: string
    updatedAt: string
}

export interface CertificateEligibilityDto {
    eligible: boolean
    reason?: string
    completionPercent: number
    scorePercent: number
    completedLessons: number
    totalLessons: number
    minScorePercent: number
}

export interface IssueCertificateResponseDto {
    certificate: CertificateDto
}