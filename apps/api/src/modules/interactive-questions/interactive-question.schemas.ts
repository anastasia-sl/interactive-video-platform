import { z } from 'zod'
import { INTERACTIVE_QUESTION_TYPES } from '@interactive-video-platform/shared'

const questionOptionSchema = z.object({
    id: z.string().min(1).max(100).trim(),
    text: z.string().min(1).max(1000).trim(),
    order: z.number().int().min(0)
})

const baseQuestionObjectSchema = z.object({
    lessonId: z.string().min(1).trim(),
    timecodeSec: z.number().int().min(0),
    order: z.number().int().min(0),
    type: z.enum(INTERACTIVE_QUESTION_TYPES),
    prompt: z.string().min(1).max(2000).trim(),
    description: z.string().max(5000).trim().optional(),
    options: z.array(questionOptionSchema).min(2),
    correctOptionIds: z.array(z.string().min(1).max(100).trim()),
    points: z.number().int().min(0).optional(),
    isRequired: z.boolean().optional(),
    explanation: z.string().max(5000).trim().optional()
})

const validateQuestionData = (
    value: {
        type?: 'single_choice' | 'multiple_choice'
        options?: Array<{ id: string; order: number }>
        correctOptionIds?: string[]
    },
    ctx: z.RefinementCtx
) => {
    if (value.options) {
        if (value.options.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['options'],
                message: 'At least 2 options are required'
            })
        }

        const optionIds = value.options.map((option) => option.id)
        const uniqueOptionIds = new Set(optionIds)

        if (uniqueOptionIds.size !== optionIds.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['options'],
                message: 'Option ids must be unique'
            })
        }

        const optionOrders = value.options.map((option) => option.order)
        const uniqueOrders = new Set(optionOrders)

        if (uniqueOrders.size !== optionOrders.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['options'],
                message: 'Option order values must be unique'
            })
        }

        if (value.correctOptionIds) {
            for (const correctOptionId of value.correctOptionIds) {
                if (!uniqueOptionIds.has(correctOptionId)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['correctOptionIds'],
                        message: 'Every correctOptionId must exist in options'
                    })
                    break
                }
            }
        }
    }

    if (value.type === 'single_choice' && value.correctOptionIds && value.correctOptionIds.length !== 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['correctOptionIds'],
            message: 'single_choice question must contain exactly 1 correct option id'
        })
    }

    if (value.type === 'multiple_choice' && value.correctOptionIds && value.correctOptionIds.length < 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['correctOptionIds'],
            message: 'multiple_choice question must contain at least 1 correct option id'
        })
    }
}

export const createQuestionSchema = baseQuestionObjectSchema.superRefine((value, ctx) => {
    validateQuestionData(value, ctx)
})

export const updateQuestionSchema = baseQuestionObjectSchema
    .omit({ lessonId: true })
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'At least one field is required'
    })
    .superRefine((value, ctx) => {
        validateQuestionData(value, ctx)
    })