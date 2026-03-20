import { useMutation, useQueryClient } from '@tanstack/react-query'
import { coursesApi } from '../api/courses.api'

export const useDeleteCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => coursesApi.deleteCourse(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses'] })
    }
  })
}