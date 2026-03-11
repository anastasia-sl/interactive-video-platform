import type { Request, Response } from 'express'
import { AuthService } from './auth.service'

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const result = await AuthService.register(req.body)
    res.status(201).json(result)
  }

  static async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body)
    res.status(200).json(result)
  }

  static async me(req: Request, res: Response): Promise<void> {
    const result = await AuthService.me(req.auth!.userId)
    res.status(200).json(result)
  }

  static async adminOnly(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      message: 'Admin access granted'
    })
  }

  static async teacherOrAdmin(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      message: 'Teacher or admin access granted'
    })
  }
}