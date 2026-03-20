import type {
  CourseResponseDto,
  CoursesListResponseDto,
  CreateCourseRequestDto,
  UpdateCourseRequestDto
} from '../../../shared/types/course'
import { apiClient } from '../../../shared/api/client'

export const coursesApi = {
  getCourses() {
    return apiClient<CoursesListResponseDto>('/api/courses')
  },
  getCourseById(id: string) {
    return apiClient<CourseResponseDto>(`/api/courses/${id}`)
  },
  createCourse(payload: CreateCourseRequestDto) {
    return apiClient<CourseResponseDto>('/api/courses', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  updateCourse(id: string, payload: UpdateCourseRequestDto) {
    return apiClient<CourseResponseDto>(`/api/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
  },
  deleteCourse(id: string) {
    return apiClient<void>(`/api/courses/${id}`, {
      method: 'DELETE'
    })
  }
}