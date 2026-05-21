import { Types } from 'mongoose'
import { CourseModel } from '../courses/course.model'
import { LessonProgressModel } from './lesson-progress.model'
import { HttpError } from '../../utils/http-error'

const findLessonInCourse = async (courseId: string, lessonId: string) => {
    const course = await CourseModel.findById(courseId)

    if (!course) {
        throw new HttpError(404, 'Course not found')
    }

    if (course.status !== 'published') {
        throw new HttpError(403, 'Course is not available')
    }

    const lesson = course.modules.flatMap((module) => module.lessons).find((item) => String(item._id) === lessonId)

    if (!lesson) {
        throw new HttpError(404, 'Lesson not found in course')
    }

    return { course, lesson }
}

export const LessonProgressService = {
    async completeLesson(userId: string, courseId: string, lessonId: string, lastPlaybackPositionSec = 0) {
        await findLessonInCourse(courseId, lessonId)

        const progress = await LessonProgressModel.findOneAndUpdate(
            {
                userId: new Types.ObjectId(userId),
                courseId: new Types.ObjectId(courseId),
                lessonId: new Types.ObjectId(lessonId)
            },
            {
                $set: {
                    completedAt: new Date(),
                    lastPlaybackPositionSec
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        )

        return {
            id: progress._id.toString(),
            userId: progress.userId.toString(),
            courseId: progress.courseId.toString(),
            lessonId: progress.lessonId.toString(),
            completedAt: progress.completedAt.toISOString(),
            lastPlaybackPositionSec: progress.lastPlaybackPositionSec
        }
    },

    async getCompletedLessonIds(userId: string, courseId: string) {
        const progressItems = await LessonProgressModel.find({
            userId: new Types.ObjectId(userId),
            courseId: new Types.ObjectId(courseId)
        })

        return new Set(progressItems.map((item) => item.lessonId.toString()))
    }
}