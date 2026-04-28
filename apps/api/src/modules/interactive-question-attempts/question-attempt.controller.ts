import type { Request, Response } from 'express'
import { QuestionAttemptsService } from './question-attempts.service'

export class QuestionAttemptController {
    static async submitAnswer(req: Request, res: Response): Promise<void> {
        const result = await QuestionAttemptsService.submitAnswer(req.body, {
            userId: req.auth!.userId
        })

        res.status(201).json(result)
    }
}