import { useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonProgressApi } from '../api/lessonProgress.api'

type UseCompleteLessonParams = {
    courseId: string
    lessonId: string
}

export const useCompleteLesson = ({ courseId, lessonId }: UseCompleteLessonParams) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (lastPlaybackPositionSec?: number) =>
            lessonProgressApi.completeLesson(courseId, lessonId, lastPlaybackPositionSec ?? 0),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificate-eligibility', courseId] })
        }
    })
}