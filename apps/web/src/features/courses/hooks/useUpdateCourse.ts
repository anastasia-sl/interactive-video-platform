import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateCourseRequestDto } from '../../../shared/types/course'
import { coursesApi } from '../api/courses.api'

export const useUpdateCourse = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCourseRequestDto) => coursesApi.updateCourse(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses'] })
      void queryClient.invalidateQueries({ queryKey: ['courses', id] })
    }
  })
}