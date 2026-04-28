import { z } from 'zod'

export const submitQuestionAnswerSchema = z.object({
    questionId: z.string().min(1).trim(),
    lessonId: z.string().min(1).trim(),
    selectedOptionIds: z.array(z.string().min(1).trim()).min(1),
    answeredAtPlaybackSec: z.number().min(0)
})