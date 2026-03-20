import { Schema, model } from 'mongoose'
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
    videoUrl: {
      type: String,
      trim: true
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
    }
  },
  {
    timestamps: true
  }
)

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