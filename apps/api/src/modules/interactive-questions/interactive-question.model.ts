import { Schema, Types, model } from 'mongoose'
import { INTERACTIVE_QUESTION_TYPES } from '@interactive-video-platform/shared'
import { CourseModel } from '../courses/course.model'
import { VideoAssetModel } from '../video-assets/video-asset.model'

type CourseLesson = {
    _id: Types.ObjectId | string
    type?: 'video' | 'text'
    videoAssetId?: Types.ObjectId | string
}

type CourseModule = {
    lessons?: CourseLesson[]
}

type CourseWithLessons = {
    modules?: CourseModule[]
}

const questionOptionSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100
        },
        text: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 1000
        },
        order: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
)

const getLessonDurationSec = async (lessonId: Types.ObjectId): Promise<number | null> => {
    const course = await CourseModel.findOne({
        'modules.lessons._id': lessonId
    }).lean<CourseWithLessons | null>()

    if (!course?.modules?.length) {
        return null
    }

    for (const moduleItem of course.modules) {
        const lesson = moduleItem.lessons?.find((item) => item._id.toString() === lessonId.toString())

        if (!lesson) {
            continue
        }

        if (lesson.type !== 'video' || !lesson.videoAssetId) {
            return null
        }

        const videoAsset = await VideoAssetModel.findById(lesson.videoAssetId).lean()

        if (!videoAsset || videoAsset.status !== 'ready' || typeof videoAsset.durationSec !== 'number') {
            return null
        }

        return videoAsset.durationSec
    }

    return null
}

const interactiveQuestionSchema = new Schema(
    {
        lessonId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        timecodeSec: {
            type: Number,
            required: true,
            min: 0
        },
        order: {
            type: Number,
            required: true,
            min: 0
        },
        type: {
            type: String,
            enum: INTERACTIVE_QUESTION_TYPES,
            required: true
        },
        prompt: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 2000
        },
        description: {
            type: String,
            trim: true,
            maxlength: 5000,
            default: ''
        },
        options: {
            type: [questionOptionSchema],
            required: true,
            validate: {
                validator: (value: Array<{ id: string; order: number }>) => Array.isArray(value) && value.length >= 2,
                message: 'Question must contain at least 2 options'
            }
        },
        correctOptionIds: {
            type: [String],
            required: true,
            default: []
        },
        points: {
            type: Number,
            required: true,
            default: 1,
            min: 0
        },
        isRequired: {
            type: Boolean,
            required: true,
            default: true
        },
        explanation: {
            type: String,
            trim: true,
            maxlength: 5000,
            default: ''
        }
    },
    {
        timestamps: true
    }
)

interactiveQuestionSchema.index({ lessonId: 1, order: 1 }, { unique: true })
interactiveQuestionSchema.index({ lessonId: 1, timecodeSec: 1 })

interactiveQuestionSchema.pre('validate', async function () {
    const optionIds = this.options.map((option: { id: string }) => option.id)
    const uniqueOptionIds = new Set(optionIds)

    if (uniqueOptionIds.size !== optionIds.length) {
        throw new Error('Option ids must be unique')
    }

    const optionOrders = this.options.map((option: { order: number }) => option.order)
    const uniqueOptionOrders = new Set(optionOrders)

    if (uniqueOptionOrders.size !== optionOrders.length) {
        throw new Error('Option order values must be unique within one question')
    }

    if (this.type === 'single_choice' && this.correctOptionIds.length !== 1) {
        throw new Error('single_choice question must contain exactly 1 correct option id')
    }

    if (this.type === 'multiple_choice' && this.correctOptionIds.length < 1) {
        throw new Error('multiple_choice question must contain at least 1 correct option id')
    }

    for (const correctOptionId of this.correctOptionIds) {
        if (!uniqueOptionIds.has(correctOptionId)) {
            throw new Error('Every correctOptionId must exist in options')
        }
    }

    const durationSec = await getLessonDurationSec(this.lessonId as Types.ObjectId)

    if (durationSec === null) {
        throw new Error('Lesson not found, lesson is not video, videoAsset is not ready, or videoAsset durationSec is not set')
    }

    if (this.timecodeSec > durationSec) {
        throw new Error('timecodeSec must be less than or equal to videoAsset durationSec')
    }
})

export const InteractiveQuestionModel = model('InteractiveQuestion', interactiveQuestionSchema)