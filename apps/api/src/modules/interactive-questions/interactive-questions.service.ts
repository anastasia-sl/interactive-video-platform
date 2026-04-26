import type {
    CreateQuestionDto,
    InteractiveQuestionDto,
    QuestionOptionDto,
    StudentQuestionDto,
    TeacherQuestionDto,
    UpdateQuestionDto,
    UserRole
} from '@interactive-video-platform/shared'
import { z } from 'zod'
import { Types } from 'mongoose'
import { CourseModel } from '../courses/course.model'
import { InteractiveQuestionModel } from './interactive-question.model'
import {
    createQuestionSchema,
    updateQuestionSchema
} from './interactive-question.schemas'
import { HttpError } from '../../utils/http-error'

type AuthContext = {
    userId?: string
    role?: UserRole
}

type DbLesson = {
    _id: Types.ObjectId | string
    title: string
    description?: string
    order: number
    type: string
    videoUrl?: string
    content?: string
    durationSeconds?: number
    isPreview: boolean
    createdAt: Date | string
    updatedAt: Date | string
}

type DbModule = {
    _id: Types.ObjectId | string
    title: string
    description?: string
    order: number
    lessons: DbLesson[]
    createdAt: Date | string
    updatedAt: Date | string
}

type DbCourse = {
    _id: Types.ObjectId | string
    title: string
    slug: string
    shortDescription: string
    description?: string
    status: 'draft' | 'published'
    tags: string[]
    thumbnailUrl?: string
    authorId: Types.ObjectId | string
    modules: DbModule[]
    createdAt: Date | string
    updatedAt: Date | string
}

type DbQuestion = {
    _id: Types.ObjectId | string
    lessonId: Types.ObjectId | string
    timecodeSec: number
    order: number
    type: 'single_choice' | 'multiple_choice'
    prompt: string
    description?: string
    options: QuestionOptionDto[]
    correctOptionIds: string[]
    points: number
    isRequired: boolean
    explanation?: string
    createdAt: Date | string
    updatedAt: Date | string
}

const reorderQuestionsSchema = z.object({
    lessonId: z.string().min(1).trim(),
    items: z
        .array(
            z.object({
                id: z.string().min(1).trim(),
                order: z.number().int().min(0)
            })
        )
        .min(1)
}).superRefine((value, ctx) => {
    const ids = value.items.map((item) => item.id)
    const uniqueIds = new Set(ids)

    if (uniqueIds.size !== ids.length) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items'],
            message: 'Question ids must be unique'
        })
    }

    const orders = value.items.map((item) => item.order)
    const uniqueOrders = new Set(orders)

    if (uniqueOrders.size !== orders.length) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items'],
            message: 'Order values must be unique'
        })
    }
})

const toIso = (value: Date | string): string => new Date(value).toISOString()

const toBaseQuestionDto = (question: DbQuestion): InteractiveQuestionDto => {
    return {
        id: question._id.toString(),
        lessonId: question.lessonId.toString(),
        timecodeSec: question.timecodeSec,
        order: question.order,
        type: question.type,
        prompt: question.prompt,
        description: question.description,
        options: [...question.options].sort((a, b) => a.order - b.order),
        points: question.points,
        isRequired: question.isRequired,
        explanation: question.explanation,
        createdAt: toIso(question.createdAt),
        updatedAt: toIso(question.updatedAt)
    }
}

const toTeacherQuestionDto = (question: DbQuestion): TeacherQuestionDto => {
    return {
        ...toBaseQuestionDto(question),
        correctOptionIds: [...question.correctOptionIds]
    }
}

