import { Schema, model, Types } from 'mongoose'
import { COURSE_STATUSES, LESSON_TYPES } from '@interactive-video-platform/shared'

const lessonSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: LESSON_TYPES,
      required: true,
      default: 'video'
    },
      videoAssetId: {
        type: Schema.Types.ObjectId,
          ref: 'VideoAsset'
      },
    content: {
      type: String,
      trim: true
    },
    durationSeconds: {
      type: Number,
      min: 0
    },
    isPreview: {
      type: Boolean,
      default: false
    },
      hasInteractiveQuestions: {
        type: Boolean,
          default: false
    }
  },
  {
    timestamps: true
  }
)

lessonSchema.pre('validate', function (next) {
    const lesson = this as {
        type: 'video' | 'text'
        videoAssetId?: Types.ObjectId
        hasInteractiveQuestions?: boolean
    }

    if (lesson.type !== 'video') {
        if (lesson.hasInteractiveQuestions) {
            next(new Error('Interactive scenarios are allowed only for video lessons'))
            return
        }

        lesson.videoAssetId = undefined
    }

    next()
})

const moduleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    lessons: {
      type: [lessonSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: COURSE_STATUSES,
      required: true,
      default: 'draft',
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    thumbnailUrl: {
      type: String,
      trim: true
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    modules: {
      type: [moduleSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

export const CourseModel = model('Course', courseSchema)