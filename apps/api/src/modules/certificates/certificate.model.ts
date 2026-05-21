import { Schema, Types, model } from 'mongoose'

const certificateSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
        certificateNumber: { type: String, required: true, unique: true, trim: true },
        studentFullName: { type: String, required: true, trim: true },
        courseTitle: { type: String, required: true, trim: true },
        issuedAt: { type: Date, required: true },
        completionPercent: { type: Number, required: true, min: 0, max: 100 },
        scorePercent: { type: Number, required: true, min: 0, max: 100 },
        pdfFileName: { type: String, required: true, trim: true }
    },
    { timestamps: true }
)

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true })

export type CertificateDocument = {
    _id: Types.ObjectId
    userId: Types.ObjectId
    courseId: Types.ObjectId
    certificateNumber: string
    studentFullName: string
    courseTitle: string
    issuedAt: Date
    completionPercent: number
    scorePercent: number
    pdfFileName: string
    createdAt: Date
    updatedAt: Date
}

export const CertificateModel = model('Certificate', certificateSchema)