const toStudentQuestionDto = (question: DbQuestion): StudentQuestionDto => {
    return toBaseQuestionDto(question)
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

const findCourseByLessonId = async (lessonId: string): Promise<DbCourse> => {
    if (!Types.ObjectId.isValid(lessonId)) {
        throw new HttpError(400, 'Invalid lesson id')
    }

    const course = await CourseModel.findOne({
        'modules.lessons._id': new Types.ObjectId(lessonId)
    })

    if (!course) {
        throw new HttpError(404, 'Lesson not found')
    }

    return course.toObject() as DbCourse
}

const findLessonInCourse = (course: DbCourse, lessonId: string): DbLesson => {
    for (const moduleItem of course.modules ?? []) {
        const lesson = moduleItem.lessons?.find((item) => item._id.toString() === lessonId)

        if (lesson) {
            return lesson
        }
    }

    throw new HttpError(404, 'Lesson not found')
}

const findQuestionById = async (questionId: string): Promise<DbQuestion> => {
    if (!Types.ObjectId.isValid(questionId)) {
        throw new HttpError(400, 'Invalid question id')
    }

    const question = await InteractiveQuestionModel.findById(questionId)

    if (!question) {
        throw new HttpError(404, 'Question not found')
    }

    return question.toObject() as DbQuestion
}

export class InteractiveQuestionsService {
    static async createQuestion(
        payload: CreateQuestionDto,
        auth: Required<AuthContext>
    ): Promise<{ question: TeacherQuestionDto }> {
        const data = createQuestionSchema.parse(payload)

        const course = await findCourseByLessonId(data.lessonId)

        if (!canManageCourse(course, auth)) {
            throw new HttpError(403, 'Forbidden')
        }

        findLessonInCourse(course, data.lessonId)

        const existingQuestionWithOrder = await InteractiveQuestionModel.findOne({
            lessonId: new Types.ObjectId(data.lessonId),
            order: data.order
        })

        if (existingQuestionWithOrder) {
            throw new HttpError(409, 'Question with this order already exists in the lesson')
        }

        const question = await InteractiveQuestionModel.create({
            lessonId: new Types.ObjectId(data.lessonId),
            timecodeSec: data.timecodeSec,
            order: data.order,
            type: data.type,
            prompt: data.prompt,
            description: data.description,
            options: data.options,
            correctOptionIds: data.correctOptionIds,
            points: data.points ?? 1,
            isRequired: data.isRequired ?? true,
            explanation: data.explanation
        })

        return {
            question: toTeacherQuestionDto(question.toObject() as DbQuestion)
        }
    }

    static async updateQuestion(
        questionId: string,
        payload: UpdateQuestionDto,
        auth: Required<AuthContext>
    ): Promise<{ question: TeacherQuestionDto }> {
        const data = updateQuestionSchema.parse(payload)
        const question = await InteractiveQuestionModel.findById(questionId)

        if (!question) {
            throw new HttpError(404, 'Question not found')
        }

        const course = await findCourseByLessonId(question.lessonId.toString())

        if (!canManageCourse(course, auth)) {
            throw new HttpError(403, 'Forbidden')
        }

        if (data.timecodeSec !== undefined) {
            question.timecodeSec = data.timecodeSec
        }

        if (data.order !== undefined && data.order !== question.order) {
            const existingQuestionWithOrder = await InteractiveQuestionModel.findOne({
                lessonId: question.lessonId,
                order: data.order,
                _id: { $ne: question._id }
            })

            if (existingQuestionWithOrder) {
                throw new HttpError(409, 'Question with this order already exists in the lesson')
            }

            question.order = data.order
        }

        if (data.type !== undefined) {
            question.type = data.type
        }

        if (data.prompt !== undefined) {
            question.prompt = data.prompt
        }

        if (data.description !== undefined) {
            question.description = data.description
        }

        if (data.options !== undefined) {
            question.set('options', data.options)
        }

        if (data.correctOptionIds !== undefined) {
            question.set('correctOptionIds', data.correctOptionIds)
        }

        if (data.points !== undefined) {
            question.points = data.points
        }

        if (data.isRequired !== undefined) {
            question.isRequired = data.isRequired
        }

        if (data.explanation !== undefined) {
            question.explanation = data.explanation
        }

        await question.save()

        return {
            question: toTeacherQuestionDto(question.toObject() as DbQuestion)
        }
    }

    static async deleteQuestion(
        questionId: string,
        auth: Required<AuthContext>
    ): Promise<void> {
        const question = await InteractiveQuestionModel.findById(questionId)

        if (!question) {
            throw new HttpError(404, 'Question not found')
        }

        const course = await findCourseByLessonId(question.lessonId.toString())

        if (!canManageCourse(course, auth)) {
            throw new HttpError(403, 'Forbidden')
        }

        await question.deleteOne()
    }

    static async reorderQuestions(
        payload: {
            lessonId: string
            items: Array<{ id: string; order: number }>
        },
        auth: Required<AuthContext>
    ): Promise<{ questions: TeacherQuestionDto[] }> {
        const data = reorderQuestionsSchema.parse(payload)
        const course = await findCourseByLessonId(data.lessonId)

        if (!canManageCourse(course, auth)) {
            throw new HttpError(403, 'Forbidden')
        }

        findLessonInCourse(course, data.lessonId)

        const existingQuestions = await InteractiveQuestionModel.find({
            lessonId: new Types.ObjectId(data.lessonId)
        }).sort({ order: 1 })

        if (existingQuestions.length !== data.items.length) {
            throw new HttpError(400, 'Reorder payload must contain all lesson questions')
        }

        const existingIds = new Set(existingQuestions.map((item) => item._id.toString()))
        for (const item of data.items) {
            if (!existingIds.has(item.id)) {
                throw new HttpError(400, 'Reorder payload contains question from another lesson or unknown id')
            }
        }

        await Promise.all(
            data.items.map((item) =>
                InteractiveQuestionModel.updateOne(
                    { _id: item.id, lessonId: new Types.ObjectId(data.lessonId) },
                    { $set: { order: item.order } }
                )
            )
        )

        const updatedQuestions = await InteractiveQuestionModel.find({
            lessonId: new Types.ObjectId(data.lessonId)
        }).sort({ order: 1 })

        return {
            questions: updatedQuestions.map((item) =>
                toTeacherQuestionDto(item.toObject() as DbQuestion)
            )
        }
    }

    static async getTeacherQuestionsByLesson(
        lessonId: string,
        auth: Required<AuthContext>
    ): Promise<{ questions: TeacherQuestionDto[] }> {
        const course = await findCourseByLessonId(lessonId)

        if (!canManageCourse(course, auth)) {
            throw new HttpError(403, 'Forbidden')
        }

        findLessonInCourse(course, lessonId)

        const questions = await InteractiveQuestionModel.find({
            lessonId: new Types.ObjectId(lessonId)
        }).sort({ order: 1 })

        return {
            questions: questions.map((item) => toTeacherQuestionDto(item.toObject() as DbQuestion))
        }
    }

    static async getStudentQuestionsByLesson(
        lessonId: string,
        auth?: AuthContext
    ): Promise<{ questions: StudentQuestionDto[] }> {
        const course = await findCourseByLessonId(lessonId)

        if (!canReadCourse(course, auth)) {
            throw new HttpError(404, 'Lesson not found')
        }

        findLessonInCourse(course, lessonId)

        const questions = await InteractiveQuestionModel.find({
            lessonId: new Types.ObjectId(lessonId)
        }).sort({ order: 1 })

        return {
            questions: questions.map((item) => toStudentQuestionDto(item.toObject() as DbQuestion))
        }
    }

    static async getTeacherQuestionById(
        questionId: string,
        auth: Required<AuthContext>
    ): Promise<{ question: TeacherQuestionDto }> {
        const question = await findQuestionById(questionId)
        const course = await findCourseByLessonId(question.lessonId.toString())

        if (!canManageCourse(course, auth)) {
            throw new HttpError(403, 'Forbidden')
        }

        return {
            question: toTeacherQuestionDto(question)
        }
    }
}