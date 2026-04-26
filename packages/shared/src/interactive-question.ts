export const INTERACTIVE_QUESTION_TYPES = ['single_choice', 'multiple_choice'] as const

export type InteractiveQuestionType = (typeof INTERACTIVE_QUESTION_TYPES)[number]

export interface QuestionOptionDto {
    id: string
    text: string
    order: number
}

export interface InteractiveQuestionDto {
    id: string
    lessonId: string
    timecodeSec: number
    order: number
    type: InteractiveQuestionType
    prompt: string
    description?: string
    options: QuestionOptionDto[]
    points: number
    isRequired: boolean
    explanation?: string
    createdAt: string
    updatedAt: string
}

export interface TeacherQuestionDto extends InteractiveQuestionDto {
    correctOptionIds: string[]
}

export interface StudentQuestionDto extends InteractiveQuestionDto {}

export interface CreateQuestionDto {
    lessonId: string
    timecodeSec: number
    order: number
    type: InteractiveQuestionType
    prompt: string
    description?: string
    options: QuestionOptionDto[]
    correctOptionIds: string[]
    points?: number
    isRequired?: boolean
    explanation?: string
}

export interface UpdateQuestionDto {
    timecodeSec?: number
    order?: number
    type?: InteractiveQuestionType
    prompt?: string
    description?: string
    options?: QuestionOptionDto[]
    correctOptionIds?: string[]
    points?: number
    isRequired?: boolean
    explanation?: string
}