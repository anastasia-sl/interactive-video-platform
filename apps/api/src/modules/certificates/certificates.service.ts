import fs from 'node:fs'
import path from 'node:path'
import PDFDocument from 'pdfkit'
import { Types } from 'mongoose'
import type { CertificateDto, CertificateEligibilityDto } from '@interactive-video-platform/shared'
import { CourseModel } from '../courses/course.model'
import { UserModel } from '../users/user.model'
import { QuestionAttemptModel } from '../interactive-question-attempts/question-attempt.model'
import { CertificateModel, type CertificateDocument } from './certificate.model'
import { HttpError } from '../../utils/http-error'
import { LessonProgressService } from '../lesson-progress/lesson-progress.service'
import { InteractiveQuestionModel } from '../interactive-questions/interactive-question.model'

const MIN_SCORE_PERCENT = 70
const CERTIFICATES_DIR = path.join(process.cwd(), 'storage', 'certificates')

const toCertificateDto = (certificate: CertificateDocument): CertificateDto => ({
    id: certificate._id.toString(),
    userId: certificate.userId.toString(),
    courseId: certificate.courseId.toString(),
    certificateNumber: certificate.certificateNumber,
    studentFullName: certificate.studentFullName,
    courseTitle: certificate.courseTitle,
    issuedAt: certificate.issuedAt.toISOString(),
    completionPercent: certificate.completionPercent,
    scorePercent: certificate.scorePercent,
    pdfFileName: certificate.pdfFileName,
    createdAt: certificate.createdAt.toISOString(),
    updatedAt: certificate.updatedAt.toISOString()
})

const getCourseLessons = async (courseId: string) => {
    const course = await CourseModel.findById(courseId)

    if (!course) {
        throw new HttpError(404, 'Course not found')
    }

    if (course.status !== 'published') {
        throw new HttpError(403, 'Course is not available')
    }

    const lessons = course.modules.flatMap((module) => module.lessons)

    return { course, lessons }
}

const getLatestAttemptsByLesson = async (userId: string, lessonIds: Types.ObjectId[]) => {
    const attempts = await QuestionAttemptModel.find({
        userId: new Types.ObjectId(userId),
        lessonId: { $in: lessonIds }
    }).sort({ createdAt: -1 })

    const latestByLesson = new Map<string, typeof attempts[number][]>()

    for (const attempt of attempts) {
        const lessonId = attempt.lessonId.toString()
        const current = latestByLesson.get(lessonId) ?? []
        current.push(attempt)
        latestByLesson.set(lessonId, current)
    }

    return latestByLesson
}

