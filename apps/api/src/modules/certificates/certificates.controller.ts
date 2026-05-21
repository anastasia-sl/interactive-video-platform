import type { Request, Response } from 'express'
import { CertificatesService } from './certificates.service'

const getParam = (value: string | string[] | undefined, name: string) => {
    if (!value || Array.isArray(value)) {
        throw new Error(`Invalid ${name}`)
    }

    return value
}

export const CertificatesController = {
    async getEligibility(req: Request, res: Response) {
        const eligibility = await CertificatesService.getCertificateEligibility(req.auth!.userId, getParam(req.params.courseId, 'courseId'))
        res.status(200).json(eligibility)
    },

    async issue(req: Request, res: Response) {
        const certificate = await CertificatesService.issueCertificate(req.auth!.userId, getParam(req.params.courseId, 'courseId'))
        res.status(201).json({ certificate })
    },

    async getMyCertificates(req: Request, res: Response) {
        const certificates = await CertificatesService.getMyCertificates(req.auth!.userId)
        res.status(200).json({ certificates })
    },

    async download(req: Request, res: Response) {
        const certificate = await CertificatesService.getCertificateById(req.auth!.userId, getParam(req.params.certificateId, 'certificateId'))
        const pdfPath = CertificatesService.getCertificatePdfPath(certificate)

        res.download(pdfPath, certificate.pdfFileName)
    }
}