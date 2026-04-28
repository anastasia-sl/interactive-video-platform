import { z } from 'zod'
import { COURSE_STATUSES, LESSON_TYPES } from '@interactive-video-platform/shared'

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId')

const lessonSchema = z
    .object({
      id: z.string().min(1).trim().optional(),
      title: z.string().min(2).max(160).trim(),
      description: z.string().max(2000).trim().optional(),
      order: z.number().int().min(0),
      type: z.enum(LESSON_TYPES),
      videoAssetId: objectIdSchema.optional(),
      content: z.string().max(20000).optional(),
      durationSeconds: z.number().int().min(0).optional(),
      isPreview: z.boolean().optional(),
      hasInteractiveQuestions: z.boolean().optional()
    })
    .superRefine((lesson, ctx) => {
      if (lesson.type === 'text' && lesson.videoAssetId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['videoAssetId'],
          message: 'Text lesson cannot have videoAssetId'
        })
      }

      if (lesson.type === 'text' && lesson.hasInteractiveQuestions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hasInteractiveQuestions'],
          message: 'Interactive scenarios are allowed only for video lessons'
        })
      }
    })

const moduleSchema = z.object({
  id: z.string().min(1).trim().optional(),
  title: z.string().min(2).max(160).trim(),
  description: z.string().max(2000).trim().optional(),
  order: z.number().int().min(0),
  lessons: z.array(lessonSchema).optional()
})

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  slug: z
    .string()
    .min(3)
    .max(200)
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().min(10).max(500).trim(),
  description: z.string().max(10000).trim().optional(),
  status: z.enum(COURSE_STATUSES).optional(),
  tags: z.array(z.string().min(1).max(50).trim()).optional(),
  thumbnailUrl: z.url().optional(),
  modules: z.array(moduleSchema).optional()
})

export const updateCourseSchema = createCourseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')