import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateCourseRequestDto } from '../../../shared/types/course'
import { coursesApi } from '../api/courses.api'

export const useCreateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCourseRequestDto) => coursesApi.createCourse(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses'] })
    }
  })
}