import { Schema, Types, model } from 'mongoose'

const questionAttemptSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        lessonId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        questionId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        selectedOptionIds: {
            type: [String],
            required: true,
            default: []
        },
        isCorrect: {
            type: Boolean,
            required: true
        },
        awardedPoints: {
            type: Number,
            required: true,
            min: 0
        },
        explanation: {
            type: String,
            trim: true,
            maxlength: 5000,
            default: ''
        },
        answeredAtPlaybackSec: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
)

questionAttemptSchema.index({ userId: 1, lessonId: 1, questionId: 1, createdAt: -1 })

export type QuestionAttemptDocument = {
    _id: Types.ObjectId
    userId: Types.ObjectId
    lessonId: Types.ObjectId
    questionId: Types.ObjectId
    selectedOptionIds: string[]
    isCorrect: boolean
    awardedPoints: number
    explanation?: string
    answeredAtPlaybackSec: number
    createdAt: Date
    updatedAt: Date
}

export const QuestionAttemptModel = model('QuestionAttempt', questionAttemptSchema)