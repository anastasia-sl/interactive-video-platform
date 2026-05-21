import { apiClient } from '../../../shared/api/client'

type CompleteLessonResponse = {
    progress: {
        id: string
        userId: string
        courseId: string
        lessonId: string
        completedAt: string
        lastPlaybackPositionSec: number
    }
}

export const lessonProgressApi = {
    completeLesson: (courseId: string, lessonId: string, lastPlaybackPositionSec = 0) =>
        apiClient<CompleteLessonResponse>(`/api/lesson-progress/courses/${courseId}/lessons/${lessonId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ lastPlaybackPositionSec })
        })
}