import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '../api/courses.api'

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesApi.getCourseById(id),
    enabled: Boolean(id)
  })
}