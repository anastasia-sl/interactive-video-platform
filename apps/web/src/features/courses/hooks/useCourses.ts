import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '../api/courses.api'

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getCourses
  })
}