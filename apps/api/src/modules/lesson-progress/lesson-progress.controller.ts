import type { Request, Response } from 'express'
import { LessonProgressService } from './lesson-progress.service'

const getParam = (value: string | string[] | undefined, name: string) => {
    if (!value || Array.isArray(value)) {
        throw new Error(`Invalid ${name}`)
    }

    return value
}

export const LessonProgressController = {
    async completeLesson(req: Request, res: Response) {
        const courseId = getParam(req.params.courseId, 'courseId')
        const lessonId = getParam(req.params.lessonId, 'lessonId')
        const lastPlaybackPositionSec =
            typeof req.body?.lastPlaybackPositionSec === 'number' ? req.body.lastPlaybackPositionSec : 0

        const progress = await LessonProgressService.completeLesson(
            req.auth!.userId,
            courseId,
            lessonId,
            lastPlaybackPositionSec
        )

        res.status(200).json({ progress })
    }
}