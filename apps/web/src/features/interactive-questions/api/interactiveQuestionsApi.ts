import type {
    CreateQuestionDto,
    StudentQuestionDto,
    TeacherQuestionDto,
    UpdateQuestionDto
} from '@interactive-video-platform/shared'
import { apiClient } from '../../../shared/api/client'

type StudentQuestionsResponse = {
    questions: StudentQuestionDto[]
}

type TeacherQuestionsResponse = {
    questions: TeacherQuestionDto[]
}

type TeacherQuestionResponse = {
    question: TeacherQuestionDto
}

export type ReorderInteractiveQuestionsPayload = {
    lessonId: string
    items: Array<{
        id: string
        order: number
    }>
}

export const getStudentQuestionsByLesson = async (lessonId: string) => {
    const response = await apiClient<StudentQuestionsResponse>(
        `/api/interactive-questions/lessons/${lessonId}/questions`
    )

    return response.questions
}

export const getTeacherQuestionsByLesson = async (lessonId: string) => {
    const response = await apiClient<TeacherQuestionsResponse>(
        `/api/interactive-questions/lessons/${lessonId}/questions/editor`
    )

    return response.questions
}

export const createInteractiveQuestion = async (
    lessonId: string,
    payload: CreateQuestionDto
) => {
    const response = await apiClient<TeacherQuestionResponse>(
        `/api/interactive-questions/lessons/${lessonId}/questions`,
        {
            method: 'POST',
            body: JSON.stringify(payload)
        }
    )

    return response.question
}

export const updateInteractiveQuestion = async (
    questionId: string,
    payload: UpdateQuestionDto
) => {
    const response = await apiClient<TeacherQuestionResponse>(
        `/api/interactive-questions/questions/${questionId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(payload)
        }
    )

    return response.question
}

export const deleteInteractiveQuestion = (questionId: string) => {
    return apiClient<void>(`/api/interactive-questions/questions/${questionId}`, {
        method: 'DELETE'
    })
}

export const reorderInteractiveQuestions = async (
    payload: ReorderInteractiveQuestionsPayload
) => {
    const response = await apiClient<TeacherQuestionsResponse>(
        '/api/interactive-questions/questions/reorder',
        {
            method: 'POST',
            body: JSON.stringify(payload)
        }
    )

    return response.questions
}