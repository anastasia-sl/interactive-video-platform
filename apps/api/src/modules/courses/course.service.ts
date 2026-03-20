import type {
  CourseDto,
  CourseResponseDto,
  CoursesListResponseDto,
  CreateCourseRequestDto,
  UpdateCourseRequestDto,
  ModuleDto,
  LessonDto,
  UserRole
} from '@interactive-video-platform/shared'
import { z } from 'zod'
import { CourseModel } from './course.model'
import { createCourseSchema, updateCourseSchema } from './course.schemas'
import { HttpError } from '../../utils/http-error'

type AuthContext = {
  userId?: string
  role?: UserRole
}

type DbLesson = {
  _id: { toString(): string } | string
  title: string
  description?: string
  order: number
  type: LessonDto['type']
  videoUrl?: string
  content?: string
  durationSeconds?: number
  isPreview: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

type DbModule = {
  _id: { toString(): string } | string
  title: string
  description?: string
  order: number
  lessons: DbLesson[]
  createdAt: Date | string
  updatedAt: Date | string
}

type DbCourse = {
  _id: { toString(): string } | string
  title: string
  slug: string
  shortDescription: string
  description?: string
  status: CourseDto['status']
  tags: string[]
  thumbnailUrl?: string
  authorId: { toString(): string } | string
  modules: DbModule[]
  createdAt: Date | string
  updatedAt: Date | string
}

const toIso = (value: Date | string): string => new Date(value).toISOString()

const toLessonDto = (lesson: DbLesson): LessonDto => {
  return {
    id: lesson._id.toString(),
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    type: lesson.type,
    videoUrl: lesson.videoUrl,
    content: lesson.content,
    durationSeconds: lesson.durationSeconds,
    isPreview: lesson.isPreview,
    createdAt: toIso(lesson.createdAt),
    updatedAt: toIso(lesson.updatedAt)
  }
}

const toModuleDto = (module: DbModule): ModuleDto => {
  return {
    id: module._id.toString(),
    title: module.title,
    description: module.description,
    order: module.order,
    lessons: [...module.lessons].sort((a, b) => a.order - b.order).map(toLessonDto),
    createdAt: toIso(module.createdAt),
    updatedAt: toIso(module.updatedAt)
  }
}

const toCourseDto = (course: DbCourse): CourseDto => {
  return {
    id: course._id.toString(),
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    status: course.status,
    tags: course.tags ?? [],
    thumbnailUrl: course.thumbnailUrl,
    authorId: course.authorId.toString(),
    modules: [...(course.modules ?? [])].sort((a, b) => a.order - b.order).map(toModuleDto),
    createdAt: toIso(course.createdAt),
    updatedAt: toIso(course.updatedAt)
  }
}

const canReadCourse = (course: DbCourse, auth?: AuthContext): boolean => {
  if (course.status === 'published') {
    return true
  }

  if (!auth?.role) {
    return false
  }

  if (auth.role === 'admin') {
    return true
  }

  if (auth.role === 'teacher' && auth.userId && course.authorId.toString() === auth.userId) {
    return true
  }

  return false
}

const canManageCourse = (course: DbCourse, auth: AuthContext): boolean => {
  if (!auth.userId || !auth.role) {
    return false
  }

  if (auth.role === 'admin') {
    return true
  }

  if (auth.role === 'teacher' && course.authorId.toString() === auth.userId) {
    return true
  }

  return false
}

export class CourseService {
  static async getCourses(auth?: AuthContext): Promise<CoursesListResponseDto> {
    if (auth?.role === 'admin') {
      const courses = await CourseModel.find().sort({ createdAt: -1 })
      return { courses: courses.map((course) => toCourseDto(course.toObject() as DbCourse)) }
    }

    if (auth?.role === 'teacher' && auth.userId) {
      const courses = await CourseModel.find({
        $or: [{ status: 'published' }, { authorId: auth.userId }]
      }).sort({ createdAt: -1 })

      return { courses: courses.map((course) => toCourseDto(course.toObject() as DbCourse)) }
    }

    const courses = await CourseModel.find({ status: 'published' }).sort({ createdAt: -1 })

    return { courses: courses.map((course) => toCourseDto(course.toObject() as DbCourse)) }
  }

  static async getCourseById(courseId: string, auth?: AuthContext): Promise<CourseResponseDto> {
    const course = await CourseModel.findById(courseId)

    if (!course) {
      throw new HttpError(404, 'Course not found')
    }

    const courseObject = course.toObject() as DbCourse

    if (!canReadCourse(courseObject, auth)) {
      throw new HttpError(404, 'Course not found')
    }

    return {
      course: toCourseDto(courseObject)
    }
  }

  static async createCourse(
    payload: CreateCourseRequestDto,
    auth: Required<Pick<AuthContext, 'userId' | 'role'>>
  ): Promise<CourseResponseDto> {
    const data = createCourseSchema.parse(payload)

    const existingCourse = await CourseModel.findOne({ slug: data.slug })

    if (existingCourse) {
      throw new HttpError(409, 'Course with this slug already exists')
    }

    const course = await CourseModel.create({
      ...data,
      status: data.status ?? 'draft',
      tags: data.tags ?? [],
      modules: data.modules ?? [],
      authorId: auth.userId
    })

    return {
      course: toCourseDto(course.toObject() as DbCourse)
    }
  }

  static async updateCourse(
    courseId: string,
    payload: UpdateCourseRequestDto,
    auth: Required<Pick<AuthContext, 'userId' | 'role'>>
  ): Promise<CourseResponseDto> {
    const data = updateCourseSchema.parse(payload)

    const course = await CourseModel.findById(courseId)

    if (!course) {
      throw new HttpError(404, 'Course not found')
    }

    const courseObject = course.toObject() as DbCourse

    if (!canManageCourse(courseObject, auth)) {
      throw new HttpError(403, 'Forbidden')
    }

    if (data.slug && data.slug !== course.slug) {
      const existingCourse = await CourseModel.findOne({ slug: data.slug })

      if (existingCourse && existingCourse._id.toString() !== courseId) {
        throw new HttpError(409, 'Course with this slug already exists')
      }
    }

    if (data.title !== undefined) {
      course.title = data.title
    }

    if (data.slug !== undefined) {
      course.slug = data.slug
    }

    if (data.shortDescription !== undefined) {
      course.shortDescription = data.shortDescription
    }

    if (data.description !== undefined) {
      course.description = data.description
    }

    if (data.status !== undefined) {
      course.status = data.status
    }

    if (data.tags !== undefined) {
      course.tags = data.tags
    }

    if (data.thumbnailUrl !== undefined) {
      course.thumbnailUrl = data.thumbnailUrl
    }

    if (data.modules !== undefined) {
      course.set('modules', data.modules)
    }

    await course.save()

    return {
      course: toCourseDto(course.toObject() as DbCourse)
    }
  }

  static async deleteCourse(
    courseId: string,
    auth: Required<Pick<AuthContext, 'userId' | 'role'>>
  ): Promise<void> {
    const course = await CourseModel.findById(courseId)

    if (!course) {
      throw new HttpError(404, 'Course not found')
    }

    const courseObject = course.toObject() as DbCourse

    if (!canManageCourse(courseObject, auth)) {
      throw new HttpError(403, 'Forbidden')
    }

    await course.deleteOne()
  }
}