import type { VideoAssetDto } from './video-asset'

export const COURSE_STATUSES = ['draft', 'published'] as const

export type CourseStatus = (typeof COURSE_STATUSES)[number]

export const LESSON_TYPES = ['video', 'text'] as const

export type LessonType = (typeof LESSON_TYPES)[number]

export interface LessonDto {
  id: string
  title: string
  description?: string
  order: number
  type: LessonType
  videoAssetId?: string
  videoAsset?: VideoAssetDto
  content?: string
  durationSeconds?: number
  isPreview: boolean
  hasInteractiveQuestions?: boolean
  createdAt: string
  updatedAt: string
}

export interface ModuleDto {
  id: string
  title: string
  description?: string
  order: number
  lessons: LessonDto[]
  createdAt: string
  updatedAt: string
}

export interface CourseDto {
  id: string
  title: string
  slug: string
  shortDescription: string
  description?: string
  status: CourseStatus
  tags: string[]
  thumbnailUrl?: string
  authorId: string
  modules: ModuleDto[]
  createdAt: string
  updatedAt: string
}

export interface CreateLessonRequestDto {
  title: string
  description?: string
  order: number
  type: LessonType
  videoAssetId?: string
  content?: string
  durationSeconds?: number
  isPreview?: boolean
  hasInteractiveQuestions?: boolean
}

export interface CreateModuleRequestDto {
  title: string
  description?: string
  order: number
  lessons?: CreateLessonRequestDto[]
}

export interface CreateCourseRequestDto {
  title: string
  slug: string
  shortDescription: string
  description?: string
  status?: CourseStatus
  tags?: string[]
  thumbnailUrl?: string
  modules?: CreateModuleRequestDto[]
}

export interface UpdateLessonRequestDto {
  id?: string
  title?: string
  description?: string
  order?: number
  type?: LessonType
  videoAssetId?: string
  content?: string
  durationSeconds?: number
  isPreview?: boolean
  hasInteractiveQuestions?: boolean
}

export interface UpdateModuleRequestDto {
  id?: string
  title?: string
  description?: string
  order?: number
  lessons?: UpdateLessonRequestDto[]
}

export interface UpdateCourseRequestDto {
  title?: string
  slug?: string
  shortDescription?: string
  description?: string
  status?: CourseStatus
  tags?: string[]
  thumbnailUrl?: string
  modules?: UpdateModuleRequestDto[]
}

export interface CourseResponseDto {
  course: CourseDto
}

export interface CoursesListResponseDto {
  courses: CourseDto[]
}