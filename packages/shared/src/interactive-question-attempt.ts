export type SubmitQuestionAnswerRequest = {
    questionId: string
    lessonId: string
    selectedOptionIds: string[]
    answeredAtPlaybackSec: number
}

export type SubmitQuestionAnswerResponse = {
    questionAttempt: QuestionAttemptDto
}

export type QuestionAttemptDto = {
    id: string
    questionId: string
    lessonId: string
    selectedOptionIds: string[]
    isCorrect: boolean
    awardedPoints: number
    explanation?: string
    answeredAtPlaybackSec: number
    createdAt: string
}