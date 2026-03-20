import type { Request, Response } from 'express'
import { CourseService } from './course.service'

export class CourseController {
  static async getCourses(req: Request, res: Response): Promise<void> {
    const result = await CourseService.getCourses(req.auth)
    res.status(200).json(result)
  }

  static async getCourseById(req: Request, res: Response): Promise<void> {
    const result = await CourseService.getCourseById(req.params.id as string, req.auth)
    res.status(200).json(result)
  }

  static async createCourse(req: Request, res: Response): Promise<void> {
    const result = await CourseService.createCourse(req.body, {
      userId: req.auth!.userId,
      role: req.auth!.role
    })

    res.status(201).json(result)
  }

  static async updateCourse(req: Request, res: Response): Promise<void> {
    const result = await CourseService.updateCourse(req.params.id as string, req.body, {
      userId: req.auth!.userId,
      role: req.auth!.role
    })

    res.status(200).json(result)
  }

  static async deleteCourse(req: Request, res: Response): Promise<void> {
    await CourseService.deleteCourse(req.params.id as string, {
      userId: req.auth!.userId,
      role: req.auth!.role
    })

    res.status(204).send()
  }
}