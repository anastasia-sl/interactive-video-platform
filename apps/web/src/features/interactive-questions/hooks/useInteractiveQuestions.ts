import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateQuestionDto, UpdateQuestionDto } from '@interactive-video-platform/shared'
import {
    createInteractiveQuestion,
    deleteInteractiveQuestion,
    getStudentQuestionsByLesson,
    getTeacherQuestionsByLesson,
    reorderInteractiveQuestions,
    type ReorderInteractiveQuestionsPayload,
    updateInteractiveQuestion
} from '../api/interactiveQuestionsApi'

export const interactiveQuestionsKeys = {
    all: ['interactive-questions'] as const,
    student: (lessonId: string) =>
        [...interactiveQuestionsKeys.all, 'student', lessonId] as const,
    teacher: (lessonId: string) =>
        [...interactiveQuestionsKeys.all, 'teacher', lessonId] as const
}

export const useStudentQuestions = (lessonId: string, enabled = true) => {
    return useQuery({
        queryKey: interactiveQuestionsKeys.student(lessonId),
        queryFn: () => getStudentQuestionsByLesson(lessonId),
        enabled: Boolean(lessonId) && enabled
    })
}

export const useTeacherQuestions = (lessonId: string) => {
    return useQuery({
        queryKey: interactiveQuestionsKeys.teacher(lessonId),
        queryFn: () => getTeacherQuestionsByLesson(lessonId),
        enabled: Boolean(lessonId)
    })
}

export const useCreateInteractiveQuestion = (lessonId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateQuestionDto) =>
            createInteractiveQuestion(lessonId, payload),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: interactiveQuestionsKeys.teacher(lessonId)
                }),
                queryClient.invalidateQueries({
                    queryKey: interactiveQuestionsKeys.student(lessonId)
                })
            ])
        }
    })
}

export const useUpdateInteractiveQuestion = (lessonId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
                         questionId,
                         payload
                     }: {
            questionId: string
            payload: UpdateQuestionDto
        }) => updateInteractiveQuestion(questionId, payload),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: interactiveQuestionsKeys.teacher(lessonId)
                }),
                queryClient.invalidateQueries({
                    queryKey: interactiveQuestionsKeys.student(lessonId)
                })
            ])
        }
    })
}

export const useDeleteInteractiveQuestion = (lessonId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (questionId: string) => deleteInteractiveQuestion(questionId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: interactiveQuestionsKeys.teacher(lessonId)
                }),
                queryClient.invalidateQueries({
                    queryKey: interactiveQuestionsKeys.student(lessonId)
                })
            ])
        }
    })
}

export const useReorderInteractiveQuestions = (lessonId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: ReorderInteractiveQuestionsPayload) =>
            reorderInteractiveQuestions(payload),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: interactiveQuestionsKeys.teacher(lessonId)
                }),
                queryClient.invalidateQueries({
                    queryKey: interactiveQuestionsKeys.student(lessonId)
                })
            ])
        }
    })
}