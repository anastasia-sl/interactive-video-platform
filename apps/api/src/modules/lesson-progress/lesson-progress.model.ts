import { Schema, Types, model } from 'mongoose'

const lessonProgressSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required: true, index: true },
        courseId: { type: Schema.Types.ObjectId, required: true, index: true },
        lessonId: { type: Schema.Types.ObjectId, required: true, index: true },
        completedAt: { type: Date, required: true },
        lastPlaybackPositionSec: { type: Number, required: true, min: 0, default: 0 }
    },
    { timestamps: true }
)

lessonProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true })

export type LessonProgressDocument = {
    _id: Types.ObjectId
    userId: Types.ObjectId
    courseId: Types.ObjectId
    lessonId: Types.ObjectId
    completedAt: Date
    lastPlaybackPositionSec: number
    createdAt: Date
    updatedAt: Date
}

export const LessonProgressModel = model('LessonProgress', lessonProgressSchema)