export const CertificatesService = {
    async getCertificateEligibility(userId: string, courseId: string): Promise<CertificateEligibilityDto> {
        const { lessons } = await getCourseLessons(courseId)
        const totalLessons = lessons.length

        if (totalLessons === 0) {
            return {
                eligible: false,
                reason: 'Course has no lessons',
                completionPercent: 0,
                scorePercent: 0,
                completedLessons: 0,
                totalLessons,
                minScorePercent: MIN_SCORE_PERCENT
            }
        }

        const lessonIds = lessons.map((lesson) => lesson._id as Types.ObjectId)
        const completedLessonIds = await LessonProgressService.getCompletedLessonIds(userId, courseId)
        const completedLessons = lessons.filter((lesson) => completedLessonIds.has(String(lesson._id))).length
        const completionPercent = Math.round((completedLessons / totalLessons) * 100)

        const questions = await InteractiveQuestionModel.find({
            lessonId: { $in: lessonIds }
        })

        const questionIds = questions.map((question) => question._id)

        const attempts = await QuestionAttemptModel.find({
            userId: new Types.ObjectId(userId),
            questionId: { $in: questionIds }
        }).sort({ createdAt: -1 })

        const latestAttemptsByQuestion = new Map<string, typeof attempts[number]>()

        for (const attempt of attempts) {
            const questionId = attempt.questionId.toString()

            if (!latestAttemptsByQuestion.has(questionId)) {
                latestAttemptsByQuestion.set(questionId, attempt)
            }
        }

        const totalQuestions = questions.length
        const correctAnswers = Array.from(latestAttemptsByQuestion.values()).filter((attempt) => attempt.isCorrect).length
        const scorePercent = totalQuestions === 0 ? 100 : Math.round((correctAnswers / totalQuestions) * 100)
        if (completedLessons < totalLessons) {
            return {
                eligible: false,
                reason: 'Complete all course lessons to receive a certificate',
                completionPercent,
                scorePercent,
                completedLessons,
                totalLessons,
                minScorePercent: MIN_SCORE_PERCENT
            }
        }

        if (scorePercent < MIN_SCORE_PERCENT) {
            return {
                eligible: false,
                reason: `Minimum score is ${MIN_SCORE_PERCENT}%`,
                completionPercent,
                scorePercent,
                completedLessons,
                totalLessons,
                minScorePercent: MIN_SCORE_PERCENT
            }
        }

        return {
            eligible: true,
            completionPercent,
            scorePercent,
            completedLessons,
            totalLessons,
            minScorePercent: MIN_SCORE_PERCENT
        }
    },

    async issueCertificate(userId: string, courseId: string) {
        const existing = await CertificateModel.findOne({ userId, courseId })

        if (existing) {
            return toCertificateDto(existing as CertificateDocument)
        }

        const eligibility = await this.getCertificateEligibility(userId, courseId)

        if (!eligibility.eligible) {
            throw new HttpError(400, eligibility.reason ?? 'Certificate requirements are not completed')
        }

        const { course } = await getCourseLessons(courseId)
        const user = await UserModel.findById(userId)

        if (!user) {
            throw new HttpError(404, 'User not found')
        }

        const issuedAt = new Date()
        const certificateNumber = `IVP-${issuedAt.getFullYear()}-${new Types.ObjectId().toString().slice(-8).toUpperCase()}`
        const pdfFileName = `${certificateNumber}.pdf`

        const certificate = await CertificateModel.create({
            userId,
            courseId,
            certificateNumber,
            studentFullName: user.fullName,
            courseTitle: course.title,
            issuedAt,
            completionPercent: eligibility.completionPercent,
            scorePercent: eligibility.scorePercent,
            pdfFileName
        })

        await this.generateCertificatePdf(certificate as CertificateDocument)

        return toCertificateDto(certificate as CertificateDocument)
    },

    async getMyCertificates(userId: string) {
        const certificates = await CertificateModel.find({ userId }).sort({ issuedAt: -1 })
        return certificates.map((certificate) => toCertificateDto(certificate as CertificateDocument))
    },

    async getCertificateById(userId: string, certificateId: string) {
        const certificate = await CertificateModel.findOne({ _id: certificateId, userId })

        if (!certificate) {
            throw new HttpError(404, 'Certificate not found')
        }

        return certificate as CertificateDocument
    },

    async generateCertificatePdf(certificate: CertificateDocument) {
        fs.mkdirSync(CERTIFICATES_DIR, { recursive: true })

        const pdfPath = path.join(CERTIFICATES_DIR, certificate.pdfFileName)
        const fontPath = path.join(process.cwd(), 'storage', 'fonts', 'NotoSans-Regular.ttf')

        const document = new PDFDocument({ size: 'A4', margin: 56 })
        const stream = fs.createWriteStream(pdfPath)

        document.pipe(stream)

        document.registerFont('Regular', fontPath)

        const pageWidth = document.page.width
        const pageHeight = document.page.height
        const contentWidth = pageWidth - 112

        document
            .rect(36, 36, pageWidth - 72, pageHeight - 72)
            .lineWidth(2)
            .stroke()

        document
            .rect(46, 46, pageWidth - 92, pageHeight - 92)
            .lineWidth(0.5)
            .stroke()

        document
            .font('Regular')
            .fontSize(16)
            .text('Interactive Video Platform', 56, 82, {
                align: 'center',
                width: contentWidth
            })

        document
            .fontSize(30)
            .text('Сертифікат', 56, 150, {
                align: 'center',
                width: contentWidth
            })

        document
            .fontSize(18)
            .text('про успішне завершення курсу', 56, 192, {
                align: 'center',
                width: contentWidth
            })

        document
            .fontSize(14)
            .text('Цим підтверджується, що студент(-ка)', 56, 260, {
                align: 'center',
                width: contentWidth
            })

        document
            .fontSize(26)
            .text(certificate.studentFullName, 56, 295, {
                align: 'center',
                width: contentWidth
            })

        document
            .fontSize(14)
            .text('успішно завершив(-ла) курс', 56, 355, {
                align: 'center',
                width: contentWidth
            })

        document
            .fontSize(22)
            .text(certificate.courseTitle, 86, 390, {
                align: 'center',
                width: pageWidth - 172
            })

        document
            .fontSize(15)
            .text(`Результат проходження курсу: ${certificate.completionPercent}%`, 56, 485, {
                align: 'center',
                width: contentWidth
            })

        document
            .fontSize(15)
            .text(`Результат тестування: ${certificate.scorePercent}%`, 56, 515, {
                align: 'center',
                width: contentWidth
            })

        document
            .fontSize(12)
            .text(`Дата видачі: ${certificate.issuedAt.toLocaleDateString('uk-UA')}`, 56, 635, {
                align: 'center',
                width: contentWidth
            })

        document
            .fontSize(12)
            .text(`Номер сертифіката: ${certificate.certificateNumber}`, 56, 660, {
                align: 'center',
                width: contentWidth
            })

        document.end()

        await new Promise<void>((resolve, reject) => {
            stream.on('finish', resolve)
            stream.on('error', reject)
        })

        return pdfPath
    },

    getCertificatePdfPath(certificate: CertificateDocument) {
        return path.join(CERTIFICATES_DIR, certificate.pdfFileName)
    }
}