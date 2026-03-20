import { Router } from 'express'
import { CourseController } from './course.controller'
import { asyncHandler } from '../../utils/async-handler'
import { optionalAuth, requireAuth } from '../../middlewares/auth.middleware'
import { requireRole } from '../rbac/roles.middleware'

export const coursesRouter = Router()

coursesRouter.get('/', optionalAuth, asyncHandler(CourseController.getCourses))
coursesRouter.get('/:id', optionalAuth, asyncHandler(CourseController.getCourseById))
coursesRouter.post(
  '/',
  requireAuth,
  requireRole('teacher', 'admin'),
  asyncHandler(CourseController.createCourse)
)
coursesRouter.patch(
  '/:id',
  requireAuth,
  requireRole('teacher', 'admin'),
  asyncHandler(CourseController.updateCourse)
)
coursesRouter.delete(
  '/:id',
  requireAuth,
  requireRole('teacher', 'admin'),
  asyncHandler(CourseController.deleteCourse)
)