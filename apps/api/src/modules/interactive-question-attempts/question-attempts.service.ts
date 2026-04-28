import type {
    QuestionAttemptDto,
    SubmitQuestionAnswerRequest,
    SubmitQuestionAnswerResponse
} from '@interactive-video-platform/shared'
import { Types } from 'mongoose'
import { HttpError } from '../../utils/http-error'
import { InteractiveQuestionModel } from '../interactive-questions/interactive-question.model'
import { QuestionAttemptModel, type QuestionAttemptDocument } from './question-attempt.model'
import { submitQuestionAnswerSchema } from './question-attempt.schemas'

type AuthContext = {
    userId: string
}

type DbQuestion = {
    _id: Types.ObjectId | string
    lessonId: Types.ObjectId | string
    correctOptionIds: string[]
    points: number
    explanation?: string
}

const toIso = (value: Date | string): string => new Date(value).toISOString()

const normalizeIds = (ids: string[]) => {
    return [...ids].sort()
}

const compareOptionIds = (left: string[], right: string[]) => {
    const normalizedLeft = normalizeIds(left)
    const normalizedRight = normalizeIds(right)

    if (normalizedLeft.length !== normalizedRight.length) {
        return false
    }

    return normalizedLeft.every((item, index) => item === normalizedRight[index])
}

const toQuestionAttemptDto = (attempt: QuestionAttemptDocument): QuestionAttemptDto => {
    return {
        id: attempt._id.toString(),
        questionId: attempt.questionId.toString(),
        lessonId: attempt.lessonId.toString(),
        selectedOptionIds: attempt.selectedOptionIds,
        isCorrect: attempt.isCorrect,
        awardedPoints: attempt.awardedPoints,
        explanation: attempt.explanation || undefined,
        answeredAtPlaybackSec: attempt.answeredAtPlaybackSec,
        createdAt: toIso(attempt.createdAt)
    }
}

export class QuestionAttemptsService {
    static async submitAnswer(
        payload: SubmitQuestionAnswerRequest,
        auth: AuthContext
    ): Promise<SubmitQuestionAnswerResponse> {
        const data = submitQuestionAnswerSchema.parse(payload)

        if (!Types.ObjectId.isValid(data.questionId)) {
            throw new HttpError(400, 'Invalid question id')
        }

        if (!Types.ObjectId.isValid(data.lessonId)) {
            throw new HttpError(400, 'Invalid lesson id')
        }

        const question = await InteractiveQuestionModel.findById(data.questionId)

        if (!question) {
            throw new HttpError(404, 'Question not found')
        }

        const questionObject = question.toObject() as DbQuestion

        if (questionObject.lessonId.toString() !== data.lessonId) {
            throw new HttpError(400, 'Question does not belong to this lesson')
        }

        const isCorrect = compareOptionIds(
            data.selectedOptionIds,
            questionObject.correctOptionIds
        )

        const attempt = await QuestionAttemptModel.create({
            userId: new Types.ObjectId(auth.userId),
            lessonId: new Types.ObjectId(data.lessonId),
            questionId: new Types.ObjectId(data.questionId),
            selectedOptionIds: data.selectedOptionIds,
            isCorrect,
            awardedPoints: isCorrect ? questionObject.points : 0,
            explanation: questionObject.explanation ?? '',
            answeredAtPlaybackSec: data.answeredAtPlaybackSec
        })

        return {
            questionAttempt: toQuestionAttemptDto(attempt.toObject() as QuestionAttemptDocument)
        }
    }
}