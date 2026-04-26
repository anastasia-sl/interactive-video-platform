import type { Request, Response } from 'express'
import { InteractiveQuestionsService } from './interactive-questions.service'

export class InteractiveQuestionController {
    static async createQuestion(req: Request, res: Response): Promise<void> {
        const result = await InteractiveQuestionsService.createQuestion(
            {
                ...req.body,
                lessonId: req.params.lessonId as string
            },
            {
                userId: req.auth!.userId,
                role: req.auth!.role
            }
        )

        res.status(201).json(result)
    }

    static async updateQuestion(req: Request, res: Response): Promise<void> {
        const result = await InteractiveQuestionsService.updateQuestion(
            req.params.id as string,
            req.body,
            {
                userId: req.auth!.userId,
                role: req.auth!.role
            }
        )

        res.status(200).json(result)
    }

    static async deleteQuestion(req: Request, res: Response): Promise<void> {
        await InteractiveQuestionsService.deleteQuestion(req.params.id as string, {
            userId: req.auth!.userId,
            role: req.auth!.role
        })

        res.status(204).send()
    }

    static async reorderQuestions(req: Request, res: Response): Promise<void> {
        const result = await InteractiveQuestionsService.reorderQuestions(req.body, {
            userId: req.auth!.userId,
            role: req.auth!.role
        })

        res.status(200).json(result)
    }

    static async getTeacherQuestionsByLesson(req: Request, res: Response): Promise<void> {
        const result = await InteractiveQuestionsService.getTeacherQuestionsByLesson(
            req.params.lessonId as string,
            {
                userId: req.auth!.userId,
                role: req.auth!.role
            }
        )

        res.status(200).json(result)
    }

    static async getStudentQuestionsByLesson(req: Request, res: Response): Promise<void> {
        const result = await InteractiveQuestionsService.getStudentQuestionsByLesson(
            req.params.lessonId as string,
            req.auth
        )

        res.status(200).json(result)
    }

    static async getTeacherQuestionById(req: Request, res: Response): Promise<void> {
        const result = await InteractiveQuestionsService.getTeacherQuestionById(
            req.params.id as string,
            {
                userId: req.auth!.userId,
                role: req.auth!.role
            }
        )

        res.status(200).json(result)
    }
}