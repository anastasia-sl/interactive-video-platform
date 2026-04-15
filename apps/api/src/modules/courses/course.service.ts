import type {
  CourseDto,
  CourseResponseDto,
  CoursesListResponseDto,
  CreateCourseRequestDto,
  UpdateCourseRequestDto,
  ModuleDto,
  LessonDto,
  UserRole,
  VideoAssetDto
} from '@interactive-video-platform/shared'
import { CourseModel } from './course.model'
import { createCourseSchema, updateCourseSchema } from './course.schemas'
import { HttpError } from '../../utils/http-error'
import { VideoAssetsService, toVideoAssetDto } from '../video-assets/video-assets.service'

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
  videoAssetId?: { toString(): string } | string
  content?: string
  durationSeconds?: number
  isPreview: boolean
  hasInteractiveQuestions?: boolean
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

type LessonWithAsset = DbLesson & {
  videoAsset?: VideoAssetDto
}

type ModuleWithAssets = Omit<DbModule, 'lessons'> & {
  lessons: LessonWithAsset[]
}

type CourseWithAssets = Omit<DbCourse, 'modules'> & {
  modules: ModuleWithAssets[]
}

const toIso = (value: Date | string): string => new Date(value).toISOString()

const attachVideoAssetsToLessons = async (
    course: DbCourse
): Promise<CourseWithAssets> => {
  const resolvedModules: ModuleWithAssets[] = await Promise.all(
      (course.modules ?? []).map(async (module): Promise<ModuleWithAssets> => {
        const resolvedLessons: LessonWithAsset[] = await Promise.all(
            (module.lessons ?? []).map(async (lesson): Promise<LessonWithAsset> => {
              if (lesson.videoAssetId) {
                const asset = await VideoAssetsService.getById(lesson.videoAssetId.toString())

                return {
                  ...lesson,
                  videoAsset: toVideoAssetDto(asset)
                }
              }

              return {
                ...lesson
              }
            })
        )

        return {
          ...module,
          lessons: resolvedLessons
        }
      })
  )

  return {
    ...course,
    modules: resolvedModules
  }
}

const toLessonDto = (lesson: LessonWithAsset): LessonDto => {
  return {
    id: lesson._id.toString(),
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    type: lesson.type,
    videoAssetId: lesson.videoAssetId?.toString(),
    videoAsset: lesson.videoAsset,
    content: lesson.content,
    durationSeconds: lesson.durationSeconds,
    isPreview: lesson.isPreview,
    hasInteractiveQuestions: lesson.hasInteractiveQuestions ?? false,
    createdAt: toIso(lesson.createdAt),
    updatedAt: toIso(lesson.updatedAt)
  }
}

const toModuleDto = (module: ModuleWithAssets): ModuleDto => {
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

const toCourseDto = (course: CourseWithAssets): CourseDto => {
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

const validateLessonsVideoAssets = async (
    modules: NonNullable<CreateCourseRequestDto['modules'] | UpdateCourseRequestDto['modules']>
): Promise<void> => {
  for (const module of modules) {
    for (const lesson of module.lessons ?? []) {
      if (lesson.type === 'video' && lesson.videoAssetId) {
        await VideoAssetsService.getById(lesson.videoAssetId)
      }

      if (lesson.hasInteractiveQuestions) {
        if (lesson.type !== 'video') {
          throw new HttpError(400, 'Interactive scenarios are allowed only for video lessons')
        }

        if (!lesson.videoAssetId) {
          throw new HttpError(400, 'Interactive video lesson must reference videoAssetId')
        }

        await VideoAssetsService.validateReady(lesson.videoAssetId)
      }
    }
  }
}


class CourseService {
  static async getCourses(auth?: AuthContext): Promise<CoursesListResponseDto> {
    if (auth?.role === 'admin') {
      const courses = await CourseModel.find().sort({ createdAt: -1 })
      const mapped = await Promise.all(
          courses.map(async (course) => {
            const courseWithAssets = await attachVideoAssetsToLessons(course.toObject() as DbCourse)
            return toCourseDto(courseWithAssets)
          })
      )

      return { courses: mapped }
    }

    if (auth?.role === 'teacher' && auth.userId) {
      const courses = await CourseModel.find({
        $or: [{ status: 'published' }, { authorId: auth.userId }]
      }).sort({ createdAt: -1 })

      const mapped = await Promise.all(
          courses.map(async (course) => {
            const courseWithAssets = await attachVideoAssetsToLessons(course.toObject() as DbCourse)
            return toCourseDto(courseWithAssets)
          })
      )

      return { courses: mapped }
    }

    const courses = await CourseModel.find({ status: 'published' }).sort({ createdAt: -1 })

    const mapped = await Promise.all(
        courses.map(async (course) => {
          const courseWithAssets = await attachVideoAssetsToLessons(course.toObject() as DbCourse)
          return toCourseDto(courseWithAssets)
        })
    )

    return { courses: mapped }
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


    const courseWithAssets = await attachVideoAssetsToLessons(courseObject)

    return {
      course: toCourseDto(courseWithAssets)
    }
  }

  static async createCourse(
    payload: CreateCourseRequestDto,
    auth: Required<AuthContext>
  ): Promise<CourseResponseDto> {
    const data = createCourseSchema.parse(payload)

    const existingCourse = await CourseModel.findOne({ slug: data.slug })

    if (existingCourse) {
      throw new HttpError(409, 'Course with this slug already exists')
    }

    if (data.modules) {
      await validateLessonsVideoAssets(data.modules)
    }

    const course = await CourseModel.create({
      ...data,
      status: data.status ?? 'draft',
      tags: data.tags ?? [],
      modules: data.modules ?? [],
      authorId: auth.userId
    })

    const courseWithAssets = await attachVideoAssetsToLessons(course.toObject() as DbCourse)

    return { course: toCourseDto(courseWithAssets) }
  }

  static async updateCourse(
    courseId: string,
    payload: UpdateCourseRequestDto,
    auth: Required<AuthContext>
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
    if (data.modules) {
      await validateLessonsVideoAssets(data.modules)
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

    const courseWithAssets = await attachVideoAssetsToLessons(course.toObject() as DbCourse)

    return { course: toCourseDto(courseWithAssets) }
  }

  static async deleteCourse(
    courseId: string,
    auth: Required<AuthContext>
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

export default CourseService