import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../utils/http-error'

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message
    })
  }

  console.error(error)

  return res.status(500).json({
    message: 'Internal server error'
  })
}